import sqlite3
import numpy as np
from PIL import Image
from core_functions import *
import tensorflow as tf
from sklearn.model_selection import train_test_split

def load_data_for_training():
    # Load the data from the SQLite database
    images, boxes, labels = _load_data_for_training(database_full_path)
    # Split the dataset into a training set and a test set
    images_train, images_test, boxes_train, boxes_test, labels_train, labels_test = train_test_split(images, boxes, labels, test_size=0.2, random_state=42)

    # Now you can create separate TensorFlow Datasets for training and testing
    train_dataset = tf.data.Dataset.from_tensor_slices((images_train, boxes_train, labels_train))
    test_dataset = tf.data.Dataset.from_tensor_slices((images_test, boxes_test, labels_test))
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
    labels = []

    # Iterate over the query results
    for row in c.fetchall():
        # Load the image and normalize it to [0,1]
        img = Image.open(row[0])
        img = np.array(img) / 255.0
        images.append(img)

        # Parse the coordinates string into a tuple of integers
        coordinates = tuple(map(int, row[1].split(',')))
        boxes.append([(coordinates[0], coordinates[1]), (coordinates[2], coordinates[3])])

        # Append the label
        labels.append(row[2])

    # Close the connection to the database
    conn.close()

    return images, boxes, labels


def train_model(train_dataset):
    # Load the training data

    # Define the model
    model = tf.keras.models.Sequential([
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(100, 100, 3)),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])

    # Compile the model
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # Train the model
    model.fit(train_dataset, epochs=10)

    return model

# Load the training data
train_dataset, test_dataset = load_data_for_training()

# Train the model
model = train_model(train_dataset)

# test the model
test_loss, test_acc = model.evaluate(test_dataset)
print('Test accuracy:', test_acc)



# Save the model
model.save('parking_occupation_model.h5')
print("Model saved as parking_occupation_model.h5")