import cv2
import os
import tkinter as tk
from tkinter import filedialog
import sqlite3
from PIL import Image
import numpy as np

work_dir = 'OCR/Training/training_images'
training_work_dir = 'OCR/Training'
training_database = "training_data.db"
database_full_path = os.path.join(training_work_dir, training_database)
image_dir = 'OCR/Training/Data Acquisition/Data/Screenshots'


def load_and_display_image(image_path):
    # Load an image and set up the display
    img = cv2.imread(image_path)
    return img

def list_files(directory):
    # Lists all files in the given directory
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
    # sort the files to ensure that they are always in the same order
    files.sort()
    return files

def save_coordinates_to_sql(coordinates_list, area_name):
    _save_coordinates_to_sql(coordinates_list, database_full_path, area_name) # Simple wrapper function to save the coordinates to the trainingSQLite database

def _save_coordinates_to_sql(coordinates_list, db_file, area_name):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    area_name = str(area_name)
    # Iterate over the coordinates list and insert each coordinate into the database
    try:
        c.execute("DELETE FROM parking_space WHERE area_name = ?", (area_name,))
    except sqlite3.Error as e:
        print("SQL Error :", e)

    for i, row in enumerate(coordinates_list):
        # Prepare the coordinates as a string
        coordinates = str(row[0][0]) + "," + str(row[0][1]) + "," + str(row[1][0]) + "," + str(row[1][1])
        
        # Insert the coordinates into the database
        try:
            c.execute("INSERT INTO parking_space (area_name, space_coordinates_id, space_coordinates) VALUES (?, ?, ?)",
                      (area_name, i, coordinates))
            print("Coordinates saved to", db_file)
        except sqlite3.OperationalError:
            print("Database is locked. Please close any process using it and try again.")
            break
    # Commit the changes and close the connection
    conn.commit()
    conn.close()

def select_file():
    # Open a file dialog to select the image file
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename()
    return file_path

def convertCoordinatesToList(sql_coordinates):
    # Convert the SQL coordinates string to a list of tuples
    coordinates_list = []
    for row in sql_coordinates:
        coordinates = row[0].split(',')
        coordinates_list.append([(int(coordinates[0]), int(coordinates[1])), (int(coordinates[2]), int(coordinates[3]))])
    return coordinates_list

def load_coordinates(image_path):
    return _load_coordinates(database_full_path, image_path)

def _load_coordinates(db_file, image_path):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    # Query the database for the coordinates of the specified area
    try:
        c.execute("""
            SELECT ps.space_coordinates
            FROM images_area ia
            JOIN parking_space ps ON ia.area_name = ps.area_name
            WHERE ia.image_path = ?
        """, (image_path,))
    except sqlite3.Error as e:
        print("SQLite Error: ", e)


    # Fetch the results
    results = c.fetchall()
    coordinates_list = convertCoordinatesToList(results)

    # Close the connection to the database
    conn.close()

    return coordinates_list

def bindImageToArea(area_name, image_name):
    _bindImageToArea(database_full_path, area_name, image_name)

def _bindImageToArea(db_file, area_name, image_name):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    try:
        # Remove the image if it is already bound to another area
        c.execute("DELETE FROM images_area WHERE image_path = ?", (image_name,))
        # Insert the area name and image path into the database
        c.execute("INSERT INTO images_area (area_name, image_path) VALUES (?, ?)",
                (area_name, image_name))
    #except sqlite3.OperationalError:
    #    print("Database is locked. Please close any process using it and try again.")
    #    # print data about the error itself
    except sqlite3.Error as e:
        print("SQLite Error: ", e)
    # catch other errors
    except Exception as e:
        print("Unexpected Error: ", e)


    # Commit the changes and close the connection
    conn.commit()
    conn.close()

 
def loadImage(image_path):
    return _loadImage(database_full_path, image_path)

def _loadImage(db_file, image_path):
    # Load the image
    img = Image.open(image_path)

    # Load the coordinates
    coordinates_list = _load_coordinates(db_file, image_path)

    # List to hold the cropped images
    cropped_images = []

    # Iterate over the coordinates
    for coordinates in coordinates_list:
        # Crop the image using the coordinates
        cropped_img = img.crop((coordinates[0][0], coordinates[0][1], coordinates[1][0], coordinates[1][1]))
        # Append the cropped image to the list
        cropped_images.append(cropped_img)

    # Return the list of cropped images
    return cropped_images

def update_parking_occupation_data(image_path, coordinate_id, car_presence):
    return _update_parking_occupation_data(database_full_path, image_path, coordinate_id, car_presence)

def _update_parking_occupation_data(db_file, image_path, coordinate_id, car_presence):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    # First, get the image_id from the images_area table
    try:
        c.execute("SELECT image_id FROM images_area WHERE image_path = ?", (image_path,))
    except sqlite3.Error as e:
        print("SQLite Error: ", e)
    result = c.fetchone()
    if result is None:
        print(f"No image found with path {image_path}")
        return
    image_id = result[0]

    # Convert the car_presence boolean to an integer (SQLite doesn't have a native boolean type)
    car_presence_int = 1 if car_presence else 0

    # Now, insert or update the parking_occupation_data table
    try:
        c.execute("""
            INSERT INTO parking_occupation_data (image_id, coordinate_id, car_presence)
            VALUES (?, ?, ?)
            ON CONFLICT(image_id, coordinate_id) DO UPDATE SET car_presence = ?
        """, (image_id, coordinate_id, car_presence_int, car_presence_int))
    except sqlite3.Error as e:
        print("SQLite Error: ", e)

    # Commit the changes
    conn.commit()









"""def load_coordinates(xml_file, parking_space_id, coordinates_list):
    # Load the coordinates from the xml file
    tree = ET.parse(xml_file)
    root = tree.getroot()
    for parking_spaces in root:
        if parking_spaces.attrib['id'] == parking_space_id:
            for space in parking_spaces:
                print(space[0].text.split(','))
                top_left_x_coord, top_left_y_coord = [int(x) for x in space[0].text.split(',')]
                bottom_right_x_coord, bottom_right_y_coord = [int(x) for x in space[1].text.split(',')]
                coordinates_list.append([(top_left_x_coord, top_left_y_coord), (bottom_right_x_coord, bottom_right_y_coord)])
    return coordinates_list"""