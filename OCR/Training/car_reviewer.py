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
area_name = os.path.basename(os.path.dirname(os.path.dirname(image_path))) # Given that the file structure is always the same, we know that the name of the folder of the folder of the image is the area name
#find all images in the folder
image_list = list_files(os.path.dirname(image_path))
current_image_index = image_list.index(os.path.basename(image_path))
starting_image_index = current_image_index
image_dir = os.path.join(image_dir, area_name)
image_dir = os.path.join(image_dir, "originals").replace("\\", "/")



# Dynamic part (for each image in the folder)
save_requested = False
while current_image_index < len(image_list):
    image_path = os.path.join(image_dir, image_list[current_image_index]).replace("\\", "/")
    bindImageToArea(area_name, image_path) # We begin by associating the selected image to the area in the database
    cropped_images = loadImage(image_path)
    i = 0
    while i < len(cropped_images):
        part = cropped_images[i] # We could have done an enumerate but we need to be able to go back to the previous image if the user wants to cancel the last input
        part = cv2.cvtColor(np.array(part), cv2.COLOR_RGB2BGR)
        part_h, part_w = part.shape[:2]
        part_h = min(part_h*8, 1080)
        part_w = min(part_w*8, 1920)
        part = cv2.resize(part, (part_w, part_h), interpolation=cv2.INTER_AREA)

        cv2.imshow(f'Part {i}', part)
        # If user press the 'y' key, we update the parking_occupation_data table with the car presence. If he press 'n' we update it with the absence of car
        key_pressed = ''
        while key_pressed not in [ord('y'), ord('n'), ord('s'), ord('z'), ord('i')]:
            key_pressed = cv2.waitKey(0)

        if key_pressed == ord('y'):
            car_presence = True
        elif key_pressed == ord('n'):
            car_presence = False
        elif key_pressed == ord('s'):
            print("Current image:", image_list[current_image_index])
            save_requested = True
            break # If the user press 's', we stop the process at where it is, and show the current file name for continuation
        elif key_pressed == ord('z'):
            # Cancel the last input
            if i > 0:
                i -= 1
            elif current_image_index > starting_image_index: # If we were already at the first parking spot of the image
                current_image_index -= 1 # We go back to the previous image
                i = len(cropped_images) - 1 # To the last parking spot
            else:
                print("No previous input to cancel")
            cv2.destroyAllWindows()
            continue # We skip over the update of the parking_occupation_data table since it will be overwritten right afterwards    
        elif key_pressed == ord('i'):
            # Display various information about the current image and progression
            print("Current image:", image_list[current_image_index])
            print("Current parking spot:", i+1, "/", len(cropped_images))
            print("Progression:", current_image_index - starting_image_index + 1, "/", len(image_list) - starting_image_index)
            progress_ratio = (current_image_index - starting_image_index + 1) / (len(image_list) - starting_image_index)
            print("[", end='')
            for i in range(1, 21):
                if progress_ratio >= i / 20:
                    print("█", end='')
                else:
                    print(" ", end='')
            print("]")
            cv2.destroyAllWindows()
            continue
             
        update_parking_occupation_data(image_path, i, car_presence)
        cv2.destroyAllWindows()
        i += 1
    if save_requested:
        break
    current_image_index += 1

print("All images in the folder have been processed. Thanks for having cooked")
print("Your payment of", (current_image_index - starting_image_index) * 0.01, "$ has been sent to your bank account.")


cv2.destroyAllWindows()