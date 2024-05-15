from core_functions import *
import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os


# Static part (close and reopen the software if you want to change folder/area name)
image_path = select_file()
image_path = os.path.join(image_dir, os.path.relpath(image_path, image_dir)).replace("\\", "/")
if (image_path == ''): # If no file was selected, we exit
    print("No file selected. Exiting.")
    exit()
print("give area name (for the entire folder) :") 
area_name = input().strip()
#find all images in the folder
image_list = list_files(os.path.dirname(image_path))
current_image_index = image_list.index(os.path.basename(image_path))
starting_image_index = current_image_index
image_dir = os.path.join(image_dir, area_name)
image_dir = os.path.join(image_dir, "originals").replace("\\", "/")



# Dynamic part (for each image in the folder)
while current_image_index < len(image_list):
    image_path = os.path.join(image_dir, image_list[current_image_index]).replace("\\", "/")
    bindImageToArea(area_name, image_path)
    cropped_images = loadImage(image_path)
    #display it
    for i, part in enumerate(cropped_images):
        part = cv2.cvtColor(np.array(part), cv2.COLOR_RGB2BGR)
        part_h, part_w = part.shape[:2]
        part_h = min(part_h*8, 1080)
        part_w = min(part_w*8, 1920)
        part = cv2.resize(part, (part_w, part_h), interpolation=cv2.INTER_AREA)

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
    current_image_index += 1

print("All images in the folder have been processed. Thanks for having cooked")
print("Your payment of", (len(image_list) - starting_image_index) * 0.01, "$ has been sent to your bank account.")


cv2.waitKey(0)
cv2.destroyAllWindows()