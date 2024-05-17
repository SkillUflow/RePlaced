import sqlite3
import numpy as np
from PIL import Image
from core_functions import *
import tensorflow as tf
from sklearn.model_selection import train_test_split
import datetime

size = (64, 64)

def preprocess_image(image):
    image = np.float32(image)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Resize the image
    resized = cv2.resize(gray, size)

    # Apply Gaussian blur
    blur = cv2.GaussianBlur(resized, (3, 3), 0)

    # Normalize the image (to scale pixel values between 0 and 1)
    normalized = blur / 255.0

    return normalized

def load_data_for_training():
    # Load the data from the SQLite database
    images, boxes = _load_data_for_training(database_full_path)

    # Preprocess the images
    images = [preprocess_image(img) for img in images]

    # Expand dimensions of the images, necessary for the model
    images = np.expand_dims(images, axis=-1)

    # Split the dataset into a training set and a test set
    images_train, images_test, boxes_train, boxes_test = train_test_split(images, boxes, test_size=0.2, random_state=42)

    # Now you can create separate TensorFlow Datasets for training and testing
    train_dataset = tf.data.Dataset.from_tensor_slices((images_train, boxes_train))

    # One-hot encode the labels
    train_dataset = train_dataset.map(lambda x, y: (x, tf.one_hot(y, depth=1)))

    # Batch the data
    batch_size = 32
    train_dataset = train_dataset.batch(batch_size)

    test_dataset = tf.data.Dataset.from_tensor_slices((images_test, boxes_test))

    # One-hot encode the labels
    test_dataset = test_dataset.map(lambda x, y: (x, tf.one_hot(y, depth=1)))

    # Batch the data
    test_dataset = test_dataset.batch(batch_size)

    return train_dataset, test_dataset

def _load_data_for_training(db_file):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    # Query the database to join the necessary tables
    c.execute("""
        SELECT 
            images_area.image_path, 
            parking_space.space_coordinates,
            parking_occupation_data.car_presence
        FROM 
            parking_occupation_data 
        JOIN 
            images_area ON parking_occupation_data.image_id = images_area.image_id 
        JOIN 
            parking_space ON parking_occupation_data.coordinate_id = parking_space.space_coordinates_id
    """)

    # Lists to hold the images, bounding boxes, and labels
    images = []
    boxes = []
    # Iterate over the query results
    for row in c.fetchall():
        # Load the image and normalize it to [0,1]
        image_path = row[0]
        #image_path = image_path.replace("originals", "processed")
        img = Image.open(image_path)
        img = np.array(img) / 255.0
        images.append(img)

        # Parse the coordinates string into a tuple of integers
        coordinates = tuple(map(int, row[1].split(',')))
        car_presence = row[2]
        boxes.append(car_presence)

    # Close the connection to the database
    conn.close()

    return images, boxes


def train_model(train_dataset):
    # Load the training data

    # Define the model
    model = tf.keras.models.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', padding="same", input_shape=(*size, 1)),  # Grayscale images have 1 channel
    tf.keras.layers.MaxPooling2D((1, 1)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding="same"),
    tf.keras.layers.MaxPooling2D((1, 1)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding="same"),
    tf.keras.layers.MaxPooling2D((1, 1)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding="same"),
    tf.keras.layers.MaxPooling2D((1, 1)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding="same"),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid'),  # Adjusted number of units
])

    # Compile the model
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # Train the model
    inputs, targets = next(iter(train_dataset))
    print('Inputs shape:', inputs.shape)
    print('Targets shape:', targets.shape)
    model.fit(train_dataset, epochs=7)

    return model

if __name__ == "__main__":
    # Load the training data
    train_dataset, test_dataset = load_data_for_training()

    # Train the model
    model = train_model(train_dataset)

    # test the model
    test_loss, test_acc = model.evaluate(test_dataset)
    print('Test accuracy:', test_acc)



    # Save the model
    now_str = datetime.datetime.now().isoformat().replace(":", "")


    save_path =  'OCR/Training/models/parking_occupation_model_' + now_str + '.keras'
    model.save(save_path)
    print("Model saved as ", save_path)