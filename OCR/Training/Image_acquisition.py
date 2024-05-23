import cv2
from PIL import Image
import numpy as np
import requests
import datetime


# Open a sample video available in sample-videos
image_url = 'http://67.43.220.114/mjpg/video.mjpg?videozfpsmode=fixed&timestamp=1714982770912&Axis-Orig-Sw=true'
vcap = cv2.VideoCapture(image_url)
#if not vcap.isOpened():
#    print "File Cannot be Opened"

first_iteration = True # Used to ensure that all the code is run at least once, notably to avoid windows being detected as closed because they never opened

while(True):
    # Capture frame-by-frame
    ret, frame = vcap.read()
    #print cap.isOpened(), ret
    if frame is not None:
        # Display the resulting frame
        down_width = 600
        down_height = 400
        down_points = (down_width, down_height)
        resized_down = cv2.resize(frame, down_points, interpolation= cv2.INTER_LINEAR)

        # Convert the image to a Numpy array
        image_arr = np.array(resized_down)

        # Apply Gaussian blur to the grayscale image
        blur = cv2.GaussianBlur(image_arr, (5, 5), 0)
        #cv2.imshow('blur',blur)

        # Apply dilation to the blurred image
        dilated = cv2.dilate(blur, np.ones((3, 3)))
        #cv2.imshow('dilated',dilated)

        # Apply morphological closing to the dilated image
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
        closing = cv2.morphologyEx(dilated, cv2.MORPH_CLOSE, kernel)
    
        # Press s to save the image
        if cv2.waitKey(22) & 0xFF == ord('s'):
            # Get current time as string in iso 1806 format
            now = datetime.datetime.now()
            now_str = now.isoformat().replace(":", "") # IMPORTANT : IF YOU REMOVE THIS LINE YOU WILL BE THE ONE TO REPAIR THE REPO
            cv2.imwrite('OCR/Training/training_images/training_' + now_str + '.png', image_arr)
            print("Image saved")


        car_cascade_src = 'OCR/cars.xml'
        car_cascade = cv2.CascadeClassifier(car_cascade_src)

        if car_cascade.empty():
            print("Error: Cascade classifier not loaded!")
        else:
            print("Cascade classifier loaded successfully.")


        cars = car_cascade.detectMultiScale(closing, 1.1, 1)

        cnt = 0
        for (x, y, w, h) in cars:
            cv2.rectangle(image_arr, (x, y), (x + w, y + h), (0, 255, 255), 2)
            cnt += 1

        if (cv2.getWindowProperty('frame', cv2.WND_PROP_VISIBLE) < 1 or cv2.getWindowProperty('closing', cv2.WND_PROP_VISIBLE) < 1) and not first_iteration: # There is also a check before the refresh functions, since they would overwrite the normal closing command otherwise
            break
        cv2.imshow('frame',image_arr)
        cv2.imshow('closing',closing)
        # Press q to close the video windows before it ends if you want (getWindowProperty is used to check if the window was closed in a "normal" way)
        if cv2.waitKey(22) & 0xFF == ord('q') or (cv2.getWindowProperty('frame', cv2.WND_PROP_VISIBLE) < 1 or cv2.getWindowProperty('closing', cv2.WND_PROP_VISIBLE) < 1):
            break
        first_iteration = False
    else:
        print ("Frame is None")
        break


    

# Convert the image to grayscale
#grey = cv2.cvtColor(image_arr, cv2.COLOR_BGR2GRAY)

# When everything done, release the capture
vcap.release()
print ("Video stop")
cv2.destroyAllWindows()

# Print the total number of detected cars and buses
print(cnt, " cars found")

# Convert the annotated image to PIL Image format and display it
#annotated_image = Image.fromarray(image_arr)
#annotated_image.show()

# Close the window when a key is pressed
cv2.waitKey(0)
cv2.destroyAllWindows()