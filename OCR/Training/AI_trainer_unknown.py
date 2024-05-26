import sqlite3
import numpy as np
from PIL import Image
from core_functions import *
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.metrics import FBetaScore
import datetime
import math

size = (64, 64)
batch_size = 16
epochs_number = 5
database_old_path = 'OCR/Training/training_data.db'
database_new_path = 'OCR/Training/trimmed_training_data.db'
metrics = ['accuracy', 'recall', FBetaScore(threshold=0.5, beta=2.0)]



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

def reshape_labels(data, label):
        label = tf.cast(label, tf.int32)
        label = tf.clip_by_value(label, 0, 2)
        label = tf.reshape(label, [-1])
        return data, tf.one_hot(label, depth=3)

def _load_data_for_training(db_file, batch_size=32, mode='train'):
    while True:
        # Calculate the number of rows for training and testing
        c = sqlite3.connect(db_file).cursor()
        # Query the database to get the total number of rows
        c.execute("SELECT COUNT(*) FROM parking_occupation_data")
        total_rows = c.fetchone()[0]
        c.close()
        train_rows = int(total_rows * 0.9)
        test_rows = total_rows - train_rows

        num_batches = train_rows // batch_size

        # Loop over the batches
        for i in range(num_batches):
            # Connect to the SQLite database
            conn = sqlite3.connect(db_file)
            c = conn.cursor()
            # Query the database to get a batch of data
            c.execute("""SELECT 
                    images_area.image_path, 
                    parking_space.space_coordinates,
                    parking_occupation_data.car_presence
                FROM 
                    parking_occupation_data 
                JOIN 
                    images_area ON parking_occupation_data.image_id = images_area.image_id 
                JOIN 
                    parking_space ON parking_occupation_data.coordinate_id = parking_space.space_coordinates_id
                ORDER BY RANDOM()
                LIMIT ? OFFSET ?""", (batch_size, i * batch_size))
            batch_data = c.fetchall()
            images = []
            labels = []

            for row in batch_data:
                # Load the image and normalize it to [0,1]
                image_path = str(row[0])
                if(os.path.exists(image_path) == False):
                    continue
                img = Image.open(image_path)
                coordinates = tuple(map(int, row[1].split(',')))
                img = img.crop(coordinates)
                images.append(preprocess_image(img))
                car_presence = int(row[2])
                labels.append(car_presence)
                yield images, labels

def train_model(train_dataset, metric, database_path):
    length = size[0]

    # Define the model
    model = tf.keras.models.Sequential()
    model.add(tf.keras.layers.Input(shape=(*size, 1)))

    # Add the first Conv2D layer separately because it needs an input_shape parameter
    model.add(tf.keras.layers.Conv2D(length, (5, 5), activation='relu', padding="same", input_shape=(*size, 1)))

    # Add the remaining Conv2D layers in a loop
    for _ in range(1): # TO REPLACE WITH 20 ONCE DEBUG IS OVER
        model.add(tf.keras.layers.Conv2D(length, (5, 5), activation='relu', padding="same"))
        model.add(tf.keras.layers.BatchNormalization())
        model.add(tf.keras.layers.Dropout(0.25))  

    # Add the remaining layers
    model.add(tf.keras.layers.Flatten())
    model.add(tf.keras.layers.Dense(length, activation='relu'))
    model.add(tf.keras.layers.BatchNormalization())
    model.add(tf.keras.layers.Dropout(0.5))
    model.add(tf.keras.layers.Dense(length, activation='relu'))

    model.add(tf.keras.layers.Dense(3, activation='softmax'))


    #model.summary() # Uncomment to display the model summary, DEBUG

    # Compile the model
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=[metric])
    # Calculate the number of steps per epoch
    c = sqlite3.connect(database_path).cursor()
    total_rows = c.execute("SELECT COUNT(*) FROM parking_occupation_data").fetchone()[0]
    c.close()
    train_rows = int(total_rows)
    steps_per_epoch = train_rows // batch_size
    print('Steps per epoch:', steps_per_epoch)
    print("total_rows: ", total_rows)

    model.fit(train_dataset, epochs=epochs_number, steps_per_epoch=steps_per_epoch)
    return model

if __name__ == "__main__":
    for metric in metrics:
        for database_path in [database_old_path]:
            # Load the training data
            train_dataset, test_dataset = load_data_for_training(database_path)
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