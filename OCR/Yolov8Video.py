from ultralytics import YOLO
import numpy as np
from PIL import Image
import requests
from io import BytesIO
import matplotlib.pyplot as plt
import cv2

model = YOLO("yolov8n.pt")

"""-----------------------------Url of Cameras-------------------------------"""

image_url = 'http://67.43.220.114/mjpg/video.mjpg?videozfpsmode=fixed&timestamp=1714982770912&Axis-Orig-Sw=true' #920269

#image_url = 'http://185.137.146.14/mjpg/video.mjpg?timestamp=1715072443454' #978833

#image_url = 'http://46.238.103.4/mjpg/video.mjpg'

#image_url = 'http://94.72.19.56/mjpg/video.mjpg' #329758

#image_url = 'http://109.236.111.203/mjpg/video.mjpg' #426737

#image_url = 'http://65.175.133.211/jpg/image.jpg?COUNTER' #920199 #Marche Pas

#image_url = 'http://68.188.109.50/cgi-bin/camera?resolution=640&amp;quality=1&amp;Language=0&amp;COUNTER' #868634 #Marche Pas

#image_url = 'http://97.68.79.162/mjpg/video.mjpg'

#image_url = "http://193.213.211.188/mjpg/video.mjpg"

#image_url = "http://202.142.10.11/SnapshotJPEG?Resolution=640x480&amp;Quality=Clarity&amp;COUNTER" #Ca ne marche pas

#image_url = "http://79.8.83.39/oneshotimage1?COUNTER" #Ca ne marche pas

#image_url = "http://72.43.65.7/mjpg/video.mjpg"

#image_url = "http://86.127.212.113/cgi-bin/faststream.jpg?stream=half&fps=15&rand=COUNTER" #635442

#image_url = "http://86.127.212.219/cgi-bin/faststream.jpg?stream=half&fps=15&rand=COUNTER" #635627

#image_url = "http://50.246.145.122:80/cgi-bin/faststream.jpg?stream=half&fps=15&rand=COUNTER" #757737

#image_url = "http://137.27.16.134/mjpg/video.mjpg" #817622

#image_url = "http://122.249.91.30/-wvhttp-01-/GetOneShot?image_size=640x480&frame_count=1000000000" #867718

#image_url = "http://59.25.223.143/jpgmulreq/1/image.jpg?key=1516975535684&lq=1&COUNTER" #873375

#image_url = "http://67.61.139.162:8080/jpg/image.jpg?COUNTER"

"""--------------------------------------------------------------------------"""


cap = cv2.VideoCapture(image_url) #Get video capture

confThreshold = 0.2 #Threshold of confidence
nmsThreshold = 0.5    

def findObjects(outputs,img,score=True): #Get bounding boxes coords and display them
    
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

while True:

    success, img = cap.read() #Screen of the camera video feed

    if img is not None:

        outputs = model.predict(img)

        findObjects(outputs,img) #Call of the function

        resized_up = cv2.resize(img, (1000,600), interpolation= cv2.INTER_LINEAR) #Resize up the image to see better

        cv2.imshow('Image', resized_up) #Display images with the cars detected

        if cv2.waitKey(22) & 0xFF == ord('q') or (cv2.getWindowProperty('Image', cv2.WND_PROP_VISIBLE) < 1):

            cap.release()
            cv2.destroyAllWindows()
            break

    else:
        print ("Frame is None")
        break;