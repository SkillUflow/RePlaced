import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os
import xml.etree.cElementTree as ET
import csv
import tkinter as tk
from tkinter import filedialog


work_dir = 'OCR/Training/training_images'
csv_file = 'coordinates.csv'
csv_full_path = os.path.join(work_dir, csv_file)
xml_file = 'parking_spaces.xml'
xml_full_path = os.path.join(work_dir, xml_file)

coordinates_list = [] # List to store the coordinates of every parking rectangle in the image


def list_files(directory):
    # Lists all files in the given directory
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
    return files

# Replace 'path_to_directory' with the path to your directory
file_list = list_files(work_dir)
print(file_list)

def onclick(event, x, y, flags, param):
    if event != cv2.EVENT_LBUTTONDOWN:
        return
    # Event handler for mouse clicks; prints the coordinates of the click and adds them to the list
    print(x, y)
    if coordinates_list == [] or len(coordinates_list[-1]) == 2: # If the list is empty or the last element has 2 coordinates, we start a new set
        coordinates_list.append([(x, y)]) 
    else:
        coordinates_list[-1].append((x, y))

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

def end_input():
    # End the input process  
    coordinates_list.sort(key=lambda x: x[0][0])  # We sort coordinates by x value of the top left corner so that they the places ID always follow the same logic
    print("Give the name/id of the area recorded by this parking space :")
    parking_space_id = input()
    save_coordinates_to_xml(coordinates_list, xml_full_path, parking_space_id)
    # TO ADD : SWAP TO NEXT IMAGE
    plt.close()

# Select the first image
image_path = select_file()
current_image = load_and_display_image(os.path.join(work_dir, image_path))

first_iteration = True
cv2.namedWindow('frame')
cv2.setMouseCallback('frame', onclick) # Set up the mouse click event handler

while True:
    if cv2.getWindowProperty('frame', cv2.WND_PROP_VISIBLE) < 1 and not first_iteration:
        break
    for row in coordinates_list:
        if len(row) == 2:
            cv2.rectangle(current_image, row[0], row[1], (0, 255, 255), 1)
    cv2.imshow('frame', current_image)
    if cv2.waitKey(22) & 0xFF == ord('e'): # We save all the input coordinates to the csv and get to the next picture
        end_input()
        break # TO DELETE
    first_iteration = False