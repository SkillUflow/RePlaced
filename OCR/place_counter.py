"""
This script is used to count the number of cars in a parking lot.
It uses the YOLOv8 object detection model to detect cars in a frame.
And it uses YOLOv3 todetect undetected cars in the frame.
The number of available parking spaces is then written to a JSON file.

Every thing is done asynchronously to speed up the process.
"""






import cv2
import numpy as np
import json
import os
import importlib.util
import sys
import pickle
from pprint import pprint
import asyncio
import time
import sqlite3

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

def Get_nbPlaces(cam):
    db_file = 'OCR/Training/training_data.db'
    
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute("""
         SELECT 
           *
		FROM
		parking_space
       WHERE
            parking_space.area_name = ?
    """, (cam.name,))
    
    result = c.fetchall()
    result = list(set(result)) # delete duplicates
    nbPlaces = len(result)
    
    
    
    return nbPlaces

def findObjects(outputs, img):
    hT, wT, cT = img.shape
    bbox = []
    classIds = []
    confs = []

    for output in outputs:
        for det in output:
            scores = det[5:]
            classId = np.argmax(scores)
            confidence = scores[classId]
            if confidence > confThreshold:
                w, h = int(det[2] * wT), int(det[3] * hT)
                x, y = int((det[0] * wT) - w / 2), int((det[1] * hT) - h / 2)
                bbox.append([x, y, w, h])
                classIds.append(classId)
                confs.append(float(confidence))

    indices = cv2.dnn.NMSBoxes(bbox, confs, confThreshold, nmsThreshold)
    cnt = 0

    for i in indices:
        box = bbox[i]
        x, y, w, h = box[0], box[1], box[2], box[3]
        if classIds[i] == 2 or classIds[i] == 7:
            cnt += 1

    return cnt

def Frame_Process(img, net):
    if img is not None:
        blur = cv2.GaussianBlur(img, (5, 5), 2)
        dilated = cv2.dilate(blur, np.ones((3, 3)))
        down_points = (whT, whT)
        resized_down = cv2.resize(dilated, down_points, interpolation=cv2.INTER_LINEAR)
        resized_down = ((resized_down / np.max(img)) * 255).astype('uint8')
        blob = cv2.dnn.blobFromImage(resized_down, 1 / 255, (whT, whT), [0, 0, 0], crop=False)
        net.setInput(blob)
        layerNames = net.getLayerNames()
        outputNames = [layerNames[i - 1] for i in net.getUnconnectedOutLayers()]
        resized_up = cv2.resize(img, (1000, 600), interpolation=cv2.INTER_LINEAR)
        outputs = net.forward(outputNames)
        cnt = findObjects(outputs, resized_up)
        return cnt
    else:
        print("Frame is None")
        return None

def dataToJson(cam, cnt, NbPlaces):
    Found = False
    with open('OCR/ocrDB.json', 'r+') as file:
        LAT = cam.data[4][1]
        LONG = cam.data[5][1]
        data = json.load(file)
        for i in range(len(data["pinList"])):
            if data["pinList"][i]['lat'] == LAT and data["pinList"][i]['long'] == LONG:
                data["pinList"][i]['numPlaces'] = NbPlaces
                data["pinList"][i]['numBooked'] = cnt
                Found = True
        if not Found:
            jsonData = {
                "lat": LAT,
                "long": LONG,
                "numPlaces": NbPlaces,
                "numBooked": cnt
            }
            data["pinList"].append(jsonData)
        file.seek(0)
        json.dump(data, file, indent=4)
        file.truncate()

async def get_frame_async(cam, screens, Error):
    try:
        return await asyncio.to_thread(screens.get_frame, cam, Error)
    except Exception as e:
        Error[cam.name] = str(e)
        return None

async def process_camera(cam, screens, net, Error):
    img = await get_frame_async(cam, screens, Error)
    cnt = Frame_Process(img, net) if img is not None else 0
    NbPlaces = Get_nbPlaces(cam)
    return cam, cnt, NbPlaces

async def main():
    global whT
    global confThreshold
    global nmsThreshold

    CurrentPath = os.getcwd()
    spec = importlib.util.spec_from_file_location("screens", f"{CurrentPath}/OCR/Training/Data Acquisition/screens.py")
    screens = importlib.util.module_from_spec(spec)
    sys.modules["screens"] = screens
    spec.loader.exec_module(screens)

    cams = []
    result = {}
    whT = 320
    confThreshold = 0.5
    nmsThreshold = 0.3

    modelConfiguration = 'OCR/yolov3.cfg'
    modelWeights = 'OCR/yolov3.weights'
    net = cv2.dnn.readNetFromDarknet(modelConfiguration, modelWeights)
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_DEFAULT)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

    with open('OCR/Training/Data Acquisition/Data/Cams.txt', 'rb') as file:
        cams = pickle.load(file)
    
    with open('OCR/Training/Data Acquisition/Data/BlackList_URLS.txt', 'r') as file:
        blacklist = [line.strip() for line in file]
        

    cams = [cam for cam in cams if cam.name not in str(blacklist)]
    
    """
    cams = []
    BlackCams.filter(lambda cam: cam.name not in str(blacklist))
    for cam in BlackCams:
        for black in blacklist:
            if cam.name not in black:
               cams.append(cam)
    """
        

    Error = {}
    tasks = [process_camera(cam, screens, net, Error) for cam in cams]
    for task in asyncio.as_completed(tasks):
        cam, cnt, NbPlaces = await task
        result[cam.name] = f"{cnt}/{NbPlaces}"
        print(f"Camera {cam.name} has {cnt} cars for {NbPlaces} places available\n")
        dataToJson(cam, cnt, NbPlaces)

    if Error:
        pprint(f"\n ---------------------Errors------------------------------\n {Error}")
        
    pprint(f"\n ---------------------------------------------------------\n {result}")



if __name__ == "__main__":
    currentTime = time.time()
    asyncio.run(main())
    endTime = time.time() - currentTime
    print(f"Execution Time: {endTime}")
