#! python3
import collections
from itertools import chain
import urllib.request as request
import pickle 
import numpy as np
import scipy.signal as signal
import scipy.special as special
import scipy.optimize as optimize
import matplotlib.pyplot as plt
import skimage.io
import skimage.transform
import cv2
from libsvm import svmutil
import math



#Display img0,5.png img2.png img1,3.png in the same figure

# read image
# img05 = cv2.imread('./Img05.png')
# img05 = cv2.cvtColor(img05,cv2.COLOR_RGB2BGR)
# img13 = cv2.imread('./Img13.png')
# img13 = cv2.cvtColor(img13,cv2.COLOR_RGB2BGR)
# img2 = cv2.imread('./Img2.png')
# img2 = cv2.cvtColor(img2,cv2.COLOR_RGB2BGR)

# plt.figure(figsize=(12, 9))

# plt.subplot(1, 3, 1)
# plt.imshow(img05)
# plt.title('Zoom = 0.5')
# plt.subplot(1, 3, 2)
# plt.imshow(img2)
# plt.title('Zoom = 2')
# plt.subplot(1, 3, 3)
# plt.imshow(img13)
# plt.title('Zoom = 1.3')
            
# plt.show()

# read image
img05 = cv2.imread('/home/csd/Téléchargements/modifiedImage(4).png')
img05 = cv2.cvtColor(img05,cv2.COLOR_RGB2BGR)
img13 = cv2.imread('/home/csd/Téléchargements/modifiedImage(2).png')
img13 = cv2.cvtColor(img13,cv2.COLOR_RGB2BGR)
img2 = cv2.imread('/home/csd/Téléchargements/modifiedImage(6).png')
img2 = cv2.cvtColor(img2,cv2.COLOR_RGB2BGR)
img3 = cv2.imread('/home/csd/Téléchargements/modifiedImage(3).png')
img3 = cv2.cvtColor(img3,cv2.COLOR_RGB2BGR)

plt.figure(figsize=(6, 8))

plt.subplot(2, 2, 1)
plt.imshow(img05)
plt.subplot(2, 2, 2)
plt.imshow(img2)
plt.subplot(2, 2, 3)
plt.imshow(img13)
plt.subplot(2, 2, 4)
plt.imshow(img3)

            
plt.show()