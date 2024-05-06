import matplotlib.pyplot as plt
from PIL import Image
import os

work_dir = 'OCR/Training/training_images'

def list_files(directory):
    # Lists all files in the given directory
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
    return files

# Replace 'path_to_directory' with the path to your directory
file_list = list_files(work_dir)
print(file_list)

def onclick(event):
    # Event handler for mouse clicks; prints the coordinates of the click
    ix, iy = event.xdata, event.ydata
    print(f'Coordinates: x={ix}, y={iy}')

def load_and_display_image(image_path):
    # Load an image and set up the display
    img = Image.open(image_path)
    fig, ax = plt.subplots()
    ax.imshow(img)
    cid = fig.canvas.mpl_connect('button_press_event', onclick)
    plt.show()

# Replace 'path_to_image.jpg' with the path to your image file
load_and_display_image(os.path.join(work_dir, file_list[0]))

while True:
    if cv2.waitKey(22) & 0xFF == ord('q'):
            break