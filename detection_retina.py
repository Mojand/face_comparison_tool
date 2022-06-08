#! python3
from cmath import atan
from unicodedata import name
from cv2 import imread
import matplotlib.pyplot as plt
from matplotlib.text import OffsetFrom
from retinaface import RetinaFace
from deepface import DeepFace
import base64
import cv2
import numpy as np
import json
from PIL import Image
from io import BytesIO
import tempfile
from os.path import exists
import math
from rembg import remove
from scipy import ndimage


def crop(img,xt,yt,xb,yb,ratio):

    frame = img

    posX = xt 
    posY = yt

    w = xb-xt 
    scaledW = int(w*ratio)
    deltaW = int(scaledW-w)//2

    h = yb-yt 
    scaledH = int(h*ratio)
    deltaH = int(scaledH-h)//2

    if (posY - deltaH < 0):
        frame = img[
            0 : posY - deltaH + scaledH,
            posX - deltaW : posX - deltaW + scaledW,
        ]
    if (posX - deltaW < 0):
        frame = img[
            posY - deltaH : posY - deltaH + scaledH,
            0 : posX - deltaW+ scaledW,
        ]
    if (posX - deltaW < 0) and (posY - deltaH < 0):
        frame = img[
            0 : posY - deltaH + scaledH,
            0 : posX - deltaW + scaledW,
        ]
    if (posX - deltaW > 0) and (posY - deltaH > 0):
        frame = img[
            posY - deltaH : posY - deltaH + scaledH,
            posX - deltaW : posX - deltaW + scaledW,
        ]

    return frame

def cropAndRotate(img,xt,yt,xb,yb,ratio,xl,yl,xr,yr):

    theta = rotateEyes(img,xl,yl,xr,yr)

    img2 = crop(img,xt,yt,xb,yb,ratio*1.5)
    # plt.imshow(img2, interpolation='nearest')
    # plt.show()
    turned = ndimage.rotate(img2,theta,reshape = False)
    # plt.imshow(turned, interpolation='nearest')
    # plt.show()

    xtT = 0
    ytT = 0
    xbT = turned.shape[1]
    ybT = turned.shape[0]

    originalW = xb-xt
    originalH = yb-yt

    offSetX = (xbT - originalW)//4
    offSetY = (ybT - originalH)//4

    imgFinal = turned[(xtT + offSetX) : (xbT - offSetX), (ytT + offSetY) : (ybT - offSetY)]

    #imgFinal = crop(turned,xt,yt,xb,yb,ratio)
    # plt.imshow(imgFinal, interpolation='nearest')
    # plt.show()
    
    return turned

def rotateEyes(img,xl,yl,xr,yr):
    #Rotation counterclockwise

    deltaX = xl-xr
    deltaY = yl-yr

    theta = math.degrees(math.atan2(deltaY,deltaX))

    return theta

def retinaface_multiple(path = "src/img2.jpeg"):

    img = imread(path)
    faces = RetinaFace.extract_faces(img_path = img, align = True)

    print("There are ", len(faces), " faces in the image")

    if len(faces) == 0:
        return "no faces detected", 400

    imageFromArray = Image.fromarray(faces[0]) 

    buffered = BytesIO()

    imageFromArray.save(buffered,format="JPEG")
    base64Img = base64.b64encode(buffered.getvalue())

    return base64Img.decode("ascii")

def deepface_single(path="", b64 = "", ratio = 1.6, rmbg = False):

    if not path and not b64:
        # TODO: treat the error
        print("Give an image to treat")
        return ""
        
    if not path == "":
        try:
            img = imread(path,1)

        except Exception as e:
            print (e)
            # TODO: treat the error
            return ""

    if not b64 == "":
        try:

            with open("src/temp_img.jpg",'wb') as f:
                f.write(base64.b64decode(b64))
                img = imread(f.name)
                path=f.name


        except Exception as e:
            print (e)
            # TODO: treat the error
            return ""

    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)



    obj = DeepFace.analyze(img_path=path, prog_bar= False, enforce_detection=False, detector_backend='retinaface')

    posX = obj["region"]["x"] 
    posY = obj["region"]["y"]
    w = obj["region"]["w"] 
    h = obj["region"]["h"] 


    frame = crop(img,posX,posY,posX+w,posY+h, ratio = ratio)

    imageFromArray = Image.fromarray(frame)

    if rmbg : imageFromArray = remove(imageFromArray) 

    buffered = BytesIO()

    imageFromArray.save(buffered,format="PNG")
    base64Img = base64.b64encode(buffered.getvalue())

    return base64Img.decode("ascii")

def deepface_multiple(path="", b64 = "", ratio = 1.6, rmbg = False):
    
    #Return variable, contains all faces b64 datas
    faces = []

    if not path and not b64:
        # TODO: treat the error
        print("Give an image to treat")
        return ""
        
    if not path == "":
        try:
            img = imread(path,1)

        except Exception as e:
            print (e)
            # TODO: treat the error
            return ""

    if not b64 == "":
        try:

            with open("src/temp_img.jpg",'wb') as f:
                f.write(base64.b64decode(b64))
                img = imread(f.name)
                path=f.name

        except Exception as e:
            print (e)
            # TODO: treat the error
            return ""

    # Convert the image because CV reads images as BGR and not RGB
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Get the coordinates of all faces (+ eyes, mouths...)
    data = RetinaFace.detect_faces(path)

    if type(data) != dict:

        faces.append(b64)
        return faces

    else :
        for i, j in data.items():

            # Coordinates of both of the eyes
            xl,yl,xr,yr = j['landmarks']['left_eye'][0],j['landmarks']['left_eye'][1],j['landmarks']['right_eye'][0],j['landmarks']['right_eye'][1]
            # # Calculation of the tilt angle of the face
            theta = rotateEyes(img,xl,yl,xr,yr)

            # Coordinates of the face box in its whole
            xt,yt,xb,yb = j['facial_area'][0],j['facial_area'][1],j['facial_area'][2],j['facial_area'][3]
            # Crop around the face box, is usually enlarged
            
            ##################################################################
            # frame = crop(img,xt,yt,xb,yb,ratio=ratio)
            
            # #frame = cropAndRotate(img,xt,yt,xb,yb,ratio,xl,yl,xr,yr)

            # # Change the matrix image into an Image object (PIL)
            # imageFromArray = Image.fromarray(frame)
            # #resize = 1000//imageFromArray.width
            # imageFromArray = imageFromArray.rotate(theta)
            ##################################################################

            imageFromArray = Image.fromarray(cropAndRotate(img,xt,yt,xb,yb,ratio,xl,yl,xr,yr))

            if rmbg : imageFromArray = remove(imageFromArray)
            
            # Save the image as base64
            buffered = BytesIO()
            imageFromArray.save(buffered,format="PNG")
            base64Img = base64.b64encode(buffered.getvalue())
            # Append the current face to the list of faces
            faces.append(base64Img.decode("ascii"))

        return faces

def detection_faces(path="", b64=""):

    if not path and not b64:
        # TODO: treat the error
        print("Give an image to treat")
        return ""
        
    if not path == "":
        try:
            img = imread(path,1)

        except Exception as e:
            print (e)
            # TODO: treat the error
            return ""

    if not b64 == "":
        try:

            with open("src/temp_img.jpg",'wb') as f:
                f.write(base64.b64decode(b64))
                img = imread(f.name)
                path=f.name

        except Exception as e:
            print (e)
            # TODO: treat the error
            return ""

    # Convert the image because CV reads images as BGR and not RGB
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Get the coordinates of all faces (+ eyes, mouths...)
    data = RetinaFace.detect_faces(path)
    
    return data