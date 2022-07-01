#! python3
from cmath import atan
import os.path
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
from os.path import isfile, join


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

def isPath(path):
    return os.path.isfile(path)

# ----------------------------------------------------------------------------------------------------------------------

# Detection of faces in an image using Retinaface.extract_faces, returns b64 image
def retinaface_extraction_1st_face(path = "src/img2.jpeg"):
    """
    Extracts the first detected face in an image
    param path: path to the base image
    return: b64 of the first face already cutted
    """
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

# Detection of 1 face features in an image using DeepFace.analyze to get face coordinates and then crop the face, returns b64 image
def deepface_analyze_single(path="", b64 = "", ratio = 1.6, rmbg = False):
    """
    Extracts the first detected face in an image
    param path: path to the base image
    param b4: b64 of the base image
    param ratio: ratio between the face size and the image size
    param rmbg: remove background or not
    return: b64 of the first face already cutted
    """
    # If both path and b64 are unchanged, return error
    if not path and not b64:
        return "no image given", 400
        
    # If path is given, read the image if valid
    if not path == "":
        try:
            img = cv2.imread(path,1)

        except Exception as e:
            return "invalid path " ,e , 400

    # If b64 is given, decode the image, write it to a temporary file and get its path
    if not b64 == "":
        try:
            #Named temporary file, will be deleted at the end of the with block
            with tempfile.NamedTemporaryFile(mode = "wb",suffix = "jpg",delete=False) as f:
                f.write(base64.b64decode(b64))
                img = imread(f.name)
                path=f.name
            
            # with open("src/temp_img.jpg",'wb') as f:
            #     f.write(base64.b64decode(b64))
            #     img = imread(f.name)
            #     path=f.name

        except Exception as e:
            return "invalid b64 " ,e , 400

    # Image that will be crooped and rotated to take only the face
    # Invert RGB to BGR to be compatible with opencv
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # obj contains the coordinates of the face
    obj = DeepFace.analyze(img_path=path, prog_bar= False, enforce_detection=False, detector_backend='retinaface')

    posX = obj["region"]["x"] 
    posY = obj["region"]["y"]
    w = obj["region"]["w"] 
    h = obj["region"]["h"] 

    # Crop the face
    frame = crop(img,posX,posY,posX+w,posY+h, ratio = ratio)

    imageFromArray = Image.fromarray(frame)

    # If rmbg is True, remove the background of the face using rembg
    if rmbg : imageFromArray = remove(imageFromArray) 

    # Convert to base64
    buffered = BytesIO()
    imageFromArray.save(buffered,format="PNG")
    base64Img = base64.b64encode(buffered.getvalue())

    return base64Img.decode("ascii")

# Detection of multiple faces features in an image using RetinaFace.detect_faces and then crop and rotate the faces, returns array b64 images
def retinaface_detect_faces_multiple(path="", b64 = "", ratio = 1.6, rmbg = False):
    """
    Extracts all detected faces in the image
    param path: path to the base image
    param b4: b64 of the base image
    param ratio: ratio between the face size and the image size
    param rmbg: remove background or not
    return: array of b64 of all processed faces
    """
 
    #Return variable, contains all faces b64 datas
    faces = []

    if not path and not b64:
        return "no image given", 400
        
    if not path == "":
        try:
            img = imread(path,1)
        except Exception as e:
            return "invalid path ", e, 400

    if not b64 == "":
        try:

            #Named temporary file, will be deleted at the end of the with block
            with tempfile.NamedTemporaryFile(mode = "w+b",suffix = ".jpg",delete=False) as f:
                f.write(base64.b64decode(b64))
                f.flush()
                img = imread(f.name)
                path=f.name

            #FIXME!!!!!!!: if the image is less than 4 kB, it will not be read 
            # So we double write the image to make it at least 4 kB (assuming it's at least 2 kB)            

            # FIXED: if the image is less than 4 kB, the system won't bother to write it (4096 bytes mini)
            # When the file is closed, it is automatically flushed but it is too late because img is already set from an empty file
            # So we flush it before reading it 

        except Exception as e:
            return "invalid b64 ", e, 400

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

            imageFromArray = Image.fromarray(cropAndRotate(img,xt,yt,xb,yb,ratio,xl,yl,xr,yr))

            if rmbg : imageFromArray = remove(imageFromArray)
            
            # Save the image as base64
            buffered = BytesIO()
            imageFromArray.save(buffered,format="PNG")
            base64Img = base64.b64encode(buffered.getvalue())
            # Append the current face to the list of faces
            faces.append(base64Img.decode("ascii"))

        return faces

def retinaface_detect_faces_multiple_data_or_file(imgDataOrFile = "", ratio = 1.6):

    if isPath(imgDataOrFile):
        return retinaface_detect_faces_multiple(path=imgDataOrFile, ratio = ratio)

    else:
        return retinaface_detect_faces_multiple(b64=imgDataOrFile, ratio = ratio)

# Returns the features of a single face in an image, eyes pos, mouth pos and face box using RetinaFace.detect_faces
def detection_faces(path="", b64=""):
    """
    Extracts faces features in the image : eyes pos, mouth pos and face box
    param path: path to the base image
    param b4: b64 of the base image
    return: dict of face features
    """
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

            #Named temporary file, will be deleted at the end of the with block
            with tempfile.NamedTemporaryFile(mode = "wb",suffix = "jpg",delete=False) as f:
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
    data = RetinaFace.detect_faces(path, threshold=0.75)

    if type(data) != dict:

        data = RetinaFace.detect_faces(path, threshold=0.01)

        if type(data) != dict:

            return {'face_1' : {'score': 0}}
    
    return data

def detection_faces_data_or_file(imgDataOrFile = ""):

    if isPath(imgDataOrFile):
        return detection_faces(path=imgDataOrFile)

    else:
        return detection_faces(b64=imgDataOrFile)

