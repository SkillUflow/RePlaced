from core_functions import *
from PIL import Image
import numpy as np

coordinates_list = []



def extract_image_parts(image, coordinates):
    # Convert the numpy array image to a PIL image
    image = Image.fromarray(np.uint8(image))
    # Extract parts of the image
    parts = []
    for coord in coordinates:
        part = image.crop((coord[0][0], coord[0][1], coord[1][0], coord[1][1]))
        part = np.array(part)
        parts.append(part)

    return parts


image_path = select_file()
if (image_path == ''): # If no file was selected, we exit
    print("No file selected. Exiting.")
    exit()
current_image = load_and_display_image(os.path.join(work_dir, image_path))
print('Type of name of the corresponding area :')
parking_id = input()

load_coordinates(xml_full_path, parking_id, coordinates_list)

image_parts = extract_image_parts(current_image, coordinates_list)



# Display the image parts
for i, part in enumerate(image_parts):
    cv2.imshow(f'Part {i}', part)

# Wait for a key press and close the windows
cv2.waitKey(0)
cv2.destroyAllWindows()