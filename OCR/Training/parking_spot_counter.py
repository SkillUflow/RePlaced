from core_functions import *
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
from PIL import Image
import numpy as np
from tkinter import filedialog
import sqlite3
from AI_trainer import preprocess_image

def predict_car(img):
    # Load the image
    img_array = np.uint8(preprocess_image(img) * 255)

    # Predict the class of the image
    img_array = np.expand_dims(img_array, axis=(0, -1))
    prediction = model.predict(img_array, verbose=0)
    predicted_class = (prediction > 0.5).astype("int32")

    #if predicted_class == 0:
    #    print("The image does not contain a car.")
    #else:
    #    print("The image contains a car.")
    # print various data, such as the confidence of the prediction
    #print("Certainty of the prediction:", abs(prediction[0][0] - 0.5) * 2) # The closer to 1 or 0, the more certain the model is of its prediction, so we calculate the difference from 0.5 (and multiply by two to get a percentage)
    car_presence = predicted_class[0][0]
    certainty = abs(prediction[0][0] - 0.5) * 2
    if not car_presence and certainty < 0.9:
        car_presence = 1 # We need to be certain that the spot is free
    return car_presence, certainty



def get_parking_space_picture(db_file, file_path):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    # Query the database to get the image path and bounding box for the specified parking space
    c.execute("""
        SELECT 
            parking_space.space_coordinates
        FROM 
            parking_occupation_data 
        JOIN 
            images_area ON parking_occupation_data.image_id = images_area.image_id 
        JOIN 
            parking_space ON parking_occupation_data.coordinate_id = parking_space.space_coordinates_id
        WHERE
            parking_space.area_name = images_area.area_name AND
            images_area.image_path = ?
""", (file_path,))
    # Fetch the result
    result = c.fetchall()
    result = list(set(result)) # delete duplicates
    total_spots = len(result)
    available_spots_count = total_spots
    certainty_list = []
    if result == []:
        print("The image does not contain any parking spots. Have you forgotten to cut it? Try using ̀square_placer.py`")
        return -1
    for row in result:
        # Otherwise, open and crop the image
        space_coordinates = row[0]
        img = Image.open(file_path)
        # Parse the coordinates string into a tuple of integers
        coordinates = tuple(map(int, space_coordinates.split(',')))
        cropped_img = img.crop(coordinates)
        car_presence, current_certainty = predict_car(cropped_img)
        available_spots_count -= car_presence
        certainty_list.append(current_certainty)
    return available_spots_count, total_spots, certainty_list



# Load an image
image_path = filedialog.askopenfilename(title="Select the image file")
if image_path == '':
    print("No file selected. Exiting.")
    exit()
relative_path = os.path.relpath(image_path, os.getcwd())
all_models = list_files('OCR/Training/models')

all_models = ["parking_occupation_model_2024-05-20T065946.301807.keras"] # currently testing this one

for current_model in all_models:
    # Load the model
    model_path = 'OCR/Training/models/' + current_model
    model = tf.keras.models.load_model(model_path)

    parking_spot_count, total_sports, certainty_list = get_parking_space_picture(database_full_path, relative_path)
    if parking_spot_count == -1:
        exit()
    print("The number of parking spots in the image is:", parking_spot_count, "out of", total_sports, "as found by the model", current_model,". Certainty list:", certainty_list)