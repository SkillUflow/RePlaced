import cv2
import numpy as np
import os
import importlib.util
import sys
import pickle
from pprint import pprint
import asyncio
import time
from ultralytics import YOLO
import random
import pyautogui

class Camera:
    def __init__(self, url="url", coord=[0, 0], name='camera', data=[]):
        self.url = url
        # self.vcap = cv2.VideoCapture(url)
        self.coord = coord
        self.name = name
        self.data = data

    def get_frame(self):
        ret, frame = self.vcap.read()
        if frame is not None:
            down_width = 600
            down_height = 400
            down_points = (down_width, down_height)
            resized_down = cv2.resize(frame, down_points, interpolation=cv2.INTER_LINEAR)
            image_arr = np.array(resized_down)
            return image_arr
        else:
            return None

    def __del__(self):
        return
        self.vcap.release()


def box_label(image, box, label='',color=(128, 128, 128), txt_color=(255, 255, 255)):
  lw = max(round(sum(image.shape) / 2 * 0.003), 2)
  p1, p2 = (int(box[0]), int(box[1])), (int(box[2]), int(box[3]))
  cv2.rectangle(image,p1,p2, color,1, lineType=cv2.LINE_AA)
  if label:
    tf = max(lw - 1, 1)  # font thickness
    w, h = cv2.getTextSize(label, 0, fontScale=lw / 3, thickness=tf)[0]  # text width, height
    outside = p1[1] - h >= 3
    cv2.putText(image,
                label, (p1[0], p1[1] - 2 if outside else p1[1] + h + 2),
                0,
                lw / 6,
                txt_color,
                thickness=tf,
                lineType=cv2.LINE_AA)

def findObjects(outputs, img, score=True):
    boxes = outputs[0].boxes.data
        
    labels = {0: u'__background__', 1: u'Not Car', 2: u'Not Car', 3: u'Car', 4: u'Not Car', 5: u'Not Car', 6: u'Close_To_Car', 7: u'Close_To_Car', 8: u'Very_Close_To_Car', 9: u'Not Car', 10: u'Not Car', 11: u'Not Car', 12: u'Not Car', 13: u'Not Car', 14: u'Not Car', 15: u'Not Car', 16: u'Not Car', 17: u'Not Car', 18: u'Not Car', 19: u'Not Car', 20: u'Not Car', 21: u'Not Car', 22: u'Not Car', 23: u'Not Car', 24: u'Not Car', 25: u'Not Car', 26: u'Not Car', 27: u'Not Car', 28: u'Not Car', 29: u'Not Car', 30: u'Not Car', 31: u'Not Car', 32: u'Not Car', 33: u'Not Car', 34: u'Not Car', 35: u'Not Car', 36: u'Not Car', 37: u'Not Car', 38: u'Not Car', 39: u'Not Car', 40: u'Not Car', 41: u'Not Car', 42: u'Not Car', 43: u'Not Car', 44: u'Not Car', 45: u'Not Car', 46: u'Not Car', 47: u'Not Car', 48: u'Not Car', 49: u'Not Car', 50: u'Not Car', 51: u'Not Car', 52: u'Not Car', 53: u'Not Car', 54: u'Not Car', 55: u'Not Car', 56: u'Not Car', 57: u'Not Car', 58: u'Not Car', 59: u'Not Car', 60: u'Not Car', 61: u'Not Car', 62: u'Not Car', 63: u'Not Car', 64: u'Not Car', 65: u'Not Car', 66: u'Not Car', 67: u'Not Car', 68: u'Not Car', 69: u'Not Car', 70: u'Not Car', 71: u'Not Car', 72: u'Not Car', 73: u'Not Car', 74: u'Not Car', 75: u'Not Car', 76: u'Not Car', 77: u'Not Car', 78: u'Not Car', 79: u'Not Car', 80: u'Not Car'}
    #Define colors
    colors = [(89, 161, 197),(67, 161, 255),(19, 222, 24),(186, 55, 2),(167, 146, 11),(190, 76, 98),(130, 172, 179),(115, 209, 128),(204, 79, 135),(136, 126, 185),(209, 213, 45),(44, 52, 10),(101, 158, 121),(179, 124, 12),(25, 33, 189),(45, 115, 11),(73, 197, 184),(62, 225, 221),(32, 46, 52),(20, 165, 16),(54, 15, 57),(12, 150, 9),(10, 46, 99),(94, 89, 46),(48, 37, 106),(42, 10, 96),(7, 164, 128),(98, 213, 120),(40, 5, 219),(54, 25, 150),(251, 74, 172),(0, 236, 196),(21, 104, 190),(226, 74, 232),(120, 67, 25),(191, 106, 197),(8, 15, 134),(21, 2, 1),(142, 63, 109),(133, 148, 146),(187, 77, 253),(155, 22, 122),(218, 130, 77),(164, 102, 79),(43, 152, 125),(185, 124, 151),(95, 159, 238),(128, 89, 85),(228, 6, 60),(6, 41, 210),(11, 1, 133),(30, 96, 58),(230, 136, 109),(126, 45, 174),(164, 63, 165),(32, 111, 29),(232, 40, 70),(55, 31, 198),(148, 211, 129),(10, 186, 211),(181, 201, 94),(55, 35, 92),(129, 140, 233),(70, 250, 116),(61, 209, 152),(216, 21, 138),(100, 0, 176),(3, 42, 70),(151, 13, 44),(216, 102, 88),(125, 216, 93),(171, 236, 47),(253, 127, 103),(205, 137, 244),(193, 137, 224),(36, 152, 214),(17, 50, 238),(154, 165, 67),(114, 129, 60),(119, 24, 48),(73, 8, 110)]

    for box in boxes:
        print(box)
        if score :
            label = labels[int(box[-1])+1] + " " + str(round(100 * float(box[-2]),1)) + "%"
        else :
            label = labels[int(box[-1])+1]
        confidence = box[-2]
        if confidence > confThreshold:
            color = colors[int(box[-1])]
            box_label(img, box,label, color)

    cnt = 0

    return cnt

