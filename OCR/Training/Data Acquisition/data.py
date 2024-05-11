#Coding:utf-8

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
        
        
        


    
#From Parking menu
def get_cams():
    print("Getting cameras")
    cams = []
    for i in range(1, 6):
        site_url = "http://www.insecam.org"
        parking_url = site_url + f"/en/bytag/parking/?page={i}"
        
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
        response = requests.get(parking_url, headers=headers)
        print(response.status_code)
        
        
        if(response.status_code == 200):
            print(f"Page {i} is being processed")
            soup = BeautifulSoup(response.content, 'html.parser')
            cam_list = soup.find_all('div', class_="thumbnail-item")
            
            Saved_Cams = open("Data/Cams.txt", "rb")
            if check_empty_file(Saved_Cams):
                saves = []
            else:
                saves = pickle.load(Saved_Cams)
            Saved_Cams.close()
            
            for cam in cam_list:
                if not any(cam.find('a')['href'].split('/')[-2] == save.name for save in saves):
                    print(cam.find('a')['href'])
                    Current_cam = TumbnailToCamera(cam, site_url = site_url, headers = headers)
                    cams.append(Current_cam)

                Current_cam = None
                      
                
               
    return cams

def TumbnailToCamera(cam, site_url = "http://www.insecam.org", headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}):
    Current_cam = Camera()
    Current_cam.url = cam.find('img')['src']
    Current_cam.name = cam.find('a')['href'].split('/')[-2]
    Current_cam.data = get_Data(url = site_url + cam.find('a')['href'], headers = headers)
    return Current_cam               
    

                      
                
               
   

def get_Data(url = "http://www.insecam.org", headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}):
    go_to_data = requests.get(url, headers=headers)                
    if(go_to_data.status_code == 200):
        soup_data = BeautifulSoup(go_to_data.content, 'html.parser')
        data = soup_data.find_all('div', class_="camera-details__row")
        rows = [*map(lambda row: row.find_all('div', class_= 'camera-details__cell'), data)]
        #[[<TXT>,<TXT>], [,], [,]]
        data_text = [*map(lambda row: [*map(lambda cell: cell.get_text(strip=True), row)], rows)]
        
        #data_text = [*map(lambda cell: cell.get_text(strip=True), cells)]
        
        return data_text
        
   
  
  
  
def PageTCamera(site_url = "http://www.insecam.org/en/view/560424/", headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}):    

    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
    response = requests.get(site_url, headers=headers)
    print(response.status_code)


    if(response.status_code == 200):
        print(f"Page is being processed")
        soup = BeautifulSoup(response.content, 'html.parser')
   
        Current_cam = Camera()
        Current_cam.url = soup.find(id="image0")['src']
        #find id="image0"
        
        
        
        Current_cam.name = site_url.split('/')[-2]
        Current_cam.data = get_Data(url = site_url, headers = headers)
        
        return Current_cam
  
  
  
  
  
  
def check_empty_file(file):
    file.seek(0, os.SEEK_END)
    if file.tell() == 0:
        #return to the beginning of the file
        file.seek(0)
        
        
        return True
    else:
        file.seek(0) 
        return False 
    

  
  
  
  
  
  
  
  
  
   
   
def main():
    target_directory = 'OCR/Training/Data Acquisition/'
    os.chdir(target_directory)
    if not os.path.exists('Data'):
        os.makedirs('Data')



    Ca = get_cams()
    Bonus_urls = []
    
   
    Saved_Cams = open("Data/Cams.txt", "rb")
    if check_empty_file(Saved_Cams):
        saves = []
    else:
        saves = pickle.load(Saved_Cams)
    Saved_Cams.close()
    
    
    
    file = open("Data/Bonus_URLS.txt", "r")
    for line in file:
        Bonus_urls.append(line.strip("\n"))
 
 
 
    for url in Bonus_urls:
        if not any(save.name in url for save in saves):
            Ca.append(PageTCamera(site_url = url))
    
    file.close()
        
        
        
    print("----------------------Results-------------------------------------------------------------------------------")
    pprint(Ca)
    print("------------------   Cameras   ------------------")
    for cam in Ca:
        print(f"Name: {cam.name}")
        print(f"URL: {cam.url}")
        pprint(f"Data: {cam.data}")
        print("--------------------------------------------------------------")
        
    print("NB cams", len(Ca))
    
    
    
    Saved_Cams = open("Data/Cams.txt", "rb")
    if check_empty_file(Saved_Cams):
        saves = []
    else:
        saves = pickle.load(Saved_Cams)
    
    
    saves.extend(Ca)
    Saved_Cams.close()
    
    Saved_Cams = open("Data/Cams.txt", "wb")
    pickle.dump(saves, Saved_Cams)
    Saved_Cams.close()
    
    
    
    print("Data Acquisition is done")
    print("check number of cameras in Data/Cams.txt")
    
    Saved_Cams = open("Data/Cams.txt", "rb")
    saves = pickle.load(Saved_Cams)
    Saved_Cams.close()
    print("NB cams", len(saves))
            
    



    
    
    
    
    
    
    
if __name__ == "__main__":
    print("Data Acquisition is being run")
    main()