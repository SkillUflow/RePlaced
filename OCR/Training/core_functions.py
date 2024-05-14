import cv2
import xml.etree.cElementTree as ET
import csv
import os
import tkinter as tk
from tkinter import filedialog
import sqlite3
from PIL import Image
import numpy as np

work_dir = 'OCR/Training/training_images'
training_work_dir = 'OCR/Training'
csv_file = 'coordinates.csv'
csv_full_path = os.path.join(work_dir, csv_file)
xml_file = 'parking_spaces.xml'
xml_full_path = os.path.join(work_dir, xml_file)
training_database = "training_data.db"
database_full_path = os.path.join(training_work_dir, training_database)


def load_and_display_image(image_path):
    # Load an image and set up the display
    img = cv2.imread(image_path)
    return img

def save_coordinates_to_csv(coordinates_list, csv_file):
    # Save the coordinates to a csv file
    with open(csv_file, 'w', newline='') as file:
        writer = csv.writer(file)
        for row in coordinates_list:
            writer.writerow(row[0] + row[1])
        print(coordinates_list)
    print("Coordinates saved to", csv_file)

def save_coordinates_to_xml(coordinates_list, xml_file, parking_space_id):
    # First we delete the previous data for this area if it already exists
    tree = ET.parse(xml_file)
    root = tree.getroot()
    for child in root:
        if child.attrib['id'] == parking_space_id:
            root.remove(child)
    # Then we write the new data
    parking_spaces = ET.SubElement(root, "parking_spaces", id=parking_space_id)
    for i, row in enumerate(coordinates_list):
        parking_space = ET.SubElement(parking_spaces, "space", id=str(i))
        point1 = ET.SubElement(parking_space, "top_left")
        point1.text = str(row[0][0]) + "," + str(row[0][1])
        point2 = ET.SubElement(parking_space, "bottom_right")
        point2.text = str(row[1][0]) + "," + str(row[1][1])
    tree.write(xml_file)
    print("Coordinates saved to", xml_file)

def save_coordinates_to_sql(coordinates_list, area_name):
    _save_coordinates_to_sql(coordinates_list, database_full_path, area_name) # Simple wrapper function to save the coordinates to the trainingSQLite database

def _save_coordinates_to_sql(coordinates_list, db_file, area_name):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()

    # Iterate over the coordinates list and insert each coordinate into the database
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
    c.execute("""
        SELECT ps.space_coordinates
        FROM images_area ia
        JOIN parking_space ps ON ia.area_name = ps.area_name
        WHERE ia.image_path = ?
    """, (os.path.basename(image_path),))

    # Fetch the results
    results = c.fetchall()
    coordinates_list = convertCoordinatesToList(results)

    # Close the connection to the database
    conn.close()

    print("Coordinates loaded from", db_file)
    return coordinates_list

def bindImageToArea(area_name, image_name):
    _bindImageToArea(database_full_path, area_name, image_name)

def _bindImageToArea(db_file, area_name, image_name):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    image_name = os.path.basename(image_name)

    try:
        # Remove the image if it is already bound to another area
        c.execute("DELETE FROM images_area WHERE image_path = ?", (image_name,))
        # Insert the area name and image path into the database
        c.execute("INSERT INTO images_area (area_name, image_path) VALUES (?, ?)",
                (area_name, image_name))
        print("Image bound to area in", db_file)
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