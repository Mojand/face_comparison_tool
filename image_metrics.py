#! python3
import collections
import json
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
from PIL import Image, ImageStat, ImageFilter
import matplotlib.pyplot as plt
from skimage.io import imread, imshow
from skimage.color import rgb2hsv, rgb2gray, rgb2yuv
from skimage import color, exposure, transform
from skimage.exposure import equalize_hist
import csv

from datetime import datetime
import glob, os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

face_cascade = cv2.CascadeClassifier('/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/haarcascade_frontalface_default.xml')


# Generate a dictionary of all the metrics
def metricsEvaluation(file):

    #The dictionary is used to store the metrics and filled in each function
    metrics = {}

    # print("&", end=' ')
    brightness, variance, rms = meanBrightness(file, metrics)
    # print("%", end=' ')
    laplacian, variance, rms = laplacianOperatorOnImage(file, metrics)
    # print("$", end=' ')
    mean, std, min, max, top = fourierTransformImage(file, metrics)
    # print("@", end=' ')
    brisque = brisqueScore(file, metrics)

    image = cv2.imread(file)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # print("+", end=' ')
    alpha, beta, clip_hist_percent, maximum_gray = automatic_brightness_and_contrast(gray)
    metrics['alpha_grey']=alpha
    metrics['beta_grey']=beta
    metrics['maximum_grey']=maximum_gray
    metrics['clip_hist_percent_grey']=clip_hist_percent

    # print("-", end=' ')
    max_face_proportion, horizProp, vertProp= getFaceProportions(gray)
    metrics['max_face_proportion']=max_face_proportion
    metrics['horizontal_face_proportion']=horizProp
    metrics['vertical_face_proportion']=vertProp
    # print("#", end=' ')
    metrics['faceQScore'] = faceQNET(file)
    # print("?", end =' ')
    with Image.open(file) as image:
        metrics['height'] = image.height
        metrics['width'] = image.width
    # print("!", end = ' ')
    metrics['xt'],metrics['yt'],metrics['xb'],metrics['yb'] = retinaFaceDetection(file)

    return metrics

