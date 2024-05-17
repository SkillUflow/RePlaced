import cv2
import numpy as np
import json
import os
import importlib.util
import sys
import pickle
from pprint import pprint

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

def Get_nbPlaces(cam):
    return 80



def findObjects(outputs, img): #Get bounding boxes coords and display them
    hT, wT,cT = img.shape

    bbox = []
    classIds = []
    confs = []

    for output in outputs:
        for det in output:
            scores = det[5:]
            classId = np.argmax(scores)
            confidence = scores[classId]
            if confidence > confThreshold:
                w,h = int(det[2]* wT), int(det[3]*hT)
                x,y = int((det[0]*wT)-w/2), int((det[1]*hT)-h/2)
                bbox.append([x,y,w,h])
                classIds.append(classId)
                confs.append(float(confidence))


    indices = cv2.dnn.NMSBoxes(bbox, confs,confThreshold,nmsThreshold) #Non-maximum suppression

    
    cnt = 0

    for i in indices:
        box = bbox[i]
        x,y,w,h = box[0], box[1], box[2], box[3]

        if(classIds[i] == 2 or classIds[i]== 7): #If it's a Car or a Truck

            #cv2.rectangle(resized_up, (x,y),(x+w,y+h),(255,0,255),1) #Draw the rectangles

            cnt += 1 #Count the quantity of cars detected in the image

            #cv2.putText(resized_up,f'{classNames[classIds[i]].upper()} {int(confs[i]*100)}%', #Put the class name and confidence
            #(x,y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.4,(255,0,255),1)

    #print(cnt, " cars found")
    return cnt




    
    


    


def Frame_Process(img, net):

    

    if img is not None:

        blur = cv2.GaussianBlur(img, (5, 5), 2) #Apply blur to image

        dilated = cv2.dilate(blur, np.ones((3, 3))) #Apply dilation to the blurred image

        down_points = (whT, whT) #Resize the image to be able to put it in the network
        resized_down = cv2.resize(dilated, down_points, interpolation= cv2.INTER_LINEAR)

        resized_down = ((resized_down / np.max(img)) * 255).astype('uint8')

        blob = cv2.dnn.blobFromImage(resized_down, 1/255,(whT,whT),[0,0,0],crop=False) #Create the blob from the image
       
        net.setInput(blob) #Set the blob as the input of the network

        layerNames = net.getLayerNames()
        outputNames = [layerNames[i - 1] for i in net.getUnconnectedOutLayers()]

        resized_up = cv2.resize(img, (1000,600), interpolation= cv2.INTER_LINEAR) #Resize up the image to see better

        outputs = net.forward(outputNames)

        cnt = findObjects(outputs,resized_up) #Call of the function
        return cnt

        #cv2.imshow('Image', resized_up) #Display images with the cars detected
        """
        if cv2.waitKey(22) & 0xFF == ord('q') or (cv2.getWindowProperty('Image', cv2.WND_PROP_VISIBLE) < 1):

            
            cv2.destroyAllWindows()
           
    
            
        """
    else:
        print ("Frame is None")
        return None
   

#print("il y a ",NbPlaces - cnt," places libres")



def dataToJson(cam, cnt, NbPlaces):

    """---------------Send Data to Json---------------"""
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
        if Found != True:
            jsonData = {
                "lat" : LAT,
                "long" : LONG,
                "numPlaces" : NbPlaces,
                "numBooked" : cnt
            }
            data["pinList"].append(jsonData)
        file.seek(0)        # <--- should reset file position to the beginning.
        json.dump(data, file, indent=4)
        file.truncate()     # remove remaining part
    """-----------------------------------------------"""




def main():
    global whT
    global confThreshold
    global nmsThreshold
    
    #get acces to function get_frame from screens.py
    CurrentPath= os.getcwd()
    spec = importlib.util.spec_from_file_location("screens", f"{CurrentPath}/OCR/Training/Data Acquisition/screens.py")
    screens = importlib.util.module_from_spec(spec)
    sys.modules["screens"] = screens
    spec.loader.exec_module(screens);

    cams =  []
    result = {}
    
    whT = 320

    cnt = 0
    

    confThreshold = 0.5 #Threshold of confidence
    nmsThreshold = 0.3


    classesFile = 'OCR/coco.names' #Get classes names for the AI
    """"
    classNames = []
    with open(classesFile,'rt') as f:
        classNames = f.read().rstrip('n').split('n')
    """
    
    """-------------Load YoloV3 Model-------------"""

    modelConfiguration = 'OCR/yolov3.cfg'
    modelWeights = 'OCR/yolov3.weights'

    """-------------------------------------------"""


    """--------------Setup the network--------------"""
    net = cv2.dnn.readNetFromDarknet(modelConfiguration, modelWeights)
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_DEFAULT)
    net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
    """---------------------------------------------"""


    file = open('OCR/Training/Data Acquisition/Data/Cams.txt', 'rb')
    cams = pickle.load(file)
    file.close()
    
    with open('OCR/Training/Data Acquisition/Data/BlackList_URLS.txt', 'r') as file:
        blacklist = [line.strip() for line in file]

    cams = [cam for cam in cams if cam.name not in blacklist]

                
    
    Error = {}

    for cam in cams:
        img = screens.get_frame(cam, Error)
        cnt = Frame_Process(img, net)
        NbPlaces = Get_nbPlaces(cam)
        result[cam.name] = cnt
        print(f"Camera {cam.name} has {cnt} cars for {NbPlaces} places available\n")
        dataToJson(cam, cnt, NbPlaces)
    pprint(f"\n ---------------------------------------------------------\n {result}")







if __name__ == "__main__":
    main()
    