def Frame_Process(img):
    screen_width, screen_height = pyautogui.size()
    if img is not None:
        
        resized_up = cv2.resize(img, (screen_width, screen_height), interpolation= cv2.INTER_LINEAR) #Resize up the image to see better

        
        return  resized_up
    else:
        print("Frame is None")
        return None



async def get_frame_async(cam, screens, Error):
    try:
        return await asyncio.to_thread(screens.get_frame, cam, Error)
    except Exception as e:
        Error[cam.name] = str(e)
        return None



async def main():
    global confThreshold
    global nmsThreshold
    global model
    
    CurrentPath = os.getcwd()
    spec = importlib.util.spec_from_file_location("screens", f"{CurrentPath}/OCR/Training/Data Acquisition/screens.py")
    screens = importlib.util.module_from_spec(spec)
    sys.modules["screens"] = screens
    spec.loader.exec_module(screens)

    cams = []
    result = {}
    
    confThreshold = 0.2
    nmsThreshold = 0.5
    model = YOLO("yolov8n.pt")

    with open('OCR/Training/Data Acquisition/Data/Cams.txt', 'rb') as file:
        cams = pickle.load(file)
    
    with open('OCR/Training/Data Acquisition/Data/BlackList_URLS.txt', 'r') as file:
        blacklist = [line.strip() for line in file]
        

    Allcams = [cam for cam in cams if cam.name not in str(blacklist)]
    cams = []
    names = ["920269","878868 ","812272","804453", "878868"]
    
    for cam in Allcams:
        if cam.name in names:
            cams.append(cam)
            
    random.shuffle(cams)    
    """
    cams = []
    BlackCams.filter(lambda cam: cam.name not in str(blacklist))
    for cam in BlackCams:
        for black in blacklist:
            if cam.name not in black:
               cams.append(cam)
    """
        

    Error = {}
    

    """
    tasks = [process_camera(cam, screens, Error) for cam in cams]
    for task in asyncio.as_completed(tasks):
        cam, cnt, NbPlaces = await task
    """
    
    
    while True:
        img = await get_frame_async(cams[0], screens, Error)
        #img2 = await get_frame_async(cams[1], screens, Error)
        
        outputs = model.predict(img) if img is not None else None
        #outputs2 = model.predict(img2) if img is not None else None
        
        cnt = findObjects(outputs, img) if outputs and img is not None else 0
        #cnt2 = findObjects(outputs2, img2) if outputs2 and img2 is not None else 0
        
    
        
        
        
        
        
        
        
        
        
        resized_up = Frame_Process(img) if img is not None else None
        #resized_up2 = Frame_Process(img2) if img2 is not None else None
        
        
        cv2.imshow('Image', resized_up) #Display images with the cars detected
        #cv2.imshow('Image2', resized_up2)

        if cv2.waitKey(22) & 0xFF == ord('q') or (cv2.getWindowProperty('Image', cv2.WND_PROP_VISIBLE) < 1):
            cv2.destroyAllWindows()
            break
    

    if Error:
        pprint(f"\n ---------------------Errors------------------------------\n {Error}")
        
    pprint(f"\n ---------------------------------------------------------\n {result}")




if __name__ == "__main__":
    currentTime = time.time()
    asyncio.run(main())
    endTime = time.time() - currentTime
    print(f"Execution Time: {endTime}")
