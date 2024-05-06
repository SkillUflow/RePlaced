#Coding:utf-8

import os
import sys
import time
import json

import requests
import cv2
import numpy as np
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

image_url = "http://67.43.220.114/mjpg/video.mjpg?videozfpsmode=fixed&timestamp=1714982472353&Axis-Orig-Sw=true"
"""
response = requests.get(image_url, stream=True)

image = Image.open(response.raw)
image = image.resize((450, 250))
"""

image = cv2.VideoCapture(image_url)

#rezise the window
cv2.namedWindow('Video', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Video', 450, 250)



















while True:
  ret, frame = image.read()

  # Convert the image to a Numpy array
  image_arr = np.array(frame)

  # Convert the image to grayscale
  grey = cv2.cvtColor(image_arr, cv2.COLOR_BGR2GRAY)

  # Apply Gaussian blur to the grayscale image
  blur = cv2.GaussianBlur(grey, (5, 5), 0)

  
  cv2.imshow('Video', blur)

  if cv2.waitKey(1) == 27:
    exit(0)