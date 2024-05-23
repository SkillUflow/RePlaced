import tensorflow as tf
from PIL import Image
import numpy as np
from tkinter import filedialog
import sqlite3
from core_functions import *
import cv2
from AI_trainer_ultimate import preprocess_image

# Load the model
all_models = list_files('OCR/Training/models')
model = tf.keras.models.load_model('OCR/Training/models/' + all_models[-1])
database_old_path = 'OCR/Training/training_data.db'
database_path = database_full_path

def predict_car(img):
    # Load the image
    img_array = np.uint8(preprocess_image(img) * 255)

    # Predict the class of the image
    img_array = np.expand_dims(img_array, axis=(0, -1))
    prediction = model.predict(img_array, verbose=1)
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
    area_name = os.path.basename(os.path.dirname(os.path.dirname(file_path)))
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
            parking_space.area_name = ?
""", (area_name,))
    # Fetch the result
    result = c.fetchall()
    result = list(set(result)) # delete duplicates
    total_spots = len(result)
    available_spots_count = total_spots
    image_list = []
    certainty_list = []
    car_presence_list = []
    if result == []:
        print("The image does not contain any parking spots. Have you forgotten to cut it? Try using ̀`square_placer.py`")
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
        image_list.append(cropped_img)
        certainty_list.append(current_certainty)
        car_presence_list.append(car_presence)
    return available_spots_count, total_spots, certainty_list, image_list, car_presence_list




# Test the function

# Load an image
image_path = filedialog.askopenfilename(title="Select the image file").replace('\\', '/')
area_name = os.path.basename(os.path.dirname(os.path.dirname(image_path))) # Given that the file structure is always the same, we know that the name of the folder of the folder of the image is the area name
available_spots_count, total_spots, certainty_list, image_list, car_presence_list = get_parking_space_picture(database_full_path, image_path)
if image_list == []:
    print("No image found. Are you sure you bound the image? (using `car_reviewer.py` or a recent version of `square_placer.py`)")
    exit()
# show the images
for i in range(len(image_list)):
    img = image_list[i]
    image_array = np.array(img)
    part_h, part_w = image_array.shape[:2]
    part_h = min(part_h*8, 1080)
    part_w = min(part_w*8, 1920)
    part = cv2.resize(image_array, (part_w, part_h), interpolation=cv2.INTER_AREA)
    cv2.imshow('parking spot image ' + str(i), part)
    part = np.uint8(preprocess_image(part) * 255)
    cv2.imshow('treated image ' + str(i), part)
    print("Car presence:", car_presence_list[i])
    print("Certainty of the prediction:", certainty_list[i])
    # wait for the user to close the image
    cv2.waitKey(0)
    cv2.destroyAllWindows()