def brisqueScore(url, dict):
    """
    Calculates the BRISQUE score of an image
    :param url: file name of the image
    :param dict: dictionnary to b
    """
    
    def normalize_kernel(kernel):
        return kernel / np.sum(kernel)

    def gaussian_kernel2d(n, sigma):
        Y, X = np.indices((n, n)) - int(n/2)
        gaussian_kernel = 1 / (2 * np.pi * sigma ** 2) * np.exp(-(X ** 2 + Y ** 2) / (2 * sigma ** 2)) 
        return normalize_kernel(gaussian_kernel)

    def local_mean(image, kernel):
        return signal.convolve2d(image, kernel, 'same')

    def local_deviation(image, local_mean, kernel):
        "Vectorized approximation of local deviation"
        sigma = image ** 2
        sigma = signal.convolve2d(sigma, kernel, 'same')
        return np.sqrt(np.abs(local_mean ** 2 - sigma))

    def calculate_mscn_coefficients(image, kernel_size=6, sigma=7/6):
        C = 1/255
        kernel = gaussian_kernel2d(kernel_size, sigma=sigma)
        # Local mean --------------------------------------------------------------------------------------------------------------
        local_mean = signal.convolve2d(image, kernel, 'same')
        dict["localMeanStd"] = np.std(local_mean)
        dict["localMeanMean"] = np.mean(local_mean)
        dict["localMeanMin"] = np.min(local_mean)
        dict["localMeanMax"] = np.max(local_mean)
        dict["localMeanMedian"] = np.median(local_mean)

        # Local var ---------------------------------------------------------------------------------------------------------------
        local_var = local_deviation(image, local_mean, kernel)
        dict["localVarStd"] = np.std(local_var)
        dict["localVarMean"] = np.mean(local_var)
        dict["localVarMin"] = np.min(local_var)
        dict["localVarMax"] = np.max(local_var)
        dict["localVarMedian"] = np.median(local_var)

        # Mean substracted contrast normalized ------------------------------------------------------------------------------------
        dict["mscnStd"] = np.std((image - local_mean) / (local_var + C))
        dict["mscnMean"] = np.mean((image - local_mean) / (local_var + C))
        dict["mscnMin"] = np.min((image - local_mean) / (local_var + C))
        dict["mscnMax"] = np.max((image - local_mean) / (local_var + C))
        dict["mscnMedian"] = np.median((image - local_mean) / (local_var + C))
        #dict["mscn"] = (image - local_mean) / (local_var + C)

        return (image - local_mean) / (local_var + C)
        

    def generalized_gaussian_dist(x, alpha, sigma):
        # beta --------------------------------------------------------------------------------------------------------------------
        beta = sigma * np.sqrt(special.gamma(1 / alpha) / special.gamma(3 / alpha))
        dict["beta"] = beta

        coefficient = alpha / (2 * beta * special.gamma(1 / alpha))
        dict["coefficient"] = coefficient
        # GGD density function ----------------------------------------------------------------------------------------------------
         #dict["ggd"] = coefficient * np.exp(-(np.abs(x) / beta) ** alpha)
        return coefficient * np.exp(-(np.abs(x) / beta) ** alpha)


    # Multiplication des mscn_coefficients adjacents et diagonaux------------------------------------------------------------------
    def calculate_pair_product_coefficients(mscn_coefficients):
        return collections.OrderedDict({
            'mscn': mscn_coefficients,
            'horizontal': mscn_coefficients[:, :-1] * mscn_coefficients[:, 1:],
            'vertical': mscn_coefficients[:-1, :] * mscn_coefficients[1:, :],
            'main_diagonal': mscn_coefficients[:-1, :-1] * mscn_coefficients[1:, 1:],
            'secondary_diagonal': mscn_coefficients[1:, :-1] * mscn_coefficients[:-1, 1:]
        })

    
    def asymmetric_generalized_gaussian(x, nu, sigma_l, sigma_r):
        def beta(sigma):
            return sigma * np.sqrt(special.gamma(1 / nu) / special.gamma(3 / nu))
        
        coefficient = nu / ((beta(sigma_l) + beta(sigma_r)) * special.gamma(1 / nu))
        f = lambda x, sigma: coefficient * np.exp(-(x / beta(sigma)) ** nu)
            
        return np.where(x < 0, f(-x, sigma_l), f(x, sigma_r))


    def asymmetric_generalized_gaussian_fit(x):
        # Rhô estimé---------------------------------------------------------------------------
        def estimate_phi(alpha):
            numerator = special.gamma(2 / alpha) ** 2
            denominator = special.gamma(1 / alpha) * special.gamma(3 / alpha)
            dict["rho"] = numerator[0] / denominator[0]
            return numerator / denominator

        # r estimé-----------------------------------------------------------------------------
        def estimate_r_hat(x):
            size = np.prod(x.shape)
            dict["r"] = (np.sum(np.abs(x)) / size) ** 2 / (np.sum(x ** 2) / size)
            return (np.sum(np.abs(x)) / size) ** 2 / (np.sum(x ** 2) / size)

        # R estimé-----------------------------------------------------------------------------
        def estimate_R_hat(r_hat, gamma):
            numerator = (gamma ** 3 + 1) * (gamma + 1)
            denominator = (gamma ** 2 + 1) ** 2
            dict["R"] = r_hat * numerator[0] / denominator[0]
            return r_hat * numerator / denominator

        def mean_squares_sum(x, filter = lambda z: z == z):
            filtered_values = x[filter(x)]
            squares_sum = np.sum(filtered_values ** 2)
            return squares_sum / ((filtered_values.shape))

        # Gamma estimé --------------------------------------------------------------------------
        def estimate_gamma(x):
            left_squares = mean_squares_sum(x, lambda z: z < 0)
            right_squares = mean_squares_sum(x, lambda z: z >= 0)
            dict["gamma"] = np.sqrt(left_squares)[0] / np.sqrt(right_squares)[0]
            return np.sqrt(left_squares) / np.sqrt(right_squares)

        # Alpha estimé -------------------------------------------------------------------------
        def estimate_alpha(x):
            r_hat = estimate_r_hat(x)
            gamma = estimate_gamma(x)
            R_hat = estimate_R_hat(r_hat, gamma)

            solution = optimize.root(lambda z: estimate_phi(z) - R_hat, [0.2]).x
            dict["alpha"] = solution[0]
            return solution[0]

        def estimate_sigma(x, alpha, filter = lambda z: z < 0):
            return np.sqrt(mean_squares_sum(x, filter))
        
        def estimate_mean(alpha, sigma_l, sigma_r):
            return (sigma_r - sigma_l) * constant * (special.gamma(2 / alpha) / special.gamma(1 / alpha))
        
        alpha = estimate_alpha(x)
        sigma_l = estimate_sigma(x, alpha, lambda z: z < 0)
        sigma_r = estimate_sigma(x, alpha, lambda z: z >= 0)
        
        ggd = generalized_gaussian_dist(x,alpha ,(sigma_l[0]+sigma_r[0])/2 )

        
        constant = np.sqrt(special.gamma(1 / alpha) / special.gamma(3 / alpha))
        mean = estimate_mean(alpha, sigma_l, sigma_r)
        
        return alpha, mean, sigma_l, sigma_r

    def calculate_brisque_features(image, kernel_size=7, sigma=7/6):
        def calculate_features(coefficients_name, coefficients, accum=np.array([])):
            alpha, mean, sigma_l, sigma_r = asymmetric_generalized_gaussian_fit(coefficients)

            if coefficients_name == 'mscn':
                var = (sigma_l ** 2 + sigma_r ** 2) / 2
                return [alpha, var]
            
            return [alpha, mean, sigma_l ** 2, sigma_r ** 2]
        
        mscn_coefficients = calculate_mscn_coefficients(image, kernel_size, sigma)
        coefficients = calculate_pair_product_coefficients(mscn_coefficients)

        
        features = [calculate_features(name, coeff) for name, coeff in coefficients.items()]
        flatten_features = list(chain.from_iterable(features))
        return np.array(flatten_features, dtype=object)

    def load_image(url):
        image_stream = request.urlopen(url)
        return skimage.io.imread(image_stream, plugin='pil')

    def plot_histogram(x, label):
        n, bins = np.histogram(x.ravel(), bins=50)
        n = n / np.max(n)
        plt.plot(bins[:-1], n, label=label, marker='o')

    plt.rcParams["figure.figsize"] = 12, 9


    # image = skimage.io.imread(url, plugin='pil')
    # cv2 "handles" the transparency of png images, the image is not good
    # but at least the next line for the gray scale do not exploses
    image = cv2.imread(url)

    gray_image = skimage.color.rgb2gray(image)

    # _ = skimage.io.imshow(image)


    brisque_features = calculate_brisque_features(gray_image, kernel_size=7, sigma=7/6)

    downscaled_image = cv2.resize(gray_image, None, fx=1/2, fy=1/2, interpolation = cv2.INTER_CUBIC)
    downscale_brisque_features = calculate_brisque_features(downscaled_image, kernel_size=7, sigma=7/6)

    brisque_features = np.concatenate((brisque_features, downscale_brisque_features))

    def scale_features(features):
        with open('/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/normalize.pickle', 'rb') as handle:
            scale_params = pickle.load(handle)
        
        min_ = np.array(scale_params['min_'])
        max_ = np.array(scale_params['max_'])
        
        return -1 + (2.0 / (max_ - min_) * (features - min_))

    def calculate_image_quality_score(brisque_features):
        model = svmutil.svm_load_model('/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/brisque_svm.txt')
        scaled_brisque_features = scale_features(brisque_features)

        x, idx = svmutil.gen_svm_nodearray(
            scaled_brisque_features,
            isKernel=(model.param.kernel_type == svmutil.PRECOMPUTED))
        
        nr_classifier = 1
        prob_estimates = (svmutil.c_double * nr_classifier)()
        
        return svmutil.libsvm.svm_predict_probability(model, x, prob_estimates)

    # brisque score -----------------------------------------------------------------------------------------------------
    dict["brisque_score"] = calculate_image_quality_score(brisque_features)
    return dict["brisque_score"]

