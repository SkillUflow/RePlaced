from core_functions import *
import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os

# Select the first image
image_path = select_file()
if (image_path == ''): # If no file was selected, we exit
    print("No file selected. Exiting.")
    exit()
current_image_parts = loadImage(image_path)

print(image_path)




first_iteration = True
cv2.namedWindow('frame')

while True:
    if cv2.getWindowProperty('frame', cv2.WND_PROP_VISIBLE) < 1 and not first_iteration:
        break
    display_image = current_image.copy()
    for row in coordinates_list:
        if len(row) == 2:
            cv2.rectangle(display_image, row[0], row[1], (0, 255, 255), 1)
    cv2.imshow('frame', display_image)
    if cv2.waitKey(22) & 0xFF == ord('s'): # We save all the input coordinates to the xml file
        end_input()
        break # TO DELETE
    # if key 'z' is pressed we delete the last input
    if cv2.waitKey(22) & 0xFF == ord('z') and coordinates_list != []:
        coordinates_list.pop()
        print("Last input deleted")

    # load speicifc area if key 'l' is pressed
    if cv2.waitKey(22) & 0xFF == ord('l'):
        print("Give the name/id of the area recorded by this parking space :")
        parking_space_id = input()
        load_coordinates(parking_space_id, coordinates_list)
    first_iteration = False