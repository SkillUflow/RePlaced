import os
import glob
import shutil

# Specify the directory and file type
base_directory = 'OCR/Training/Data Acquisition/Data/Screenshots'
file_type = '*.jpg'  # change to the type of your images

# Get a list of all subdirectories in the base directory
subdirectories = [base_directory + '/' + x + '/originals/' for x in os.listdir(base_directory)]

for directory in subdirectories:
    # Get a list of all image files in the directory
    image_files = glob.glob((directory + '/' + file_type))
    image_files = [x.replace('\\', '/') for x in image_files]

    # Sort the files to ensure they are processed in a sequential order

    # Loop over the files and delete every third one
    for i, file in enumerate(image_files):
        if (i + 1) % 3 == 0:  # +1 because enumerate starts from 0
            os.remove(file) # Delete 3/4 of the files

# Delete all the OCR/Training/Data Acquisition/Data/Screenshots/*/processed/ directories
#processed_directories = [base_directory + '/' + x + '/processed/' for x in os.listdir(base_directory)]
#for directory in processed_directories:
#    shutil.rmtree(directory)
    