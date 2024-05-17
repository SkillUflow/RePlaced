import tensorflow as tf
from PIL import Image
import numpy as np
from tkinter import filedialog
import sqlite3
from core_functions import *
import cv2
from AI_trainer import preprocess_image

# Load the model
#model_path = filedialog.askopenfilename(title="Select the model file")
model_path = 'OCR/Training/models/parking_occupation_model_2024-05-17T133330.042996.keras'
model = tf.keras.models.load_model(model_path)

def predict_car(img):
    # Load the image
    img_array = preprocess_image(img)

    # Predict the class of the image
    img_array = np.expand_dims(img_array, axis=(0, -1))
    prediction = model.predict(img_array)
    predicted_class = (prediction > 0.5).astype("int32")

    if predicted_class == 0:
        print("The image does not contain a car.")
    else:
        print("The image contains a car.")
    # print various data, such as the confidence of the prediction
    print("Certainty of the prediction:", abs(prediction[0][0] - 0.5) * 2) # The closer to 1 or 0, the more certain the model is of its prediction, so we calculate the difference from 0.5 (and multiply by two to get a percentage)



def get_parking_space_picture(db_file, space_coordinates_id, area_name):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    # Query the database to get the image path and bounding box for the specified parking space
    c.execute("""
        SELECT 
            images_area.image_path,
            parking_space.space_coordinates
        FROM 
            parking_occupation_data 
        JOIN 
            images_area ON parking_occupation_data.image_id = images_area.image_id 
        JOIN 
            parking_space ON parking_occupation_data.coordinate_id = parking_space.space_coordinates_id
        WHERE
            parking_space.space_coordinates_id = ? AND
            images_area.area_name = ?
""", (space_coordinates_id, area_name))

    # Fetch the result
    result = c.fetchone()

    # If no result was found, return None
    if result is None:
        print(f"No image found for parking space {space_coordinates_id}")
        return None

    # Otherwise, open and crop the image
    image_path, space_coordinates = result
    img = Image.open(image_path)
    # Parse the coordinates string into a tuple of integers
    coordinates = tuple(map(int, space_coordinates.split(',')))
    cropped_img = img.crop(coordinates)
    return cropped_img




# Test the function

# Load an image
image_path = filedialog.askopenfilename(title="Select the image file")
area_name = os.path.basename(os.path.dirname(os.path.dirname(image_path))) # Given that the file structure is always the same, we know that the name of the folder of the folder of the image is the area name
img = get_parking_space_picture(database_full_path, 3, area_name)
if img is None:
    print("No image found. Are you sure you bound the image? (using `car_reviewer.py` or a recent version of `square_placer.py`)")
    exit()
# show the image
image_array = np.array(img)

part_h, part_w = image_array.shape[:2]
part_h = min(part_h*8, 1080)
part_w = min(part_w*8, 1920)
part = cv2.resize(image_array, (part_w, part_h), interpolation=cv2.INTER_AREA)


cv2.imshow('parking spot image', part)
part = preprocess_image(part)
cv2.imshow('treated image', part)
predict_car(img)
# wait for the user to close the image
cv2.waitKey(0)
cv2.destroyAllWindows()
