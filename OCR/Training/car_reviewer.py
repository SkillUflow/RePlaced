from core_functions import *
import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os

image_dir = 'OCR\\Training\\Data Acquisition\\Data\\Screenshots';


# Static part (close and reopen the software if you want to change folder/area name)
image_path = select_file()
image_path = os.path.join(image_dir, os.path.relpath(image_path, image_dir))
print("give area name (for the entire folder) :") 
if (image_path == ''): # If no file was selected, we exit
    print("No file selected. Exiting.")
    exit()
area_name = input()
#find all images in the folder
image_list = list_files(os.path.dirname(image_path))
current_image_index = image_list.index(os.path.basename(image_path))
starting_image_index = current_image_index



# Dynamic part (for each image in the folder)
while current_image_index < len(image_list):
    image_dir = os.path.join(image_dir, area_name)
    image_dir = os.path.join(image_dir, "originals")
    image_path = os.path.join(image_dir, image_list[current_image_index])
    bindImageToArea(area_name, image_path)
    cropped_images = loadImage(image_path)
    #display it
    for i, part in enumerate(cropped_images):
        part = cv2.cvtColor(np.array(part), cv2.COLOR_RGB2BGR)
        part = cv2.resize(part, (300, 300), interpolation=cv2.INTER_AREA)
        # transform the image a bit to make it more readable, with blur and sharpening
        part = cv2.GaussianBlur(part, (9, 9), 0)
        part = cv2.addWeighted(part, 1.5, part, -0.5, 0)





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