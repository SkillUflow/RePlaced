#Coding:utf-8
import threading
from pprint import pprint
import cv2
from PIL import Image
import numpy as np
import requests
from bs4 import BeautifulSoup
import os
import pickle
import time
import datetime


    
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
    print("Getting cameras from file")
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
        print("Creating directory for", cam_name, "\n")
        os.makedirs(cam_name)
        
    if not os.path.exists(cam_name + '/originals'):
        print("Creating directory for", cam_name + '/originals \n')
        os.makedirs(cam_name + '/originals')
    
    if not os.path.exists(cam_name + '/processed'):
        print("Creating directory for", cam_name + '/processed', "\n")
        os.makedirs(cam_name + '/processed')
        
    if not os.path.exists(cam_name + '/Readble_data.txt'):
        print("Creating Readble_data.txt for", cam_name,"\n")
        file = open(cam_name + '/Readble_data.txt', 'w')
        file.write(f"Name: {cam_name}\n URL: {url}\nLongitude: {longitude}\nLatitude: {latitude}\n")
        file.close()
        
    if not os.path.exists(cam_name + '/Data.txt'):
        print("Creating Data.txt for", cam_name)
        file = open(cam_name + '/Data.txt', 'wb')
        pickle.dump(cam, file)
        file.close()
            

def OLD_get_frame(cam):
    try:
        threading.current_thread().name = "Waiting_for_vcap"
        vcap = cv2.VideoCapture(cam.url)
        threading.current_thread().name = "After_vcap"
        ret, frame = vcap.read()
        if frame is None:
            # Send a single GET request to the camera URL
            print(f"Getting frame for {cam.name}","\n")
            threading.current_thread().name = "Waiting_for_response"
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
            response = requests.get(cam.url, timeout= 1, headers=headers)
            threading.current_thread().name = "After_response"
            
            
            # Check if the response is successful
            if response.status_code == 200:
                print(f"Response is 200 for {cam.name} original frame","\n")
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
                else:
                    print(f"{cam.name} original frame is None")
            else:
                print(f"Response is not 200 for {cam.name} original frame","\n")
        else: 
            # Resize the frame
            down_width = 600
            down_height = 400
            down_points = (down_width, down_height)
            resized_down = cv2.resize(frame, down_points, interpolation=cv2.INTER_LINEAR)
            return resized_down
    except Exception as e:
        print(f"Error for {cam.name}:", e,"\n")
        Error[cam.name] = e
        return None 
        
    
    return None
    
    
    
    
    
    
    
def get_frame(cam, Error):
    try:
        threading.current_thread().name = "Waiting_for_stream"
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
        response = requests.get(cam.url, headers=headers, stream=True)
        threading.current_thread().name = "After_stream"
        if response.status_code == 200:
        
        
            if response.headers.get('Content-Length') is not None:
                
                
                # Send a single GET request to the camera URL
                print(f"Getting frame for {cam.name}","\n")
                threading.current_thread().name = "Waiting_forimage__response"
                response = requests.get(cam.url, headers=headers, timeout=60) 
                threading.current_thread().name = "After_image_response"
                
                
                # Check if the response is successful
                if response.status_code == 200:
                    print(f"Response is 200 for {cam.name} original frame","\n")
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
                    else:
                        print(f"{cam.name} original frame is None")
                else:
                    print(f"Response is not 200 for {cam.name} original frame","\n")
            else:      
                # Iterate over the response content in chunks
                bytes_buffer = b''
                for chunk in response.iter_content(chunk_size=1024):
                    bytes_buffer += chunk
                    # Check if we have a complete MJPEG frame
                    start_marker = bytes_buffer.find(b'\xff\xd8')
                    end_marker = bytes_buffer.find(b'\xff\xd9')
                    if start_marker != -1 and end_marker != -1:
                        # Extract the MJPEG frame
                        mjpeg_frame = bytes_buffer[start_marker:end_marker + 2]
                        # Decode the MJPEG frame into a numpy array
                        frame = cv2.imdecode(np.frombuffer(mjpeg_frame, dtype=np.uint8), cv2.IMREAD_COLOR)
                        # Resize the frame
                        down_width = 600
                        down_height = 400
                        down_points = (down_width, down_height)
                        resized_down = cv2.resize(frame, down_points, interpolation=cv2.INTER_LINEAR)
                        
                        # Clear the buffer
                        bytes_buffer = bytes_buffer[end_marker + 2:]
                        
                        return resized_down
                
        else:
            print(f"Response is not 200 for {cam.name} original frame","\n")
                
            
            
            
            
    except Exception as e:
        print(f"Error for {cam.name}:", e,"\n")
        Error[cam.name] = e
        return None 
        
    
    return None





def get_processed_frame(cam, frame):
    try:

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
        else:
            print(f"{cam.name} processed frame is None")

                
    except Exception as e:
        print(f"Error for {cam.name}:", e,"\n")
        Error[cam.name] = e
        return None
    
    return None
    
def Camera_process(cam):
    check_diectory(cam)
    name = cam.name
    url = cam.url
    print(f"Getting data for {name}", "\n")
    
    threading.current_thread().name = "get_frame"
    normal_frame = get_frame(cam, Error)
    threading.current_thread().name = "Waiting_for saving"
    
    if normal_frame is not None:
        print(f"{cam.name} normal frame is not None","\n")
        print(f"Saving frame for {name}","\n")
        cv2.imwrite(f"{name}/originals/{Current_date}.jpg", normal_frame)
        print(f"Saved frame for {name}","\n")
    threading.current_thread().name = "Save1_OK"
    
    processed_frmae = get_processed_frame(cam, normal_frame)
    if processed_frmae is not None:
        print(f"{cam.name} processed frame is not None","\n")
        print(f"Saving processed frame for {name}","\n")
        cv2.imwrite(f"{name}/processed/{Current_date}.jpg", processed_frmae)
        print(f"Saved processed frame for {name}","\n")
    threading.current_thread().name = "Save2_OK"










def main():
    target_directory = 'OCR/Training/Data Acquisition/'
    os.chdir(target_directory)
    if not os.path.exists('Data'):
        os.makedirs('Data')
        
    Cams = get_Cams_Data()
    
    
    os.chdir('Data')
    if not os.path.exists('Screenshots'):
        os.makedirs('Screenshots')
    os.chdir('Screenshots')
    
    global starting_date
    global Current_date
    global Error
    
    Error = {}
    starting_date = time.time()
    Current_date = time.time()  
        
    
    #while Current_date - starting_date < 86400: #24 hours
    
    while Current_date - starting_date < 60*60*60: #24 hours 
        Current_date = time.time()
        
        threads =  [threading.Thread(target=Camera_process, args=(cam,)) for cam in Cams]
        process = 0
        for thread in threads:
            thread.start() 
            process += 1
        for thread in threads:
            thread.join()
            process -= 1
            print(f"---------------------------------------------Threads reamining: {process}/{len(threads)}-------------------------------------------------")
            
            
        
        pprint(f"Errors : {Error}")
        file = open("Errors.txt", 'w')
        pprint(Error, file)
        file.close()
        
        print("\n------------------------------------------------Sleeping 7min------------------------------------------------\n")     
        print("Curent date", datetime.datetime.now())
        time.sleep(420) #wait 7 min   
        
        
        
        
        
       
        

        
if __name__ == "__main__":
   main()