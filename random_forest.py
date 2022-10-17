#!/usr/bin/env python3
# -*- coding: utf-8 -*

from cgi import print_arguments
from io import BytesIO
import multiprocessing
from turtle import shape
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from imblearn.over_sampling import SMOTE
from image_metrics import toCsv, metricsEvaluation, getListOfFiles
from os import listdir
from os.path import isfile, join
from PIL import Image, ImageEnhance
import random
import tempfile
import base64
from cv2 import imread
import os
import threading
from threading import Thread, Lock, Semaphore
import time
import logging
from multiprocessing import Queue, Process, Event
import multiprocessing
from queue import Queue


def model(csvPath, printRes = False):

    df = pd.read_csv(csvPath, delimiter=';')
    df = df.sample(frac=1, random_state=random.seed())

    X = df.drop(columns=['fileName', 'predict'], axis=1)

    # Feature pruning after feature importance study
    X = X.drop(columns=['stdLaplacian','medianLaplacian','minLaplacian','maxLaplacian'], axis=1)
    y = df['predict']
    feature_names = [i for i in X.head()]

    #SMOTE Upsampling Synthetic Minority Oversampling Technique
    smote = SMOTE()
    X_smote, y_smote = smote.fit_resample(X,y)

    if printRes:
        print('Original dataset shape', y.shape)
        print('Resample dataset shape', y_smote.shape)

    X_train, X_test, y_train, y_test= train_test_split(X_smote,y_smote,test_size= 0.3)

    rf = RandomForestClassifier(random_state=random.seed())
    rf.fit(X_train,y_train)

    importances = rf.feature_importances_
    std = np.std([tree.feature_importances_ for tree in rf.estimators_], axis=0)


    forest_importances = pd.Series(importances, index=feature_names)
    if printRes : print(forest_importances)

    predictions= rf.predict(X_test)
    predictions_prob = rf.predict_proba(X_test)


    if printRes :
        print(confusion_matrix(y_test,predictions))
        print('\n')
        print(classification_report(y_test,predictions))

        fig, ax = plt.subplots()
        forest_importances.plot.bar(yerr=std, ax=ax)
        ax.set_title("Feature importances using MDI")
        ax.set_ylabel("Mean decrease in impurity")
        fig.tight_layout()
        plt.show()

    return rf, importances

def testFeatureRelevance(csvPath, nbTest, printRes = False):
    """
    Feature relevance sorted
    """
    rf, importances = model(csvPath)
    res = [0]*len(importances)

    for i in range (nbTest):
        rf, importances = model(csvPath)
        res = [(x+y) for x,y in zip(res,importances)]

    res = [item/nbTest for item in res]

    df = pd.read_csv("BrigthnessComparison.csv", delimiter=";")
    df = df.drop(columns=['stdLaplacian','medianLaplacian','minLaplacian','maxLaplacian','fileName'], axis=1)
    
    colNames = list(df.columns)
    df = pd.DataFrame(dict(names = colNames, values = res))
    
    if printRes :
        # plt.barh(colNames,res)
        df_sorted = df.sort_values('values')
        plt.barh('names', 'values', data=df_sorted)
        plt.title("Mean feature importances")
        plt.xlabel("Feature")
        plt.ylabel("Importance")
        plt.show()

    return res

def createImages(file, factor, mode):
    """
    Creates images with variation
    """
    imgModif = Image.open(file)


    modifEnhencer = None
    # Image enhancement objectss
    if mode == "Brigthness" : modifEnhencer = ImageEnhance.Brightness(imgModif)
    elif mode == "Contrast" : modifEnhencer = ImageEnhance.Contrast(imgModif)
    elif mode == "Sharpness": modifEnhencer = ImageEnhance.Sharpness(imgModif)
    else : return

    for i in factor :

        output = modifEnhencer.enhance(i)
        output.save("featureTest/ContrastTest/modif {:02d}".format(int(i*16))+ mode +"-"+str(i)+".png")

def comparisonFeaturesCsvMaker(folder, feature, start, end):
    """
    Creates a metric csv of a folder of images
    """
    files = getListOfFiles(folder)
    files = sorted(files)
    listOfMetrics=[]

    if (start <= 0): return "invalid start"
    if (end > len(files)): return "invalid end"

    for i in range(start - 1, end):

        print("Analysing: ", files[i][0])
        metrics=metricsEvaluation(files[i][0])
        metrics["fileName"]=files[i][0]
        listOfMetrics.append(metrics)


    toCsv(listOfMetrics, feature+"Comparison["+ str(start) +"-"+ str(end) +"].csv")


    return feature+"Comparison.csv"

def csvMakerPilImg(img):
    
    metrics = None

    with tempfile.NamedTemporaryFile(mode = "wb",suffix = "png") as f:
        img.save(f.name, format="PNG")
        metrics = metricsEvaluation(f.name)
        f.close()

    return metrics