def meanBrightness(file,dict):

    #Grayscaled
    im = Image.open(file).convert('L')
    stat = ImageStat.Stat(im)
    
    dict["meanBrightness"] = stat.mean[0]
    dict["stdBrightness"] = stat.stddev[0]
    dict["medianBrightness"] = stat.median[0]
    dict["minBrightness"] = stat.extrema[0][0]
    dict["maxBrightness"] = stat.extrema[0][1]
    dict["rmsBrightness"] = stat.rms[0]

    return stat.mean[0], stat.var[0], stat.rms[0]

def laplacianOperatorOnImage(file, dict):
    im = Image.open(file).convert('L')
    im = im.filter(ImageFilter.FIND_EDGES)
    stat = ImageStat.Stat(im)
    
    dict["meanLaplacian"] = stat.mean[0]
    dict["stdLaplacian"] = stat.stddev[0]
    dict["medianLaplacian"] = stat.median[0]
    dict["minLaplacian"] = stat.extrema[0][0]
    dict["maxLaplacian"] = stat.extrema[0][1]
    dict["rmsLaplacian"] = stat.rms[0]

    return stat.mean[0], stat.var[0], stat.rms[0]

def averageOfTop90PercentArray(array):
    return np.mean(np.sort(array)[int(len(array)*0.9):])

