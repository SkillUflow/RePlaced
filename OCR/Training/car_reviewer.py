from core_functions import *
import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os


"""
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
    first_iteration = False"""






image_path = select_file()
image_path = os.path.join(work_dir, os.path.relpath(image_path, work_dir))
print("give area name :") 
if (image_path == ''): # If no file was selected, we exit
    print("No file selected. Exiting.")
    exit()
area_name = input()
bindImageToArea(area_name, image_path)
cropped_images = loadImage(image_path)
#display it
for i, part in enumerate(cropped_images):
    part = cv2.cvtColor(np.array(part), cv2.COLOR_RGB2BGR)
    cv2.imshow(f'Part {i}', part)
    # If user press the 'y' key, we update the parking_occupation_data table with the car presence. If he press 'n' we update it with the absence of car
    key_pressed = ''
    while key_pressed != ord('y') and key_pressed != ord('n'):
        key_pressed = cv2.waitKey(0)

    if key_pressed == ord('y'):
        car_presence = True
    else:
        car_presence = False

    update_parking_occupation_data(image_path, i, car_presence)
    
    cv2.destroyAllWindows()




cv2.waitKey(0)
cv2.destroyAllWindows()