
from pprint import pprint
import cv2
from PIL import Image
import numpy as np
import requests
from bs4 import BeautifulSoup
import os
import pickle
import time

class Camera :
    def __init__(self, url = "url", coord = [0,0], name = 'camera', data = []):
        self.url = url
        #self.vcap = cv2.VideoCapture(url)
        self.coord = coord
        self.name = name
        self.data = data
        
        
    def get_frame(self):
        ret, frame = self.vcap.read()
        if frame is not None:
            down_width = 600
            down_height = 400
            down_points = (down_width, down_height)
            resized_down = cv2.resize(frame, down_points, interpolation= cv2.INTER_LINEAR)
            image_arr = np.array(resized_down)
            return image_arr
        else:
            return None
        
    def __del__(self):
        return
        self.vcap.release()
        
def get_Cams_Data():
    file = open("Data/Cams.txt", "rb")
    cams = pickle.load(file)
    file.close()
    return cams

def check_diectory(cam):
    longitude = cam.data[4]
    latitude = cam.data[5]
    cam_name = cam.name
    url = cam.url
    
    if not os.path.exists(cam_name):
        os.makedirs(cam_name)
        
    if not os.path.exists(cam_name + '/originals'):
        os.makedirs(cam_name + '/originals')
    
    if not os.path.exists(cam_name + '/processed'):
        os.makedirs(cam_name + '/processed')
        
    if not os.path.exists(cam_name + '/Readble_data.txt'):
        file = open(cam_name + '/Readble_data.txt', 'w')
        file.write(f"Name: {cam_name}\n URL: {url}\nLongitude: {longitude}\nLatitude: {latitude}\n")
        file.close()
        
    if not os.path.exists(cam_name + '/Data.txt'):
        file = open(cam_name + '/Data.txt', 'wb')
        pickle.dump(cam, file)
        file.close()
            

def get_frame(cam):
    try:
        # Send a single GET request to the camera URL
        response = requests.get(cam.url)
        
        # Check if the response is successful
        if response.status_code == 200:
            # Decode the response content as an image
            nparr = np.frombuffer(response.content, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                # Resize the frame
                down_width = 600
                down_height = 400
                down_points = (down_width, down_height)
                resized_down = cv2.resize(frame, down_points, interpolation=cv2.INTER_LINEAR)
                return resized_down
    except Exception as e:
        print("Error:", e)
    
    return None
    
    
def get_processed_frame(cam):
    try:
        # Send a single GET request to the camera URL
        response = requests.get(cam.url)
        
        # Check if the response is successful
        if response.status_code == 200:
            # Decode the response content as an image
            nparr = np.frombuffer(response.content, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                # Resize the frame
                down_width = 600
                down_height = 400
                down_points = (down_width, down_height)
                resized_down = cv2.resize(frame, down_points, interpolation=cv2.INTER_LINEAR)
                
                # Convert the image to a Numpy array
                image_arr = np.array(resized_down)

                # Convert the image to grayscale
                grey = cv2.cvtColor(image_arr, cv2.COLOR_BGR2GRAY)

                # Apply Gaussian blur to the grayscale image
                blur = cv2.GaussianBlur(grey, (5, 5), 0)
                #cv2.imshow('blur',blur)

                # Apply dilation to the blurred image
                dilated = cv2.dilate(blur, np.ones((3, 3)))
                #cv2.imshow('dilated',dilated)

                # Apply morphological closing to the dilated image
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
                closing = cv2.morphologyEx(dilated, cv2.MORPH_CLOSE, kernel)
                
                
                return closing
    except Exception as e:
        print("Error:", e)
    
    return None
    


def main():
    target_directory = 'OCR/Training/Data Acquisition/'
    os.chdir(target_directory)
    if not os.path.exists('Data'):
        os.makedirs('Data')
        
    Cams = get_Cams_Data()
    
    target_directory = 'OCR/Training/Data Acquisition/Data/'
    os.chdir(target_directory)
    if not os.path.exists('Screenshots'):
        os.makedirs('Screenshots')
        
    starting_date = time.time()
    Current_date = time.time()
    #while Current_date - starting_date < 86400: #24 hours
    
    while Current_date - starting_date < 60*60*60: #24 hours 
        Current_date = time.time()
        time.sleep(900) #wait 15 min    
        
        for cam in Cams:
            check_diectory(cam)
            name = cam.name
            url = cam.url
            
            normal_frame = get_frame(cam)
            if normal_frame is not None:
                cv2.imwrite(f"Screenshots/{name}/originals/{Current_date - starting_date}.jpg", normal_frame)
            
            processed_frmae = get_processed_frame(cam)
            if processed_frmae is not None:
                cv2.imwrite(f"Screenshots/{name}/processed/{Current_date - starting_date}.jpg", processed_frmae)
        
        
        
        
        
        
        

        
        
        
        
        

        
if __name__ == "__main__":
   main()