def fourierTransformImage(file, dict):
    grayim = Image.open(file).convert('L')
    dark_image_grey_fourier = np.fft.fftshift(np.fft.fft2(grayim))
    # plt.figure(num=None, figsize=(8, 6), dpi=80)
    # plt.imshow(np.log(abs(dark_image_grey_fourier)), cmap='gray')
    # plt.show()
    # plt.imshow(grayim, cmap='gray')
    # plt.show()
    # stat = ImageStat.Stat(np.log(abs(dark_image_grey_fourier)))
    dict["meanFourier"] = np.mean(abs(dark_image_grey_fourier))
    dict["stdFourier"] = np.std(abs(dark_image_grey_fourier))
    dict["medianFourier"] = np.median(abs(dark_image_grey_fourier))
    dict["minFourier"] = np.min(abs(dark_image_grey_fourier))
    dict["maxFourier"] = np.max(abs(dark_image_grey_fourier))
    dict["averageOfTop90PercentFourier"] = averageOfTop90PercentArray(abs(dark_image_grey_fourier))

    return np.mean(abs(dark_image_grey_fourier)), np.std(abs(dark_image_grey_fourier)) ,np.min(abs(dark_image_grey_fourier)), np.max(abs(dark_image_grey_fourier)), averageOfTop90PercentArray(abs(dark_image_grey_fourier))

def blurImage(file):
    im = Image.open(file).convert('L')
    im = im.filter(ImageFilter.GaussianBlur(radius=5))
    im.save("src/blur.png")
    return im

def dictTocsv(dict):
    ct = 0
    with open('metrics.csv', 'a') as f:
        for key in dict:

            if isinstance(dict[key], list) or isinstance(dict[key], np.ndarray):
                
                for i in dict[key]:
                    if isinstance(i, list) or isinstance(i, np.ndarray):
                        for j in i:
                            f.write(str(j) + ",")
                            ct += 1

                    if isinstance(dict[key], float) or isinstance(dict[key], int):
                        f.write(str(i) + ",")
                        ct += 1
                    
            else:
                f.write(str(dict[key]) + ",") 
                ct += 1
    print(ct)

