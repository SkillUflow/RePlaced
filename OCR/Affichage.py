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
    xSIZE = 45
    ySIZE = 45  
    boxes = outputs[0].boxes.data
        
    labels = {0: u'__background__', 1: u'person', 2: u'bicycle',3: u'car', 4: u'motorcycle', 5: u'airplane', 6: u'bus', 7: u'train', 8: u'truck', 9: u'boat', 10: u'traffic light', 11: u'fire hydrant', 12: u'stop sign', 13: u'parking meter', 14: u'bench', 15: u'bird', 16: u'cat', 17: u'dog', 18: u'horse', 19: u'sheep', 20: u'cow', 21: u'elephant', 22: u'bear', 23: u'zebra', 24: u'giraffe', 25: u'backpack', 26: u'umbrella', 27: u'handbag', 28: u'tie', 29: u'suitcase', 30: u'frisbee', 31: u'skis', 32: u'snowboard', 33: u'sports ball', 34: u'kite', 35: u'baseball bat', 36: u'baseball glove', 37: u'skateboard', 38: u'surfboard', 39: u'tennis racket', 40: u'bottle', 41: u'wine glass', 42: u'cup', 43: u'fork', 44: u'knife', 45: u'spoon', 46: u'bowl', 47: u'banana', 48: u'apple', 49: u'sandwich', 50: u'orange', 51: u'broccoli', 52: u'carrot', 53: u'hot dog', 54: u'pizza', 55: u'donut', 56: u'cake', 57: u'chair', 58: u'couch', 59: u'potted plant', 60: u'bed', 61: u'dining table', 62: u'toilet', 63: u'tv', 64: u'laptop', 65: u'mouse', 66: u'remote', 67: u'keyboard', 68: u'cell phone', 69: u'microwave', 70: u'oven', 71: u'toaster', 72: u'sink', 73: u'refrigerator', 74: u'book', 75: u'clock', 76: u'vase', 77: u'scissors', 78: u'teddy bear', 79: u'hair drier', 80: u'toothbrush'}
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
    if img is not None:
        
        resized_up = cv2.resize(img, (1000,600), interpolation= cv2.INTER_LINEAR) #Resize up the image to see better

        
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

async def process_camera(cam, screens, Error):
    while True:
        img = await get_frame_async(cam, screens, Error)
        resized_up = Frame_Process(img) if img is not None else None
        outputs = model.predict(img) if img is not None else None
        cnt = findObjects(outputs, resized_up) if outputs and resized_up is not None else 0
        
        cv2.imshow('Image', resized_up) #Display images with the cars detected

        if cv2.waitKey(22) & 0xFF == ord('q') or (cv2.getWindowProperty('Image', cv2.WND_PROP_VISIBLE) < 1):
            cv2.destroyAllWindows()
            break
        
    return cam, cnt

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
    cams = [Allcams[0], Allcams[1]]
    """
    cams = []
    BlackCams.filter(lambda cam: cam.name not in str(blacklist))
    for cam in BlackCams:
        for black in blacklist:
            if cam.name not in black:
               cams.append(cam)
    """
        

    Error = {}
    
    tasks = [process_camera(cam, screens, Error) for cam in cams]
    for task in asyncio.as_completed(tasks):
        cam, cnt, NbPlaces = await task
        result[cam.name] = f"{cnt}/{NbPlaces}"
        print(f"Camera {cam.name} has {cnt} cars for {NbPlaces} places available\n")
    

    if Error:
        pprint(f"\n ---------------------Errors------------------------------\n {Error}")
        
    pprint(f"\n ---------------------------------------------------------\n {result}")




if __name__ == "__main__":
    currentTime = time.time()
    asyncio.run(main())
    endTime = time.time() - currentTime
    print(f"Execution Time: {endTime}")
