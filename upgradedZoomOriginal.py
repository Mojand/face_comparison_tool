#!/usr/bin/env python3

# import the necessary packages

import argparse
from pyexpat import model
import time
import cv2
import os
# construct the argument parser and parse the arguments

def upgradedZoom(model_name = "src/LapSRN_x4.pb", image_name = "src/cropped.jpg"):


    # extract the model name and model scale from the file path
    modelName = model_name.split(os.path.sep)[-1].split("_")[0].lower()
    modelScale = model_name.split("_x")[-1]
    modelScale = int(modelScale[:modelScale.find(".")])

    # initialize OpenCV's super resolution DNN object, load the super
    # resolution model from disk, and set the model name and scale
    print("[INFO] loading super resolution model: {}".format(
        model_name))
    print("[INFO] model name: {}".format(modelName))
    print("[INFO] model scale: {}".format(modelScale))
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(model_name)
    sr.setModel(modelName, modelScale)

    # load the input image from disk and display its spatial dimensions
    image = cv2.imread(image_name)
    print("[INFO] w: {}, h: {}".format(image.shape[1], image.shape[0]))
    # use the super resolution model to upscale the image, timing how
    # long it takes
    start = time.time()
    upscaled = sr.upsample(image)
    end = time.time()
    print("[INFO] super resolution took {:.6f} seconds".format(
        end - start))
    # show the spatial dimensions of the super resolution image
    print("[INFO] w: {}, h: {}".format(upscaled.shape[1],
        upscaled.shape[0]))

    # resize the image using standard bicubic interpolation
    start = time.time()
    bicubic = cv2.resize(image, (upscaled.shape[1], upscaled.shape[0]),
        interpolation=cv2.INTER_CUBIC)
    end = time.time()
    print("[INFO] bicubic interpolation took {:.6f} seconds".format(
        end - start))

    # show the original input image, bicubic interpolation image, and
    # super resolution deep learning output
    cv2.imshow("Original", image)
    cv2.imshow("Bicubic", bicubic)
    cv2.imshow("Super Resolution", upscaled)
    cv2.waitKey(0)

upgradedZoom()