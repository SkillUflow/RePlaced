import sqlite3
import numpy as np
from PIL import Image
from core_functions import *
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.metrics import FBetaScore
import datetime
import math

size = (10, 10)
batch_size = 16
database_old_path = 'OCR/Training/training_data.db'
database_new_path = 'OCR/Training/trimmed_training_data.db'
metrics = [FBetaScore(threshold=0.5, beta=2.0), 'accuracy', 'recall',]



def preprocess_image(image):
    # Convert the image to float32 using TensorFlow operation
    image = tf.cast(image, tf.float32)

    # Convert the image to grayscale
    gray = tf.image.rgb_to_grayscale(image)

    # Resize the image
    resized = tf.image.resize(gray, size)

    # Normalize the image
    normalized = resized / 255.0

    # blur the image
    blurred = tf.py_function(lambda x: cv2.GaussianBlur(x.numpy(), (5, 5), 0), [normalized], tf.float32) # It blurs, don't worry about it (if you worry about it, it uses py_function with a lambda to call cv2.GaussianBlur without breaking the tf pipeline)
    blurred = tf.reshape(blurred, (*size, 1))

    return blurred

def load_data_for_training(database_path):
    batch_size = 32

    # Create a generator for the training data
    train_data_generator = _load_data_for_training(database_path, batch_size, 'train')

    # Create a TensorFlow Dataset from the generator
    train_dataset = tf.data.Dataset.from_generator(
        lambda: train_data_generator,
        output_signature=(
            tf.TensorSpec(shape=(None, *size, 1), dtype=tf.float32),
            tf.TensorSpec(shape=(None,), dtype=tf.int32)
        )
    )

    # Preprocess the images and one-hot encode the labels
    train_dataset = train_dataset.map(reshape_labels)

    # Create a generator for the test data
    test_data_generator = _load_data_for_training(database_path, batch_size, 'test')

    # Create a TensorFlow Dataset from the generator
    test_dataset = tf.data.Dataset.from_generator(
        lambda: test_data_generator,
        output_signature=(
            tf.TensorSpec(shape=(None, *size, 1), dtype=tf.float32),
            tf.TensorSpec(shape=(None,), dtype=tf.int32)
        )
    )

    # Preprocess the images and one-hot encode the labels
    test_dataset = test_dataset.map(reshape_labels)

    return train_dataset, test_dataset

def reshape_labels(image, label):
    return image, tf.keras.utils.to_categorical(label, num_classes=3)

def _load_data_for_training(db_file, batch_size=32, mode='train'):
    while True:
        # Calculate the number of rows for training and testing
        c = sqlite3.connect(db_file).cursor()
        # Query the database to get the total number of rows
        c.execute("SELECT COUNT(*) FROM parking_occupation_data")
        total_rows = c.fetchone()[0]
        train_rows = int(total_rows * 0.9)
        test_rows = total_rows - train_rows

        num_batches = train_rows // batch_size

        # Loop over the batches
        for i in range(num_batches):
            # Query the database to get a batch of data
            c.execute(f"SELECT * FROM parking_occupation_data LIMIT {batch_size} OFFSET {i * batch_size}")
            batch_data = c.fetchall()

            # Separate the images and labels
            images = [row[0] for row in batch_data]
            labels = [row[1] for row in batch_data]  # Update this line to handle the new "unknown" class

            # Preprocess the images
            images = [preprocess_image(image) for image in images]

            yield images, labels

def train_model(train_dataset, metric, database_path):
    length = size[0]

    # Define the model
    model = tf.keras.models.Sequential()

    # Add the first Conv2D layer separately because it needs an input_shape parameter
    model.add(tf.keras.layers.Conv2D(length, (5, 5), activation='relu', padding="same", input_shape=(*size, 1)))

    # Add the remaining Conv2D layers in a loop
    for _ in range(20):
        model.add(tf.keras.layers.Conv2D(length, (5, 5), activation='relu', padding="same"))
        model.add(tf.keras.layers.BatchNormalization())
        model.add(tf.keras.layers.Dropout(0.25))  

    # Add the remaining layers
    model.add(tf.keras.layers.Flatten())
    model.add(tf.keras.layers.Dense(length, activation='relu'))
    model.add(tf.keras.layers.BatchNormalization())
    model.add(tf.keras.layers.Dropout(0.5))
    model.add(tf.keras.layers.Dense(3, activation='softmax'))

    # Compile the model
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=[metric])
    # Calculate the number of steps per epoch
    c = sqlite3.connect(database_path).cursor()
    total_rows = c.execute("SELECT COUNT(*) FROM parking_occupation_data").fetchone()[0]
    c.close()
    epochs_number = 15
    train_rows = int(total_rows)
    steps_per_epoch = train_rows // batch_size
    print('Steps per epoch:', steps_per_epoch)
    print("total_rows: ", total_rows)

    def reshape_labels(data, label):
        return data, tf.reshape(label, [-1, 1])
    train_dataset = train_dataset.map(reshape_labels)

    model.fit(train_dataset, epochs=epochs_number, steps_per_epoch=steps_per_epoch)
    return model

if __name__ == "__main__":
    for metric in metrics:
        for database_path in [database_old_path]:
            # Load the training data
            train_dataset, test_dataset = load_data_for_training(database_path)
            train_dataset = train_dataset.map(reshape_labels)
            test_dataset = test_dataset.map(reshape_labels)

            # Repeat and shuffle the training data
            #train_dataset = train_dataset.shuffle(buffer_size=1024)
            train_dataset = train_dataset.repeat()

            # Train the model
            model = train_model(train_dataset, metric, database_path)

            # Save the model
            now_str = datetime.datetime.now().isoformat().replace(":", "")

            if not os.path.exists('OCR/Training/models'):
                os.makedirs('OCR/Training/models') # Ensure the directory exists (it tends to get deleted by git since the keras files aren't pushed)

            save_path =  'OCR/Training/models/parking_occupation_model_' + now_str + '.keras'
            model.save(save_path)
            print("Model saved as ", save_path)

            # test the model
            #c = sqlite3.connect(database_path).cursor()
            #total_rows = c.execute("SELECT COUNT(*) FROM parking_occupation_data").fetchone()[0]
            #c.close()
            #test_loss, test_acc = model.evaluate(test_dataset, steps=math.ceil(0.1 * total_rows / batch_size))
            #print('Test accuracy:', test_acc)
            #print('Test loss:', test_loss)