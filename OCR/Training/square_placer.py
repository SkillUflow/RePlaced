from core_functions import *
import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os
coordinates_list = [] # List to store the coordinates of every parking rectangle in the image

def list_files(directory):
    # Lists all files in the given directory
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
    return files

# Replace 'path_to_directory' with the path to your directory
#file_list = list_files(work_dir)
#print(file_list)

def onclick(event, x, y, flags, param):
    if event != cv2.EVENT_LBUTTONDOWN:
        return
    # Event handler for mouse clicks; prints the coordinates of the click and adds them to the list
    print(x, y)
    if coordinates_list == [] or len(coordinates_list[-1]) == 2: # If the list is empty or the last element has 2 coordinates, we start a new set
        coordinates_list.append([(x, y)]) 
    else:
        coordinates_list[-1].append((x, y))



def end_input():
    # End the input process  
    coordinates_list.sort(key=lambda x: x[0][0])  # We sort coordinates by x value of the top left corner so that they the places ID always follow the same logic
    print("Give the name/id of the area recorded by this parking space :")
    parking_space_id = input()
    save_coordinates_to_sql(coordinates_list, parking_space_id)
    # TO ADD : SWAP TO NEXT IMAGE
    plt.close()

# Select the first image
image_path = select_file()
if (image_path == ''): # If no file was selected, we exit
    print("No file selected. Exiting.")
    exit()
current_image = load_and_display_image(os.path.join(work_dir, image_path))

first_iteration = True
cv2.namedWindow('frame')
cv2.setMouseCallback('frame', onclick) # Set up the mouse click event handler

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