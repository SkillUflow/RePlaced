import cv2
import xml.etree.cElementTree as ET
import csv
import os
import tkinter as tk
from tkinter import filedialog

work_dir = 'OCR/Training/training_images'
csv_file = 'coordinates.csv'
csv_full_path = os.path.join(work_dir, csv_file)
xml_file = 'parking_spaces.xml'
xml_full_path = os.path.join(work_dir, xml_file)


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

def select_file():
    # Open a file dialog to select the image file
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename()
    return file_path

def load_coordinates(xml_file, parking_space_id, coordinates_list):
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
    return coordinates_list