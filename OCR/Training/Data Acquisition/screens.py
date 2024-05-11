
from pprint import pprint
import cv2
from PIL import Image
import numpy as np
import requests
from bs4 import BeautifulSoup
import os
import pickle

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
        
        