def read_transparent_png(filename):
    image_4channel = cv2.imread(filename, cv2.IMREAD_UNCHANGED)
    alpha_channel = image_4channel[:,:,3]
    rgb_channels = image_4channel[:,:,:3]

    # White Background Image
    white_background_image = np.ones_like(rgb_channels, dtype=np.uint8) * 255

    # Alpha factor
    alpha_factor = alpha_channel[:,:,np.newaxis].astype(np.float32) / 255.0
    alpha_factor = np.concatenate((alpha_factor,alpha_factor,alpha_factor), axis=2)

    # Transparent Image Rendered on White Background
    base = rgb_channels.astype(np.float32) * alpha_factor
    white = white_background_image.astype(np.float32) * (1 - alpha_factor)
    final_image = base + white
    return final_image.astype(np.uint8)

def getListOfFiles(folder):
    """
    Recursively gets all files in the given folder, and sub folders
    :param folder: initial folder
    :return: list of file name, and root folder
    """
    returnValue=[]
    for root, dirs, files in os.walk(folder):
        for file in files:
            returnValue.append([os.path.join(root, file),root.split("/")[-1]])

    return returnValue

def automatic_brightness_and_contrast(gray, clip_hist_percent=1):
    '''
    Calculation of the patterns to automatically set brightness and contrast
    of an image
    :param imageFile:
    :param dict:
    :param clip_hist_percent:
    :return:
    '''

    # Calculate grayscale histogram
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist_size = len(hist)

    # Calculate cumulative distribution from the histogram
    accumulator = []
    accumulator.append(float(hist[0]))
    for index in range(1, hist_size):
        accumulator.append(accumulator[index - 1] + float(hist[index]))

    # Locate points to clip
    maximum = accumulator[-1]
    clip_hist_percent *= (maximum / 100.0)
    clip_hist_percent /= 2.0

    # Locate left cut
    minimum_gray = 0
    while accumulator[minimum_gray] < clip_hist_percent:
        minimum_gray += 1

    # Locate right cut
    maximum_gray = hist_size - 1
    while accumulator[maximum_gray] >= (maximum - clip_hist_percent):
        maximum_gray -= 1

    # Calculate alpha and beta values
    alpha = 255 / (maximum_gray - minimum_gray)
    beta = -minimum_gray * alpha

    '''
    # Calculate new histogram with desired range and show histogram 
    new_hist = cv2.calcHist([gray],[0],None,[256],[minimum_gray,maximum_gray])
    plt.plot(hist)
    plt.plot(new_hist)
    plt.xlim([0,256])
    plt.show()
    '''

    # auto_result = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    #return (auto_result, alpha, beta)
    return alpha, beta, maximum, clip_hist_percent

def getRelativePositionOfFace(imageDimensionSize,faceStart, faceLenght):
    """
    Gets the proportion of a given dimension
    :param imageSize: lenght or width of the image, the same dimension of the other
    two paramenterw
    :param faceStart: starting poing in the face
    :param faceLenght: lenght of the face for that given dimension
    :return:
    """
    middleOfImage=imageDimensionSize/2

    middleOfFace=faceStart+(faceLenght/2)

    faceRelativePositionDifference=middleOfFace-middleOfImage

    proportionFace = faceRelativePositionDifference * 100 / middleOfImage

    return proportionFace

def getFaceProportions(gray):
    """
    Returns the proportion of the biggest face, regarding the size of the image
    :param gray: image to verify proportion, in shades of gray
    :return: proportion of the bigest face, regarding the size of the image
    """
    proportion=0
    horizontal = 0
    vertical=0
    if len(gray) > 1:
        biggestFace = getBiggestFaceOnImage(gray)
        if biggestFace:
            # proportion calculation
            v = gray.shape
            imageSize = v[0] * v[1]
            proportion = biggestFace[0] / imageSize

            # Gets the relative position of the face regarding the center of the image
            vertical = getRelativePositionOfFace(v[0],biggestFace[2], biggestFace[4])
            horizontal = getRelativePositionOfFace(v[1],biggestFace[1], biggestFace[3])


    return proportion, horizontal, vertical