def checkVariationOfFeature(csvPath, colName, modification ="Modified", destinationFolder = ""):
    """
    Saved variations of features 
    """


    df = pd.read_csv(csvPath, delimiter=';')
    colNames = list(df.columns)

    df = pd.DataFrame(dict(names = df["fileName"], values = df[colName]))
    plt.barh('names', 'values', data=df)
    plt.title(colName + "Value")
    plt.xlabel("Feature")
    plt.ylabel("Importance")
    plt.savefig(destinationFolder+"["+modification+"]"+colName+"Value")
    

    return 0

def createImageFromB64(b64):

    with tempfile.NamedTemporaryFile(mode = "w+b",suffix = ".jpg",delete=False) as f:
        f.write(base64.b64decode(b64))
        f.flush()
        img = imread(f.name)
        path=f.name

    if os.exists(path) : os.remove(path)

    return  img

def createImagesFromImage(file):

    imgModif = Image.open(file)

    images = []

    contrast = [1, 1.75]
    brightness = [1, 0.75, 1.75]
    sharpness = [1, 3]

    transformations = []

    for c in contrast:
        for b in brightness:
            for s in sharpness:
                transformations.append((c,b,s))

    for transfo in transformations:

        modifEnhencerC = ImageEnhance.Contrast(imgModif)
        outputC = modifEnhencerC.enhance(transfo[0])
        modifEnhencerB = ImageEnhance.Brightness(outputC)
        outputB = modifEnhencerB.enhance(transfo[1])
        modifEnhencerS = ImageEnhance.Sharpness(outputB)
        outputS = modifEnhencerS.enhance(transfo[2])

        buffered = BytesIO()
        outputS.save(buffered, format="PNG")

        images.append((outputS,transfo[0],transfo[1],transfo[2], base64.b64encode(buffered.getvalue())))
        # outputS.save("featureTest/GeneratedImg/img-"+ str(transfo[0]) +"-"+ str(transfo[1]) +"-"+ str(transfo[2]) +".png")

    return images

def createDictFromModifImages(images):

    resultFeatures = []
    threads = []
    lock = Lock()
    number = 1

    for image in images:
        t = threading.Thread(target = thread_calculation, args=(resultFeatures, number, image, lock,))
        threads.append(t)
        number += 1

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    return resultFeatures

def thread_calculation(features, number, image, lock):

    try: 

        print("Thread starting", number)

        lock.acquire()

        # metrics = csvMakerPilImg(image[0])

        print("metrics done" , number)

        # features.append(metrics,image[0])
        lock.release()

        print("Thread finishing", number)

    except Exception as e:
        print("soucis ", e)




def producer(queue, images):
    print('Producer: Running')
    for image in images:
        queue.put(image)
    for _ in range(200):        
        queue.put(None)
    print('Producer Done')

def consumer(queue, event, allfeatures):
    print('Consumer: Running')
    while True :
        image = queue.get(block = True)
        if image is None:
            print("finito")
            event.set()
            break
        else :
            metrics = csvMakerPilImg(image[0])
            print('ici ça met')
            allfeatures.put([metrics, image[4]], block = True)

    print("Consumer done")


def multiprocessing():

    event = Event()
    allFeatures = Queue()

    images = createImagesFromImage("src/img1.jpg")
    # lock = multiprocessing.Lock()

    queue = Queue()

    consumers = [Process(target=consumer, args = (queue, event, allFeatures)) for x in range(10)]
    for c in consumers:
        c.start()

    producer_process = Process(target=producer, args=(queue, images))
    producer_process.start()


    # while True: 
    #     if event.is_set() & allFeatures.qsize() >= len(images):
    #         for i in consumers:
    #             i.terminate()
    #         break

    # wait for all processes to finish

    producer_process.join()
    for c in consumers :
        c.join()



def consumerThread(queue, lock, allfeatures):
    print('Consumer: Running')
    try:
        while True :
            image = queue.get(block = True)
            if image is None:
                print("finito")
                break
            else :
                metrics = csvMakerPilImg(image[0])
                # lock.acquire()
                allfeatures.put([metrics, image[4]], block = True)
                # lock.release()

        print("Consumer done")

    except Exception as e:
        print(e)


if __name__ == '__main__':

    # lock = Lock()
    # semaphore = Semaphore(value=10)

    # images = createImagesFromImage("src/img1.jpg")
    # allFeatures = Queue()

    # queue = Queue()
    # for image in images:
    #     queue.put(image)

    # # Start consumers
    # consumers = [Thread(target=consumerThread, args = (queue, lock, allFeatures)) for x in range(3)]
    # for c in consumers:
    #     c.start()

    # producer_process = Thread(target=producer, args=(queue, images))
    # producer_process.start()

    # for c in consumers :
    #     c.join()

    # producer_process.join()

    # print("okkk")

    multiprocessing()
