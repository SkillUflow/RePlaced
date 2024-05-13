from core_functions import *
import matplotlib.pyplot as plt
from PIL import Image
import cv2
import os
import xml.etree.cElementTree as ET
from tkinter import Tk
from tkinter.filedialog import askopenfilename

def sort_images():
    # Dictionary to store the sorted images
    sorted_images = {}

    while True:
        # Hide the root Tk window
        root = Tk()
        root.withdraw()

        # Ask the user to select a file
        file = askopenfilename()

        root.update()
        

        # If the user didn't select a file, break the loop
        if not file:
            break

        # Display the image
        #img = Image.open(file)
        #img.show()

        # Ask the user to select an area for the image
        print("Select an area for this image:")
        area = input()

        # If the area is not in the sorted images dictionary, add it
        if area not in sorted_images:
            sorted_images[area] = []

        # Add the image to the selected area
        sorted_images[area].append(file)

        # Close the image
        #img.close()

    return sorted_images

sorted_images = sort_images()

# Print the sorted images
for area, images in sorted_images.items():
    print("Area:", area)
    for image in images:
        print("  Image:", image)