import random

def getBiggestFaceOnImage(gray):
    """
    Returns the biggest zone of detected faces in the image
    :param gray:
    :return:
    """
    faces = face_cascade.detectMultiScale(gray, 1.05, 4)
    biggest = 0
    returnVector=[]
    for (x, y, w, h) in faces:
        area = w * y
        if area > biggest:
            biggest = area
            returnVector=[biggest,x, y, w, h]
    # if returnVector:
    #     gray2 = cv2.rectangle(gray, (returnVector[1], returnVector[2]), (returnVector[1] + returnVector[3], returnVector[2] + returnVector[4]), (255, 0, 0), 2)
    #     cv2.imwrite("test_"+str(random.random()*1000)+".jpg", gray2)
    return returnVector

def toCsv(object, fileName, delimiter=";"):
    """
    Saves the object into a csv file
    :param object: The object to save, normally a list of dictionaries
    :param fileName: name of the target CSV file
    """

    # get the name of the columns to use as header
    columns=[]
    if isinstance(object, list):
        if len(object)>0 and isinstance(object[0], dict):
            columns = object[0].keys()
    elif  isinstance(object, dict):
        columns = object.keys()

    # saves the object ito a csv
    with open(fileName, 'w') as csvfile:
        writer = csv.DictWriter(csvfile, delimiter=delimiter, fieldnames=columns)
        writer.writeheader()
        writer.writerows(object)

from keras.models import load_model

def faceQNET(file):
    """
    Calculation of FaceQNet score
    :param file: image filename to be assessed
    """
    batch_size = 1

    img = cv2.resize(cv2.imread(file, cv2.IMREAD_COLOR), (224, 224))
    imgArray = np.array([img], copy=False, dtype=np.float32)
    model = load_model("/home/csd/Bureau/FaceQnet-master/src/FaceQnet_v1.h5")
    score = model.predict(imgArray, batch_size=batch_size, verbose=0)

    return score[0][0]

from retinaface import RetinaFace

def retinaFaceDetection(file):
    """ 
    Uses RetinaFace to detect the face in the image
    :param file: filename of the image to be detected
    :return: coordinates of the face according to RetinaFace
    """ 
    data = RetinaFace.detect_faces(file)
    if type(data) != dict:
        return 0,0,0,0

    else:
        for i, j in data.items():
            xt,yt,xb,yb = j['facial_area'][0],j['facial_area'][1],j['facial_area'][2],j['facial_area'][3]
            return xt,yt,xb,yb

if __name__ == '__main__':
    startTime = datetime.now()
    imagesFolder="/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/Database/photo_questions"
    listOfMetrics=[]
    listOfImages=getListOfFiles(imagesFolder)
    # For each image fond, collects the metrics and add the name of the
    # folder as the label of the image
    for image in listOfImages:
        print("Analysing: ", image[0])
        metrics=metricsEvaluation(image[0])
        metrics["fileName"]=image[0]
        metrics["predict"]=image[1]
        listOfMetrics.append(metrics)
        #image = cv2.imread(image[0])

    toCsv(listOfMetrics, "listOfMetricsImageQualityWithFaceQnetandRetinaFace.csv")
    # saves the metrics
    # with open("listOfMetricsImageQuality.json","w") as f:
    #     json.dump(listOfMetrics,f)

    endTime = datetime.now()
    print("************************************")
    print("Start: ", startTime)
    print("End: ", endTime)
    print("Time elapsed: ", (endTime - startTime))
    print("************************************")


#print(retinaFaceDetection("/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/Database/photo_questions/beyonce_question_1.jpg"))
#print(retinaFaceDetection("/home/csd/Images/Presentation.png"))
#Generates a csv file with the metrics of the given URL
# dictTocsv(metricsEvaluation("src/img1.jpg"))

