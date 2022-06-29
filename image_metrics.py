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
from PIL import Image, ImageStat, ImageFilter
import matplotlib.pyplot as plt
from skimage.io import imread, imshow
from skimage.color import rgb2hsv, rgb2gray, rgb2yuv
from skimage import color, exposure, transform
from skimage.exposure import equalize_hist
import csv


# Generate a dictionary of all the metrics
def metricsEvaluation(file):

    #The dictionary is used to store the metrics and filled in each function
    metrics = {}

    brightness, variance, rms = meanBrightness(file, metrics)
    laplacian, variance, rms = laplacianOperatorOnImage(file, metrics)
    mean, std, min, max, top = fourierTransformImage(file, metrics)
    brisque = brisqueScore(file, metrics)
    sharpness = AverageGradientMagnitude(file, metrics)
    sumModulusDifference = SumModulusDifference(file, metrics)
    tenengrad = tenengrad(file, metrics)

    return metrics

def brisqueScore(url, dict):
    
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
        dict["mscn"] = (image - local_mean) / (local_var + C)

        return (image - local_mean) / (local_var + C)
        

    def generalized_gaussian_dist(x, alpha, sigma):
        # beta --------------------------------------------------------------------------------------------------------------------
        beta = sigma * np.sqrt(special.gamma(1 / alpha) / special.gamma(3 / alpha))
        dict["beta"] = beta

        coefficient = alpha / (2 * beta * special.gamma(1 / alpha))
        dict["coefficient"] = coefficient
        # GGD density function ----------------------------------------------------------------------------------------------------
        dict["ggd"] = coefficient * np.exp(-(np.abs(x) / beta) ** alpha)
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


    image = skimage.io.imread(url, plugin='pil')
    gray_image = skimage.color.rgb2gray(image)

    _ = skimage.io.imshow(image)


    brisque_features = calculate_brisque_features(gray_image, kernel_size=7, sigma=7/6)

    downscaled_image = cv2.resize(gray_image, None, fx=1/2, fy=1/2, interpolation = cv2.INTER_CUBIC)
    downscale_brisque_features = calculate_brisque_features(downscaled_image, kernel_size=7, sigma=7/6)

    brisque_features = np.concatenate((brisque_features, downscale_brisque_features))

    def scale_features(features):
        with open('src/normalize.pickle', 'rb') as handle:
            scale_params = pickle.load(handle)
        
        min_ = np.array(scale_params['min_'])
        max_ = np.array(scale_params['max_'])
        
        return -1 + (2.0 / (max_ - min_) * (features - min_))

    def calculate_image_quality_score(brisque_features):
        model = svmutil.svm_load_model('src/brisque_svm.txt')
        scaled_brisque_features = scale_features(brisque_features)

        x, idx = svmutil.gen_svm_nodearray(
            scaled_brisque_features,
            isKernel=(model.param.kernel_type == svmutil.PRECOMPUTED))
        
        nr_classifier = 1
        prob_estimates = (svmutil.c_double * nr_classifier)()
        
        return svmutil.libsvm.svm_predict_probability(model, x, prob_estimates)

    # brisque score -----------------------------------------------------------------------------------------------------
    dict["brisque_score"] = calculate_image_quality_score(brisque_features)
    return calculate_image_quality_score(brisque_features)

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

def AverageGradientMagnitude(file, dict):
    im = Image.open(file).convert('L')
    array = np.asarray(im, dtype=int)
    gy,gx = np.gradient(array)
    grad = np.sqrt(gx**2 + gy**2)
    sharpnessAv = np.average(grad)
    dict["meanGradientMagnitude"] = sharpnessAv
    return sharpnessAv

def tenengrad(file, dict):
    
    img = cv2.imread(file)
    Ix = cv2.Sobel(img, ddepth=cv2.CV_64F, dx=1, dy=0, ksize=3)
    Iy = cv2.Sobel(img, ddepth=cv2.CV_64F, dx=0, dy=1, ksize=3)

    S = Ix*Ix + Iy*Iy
    tenengradMean = cv2.mean(S)[0]
    if np.isnan(tenengradMean):
        dict["tenengrad"] = np.nanmean(S)
        return np.nanmean(S)

    dict["tenengrad"] = tenengradMean
    return tenengradMean

def SumModulusDifference(file, dict):
    sum = 0
    im = Image.open(file).convert('L')
    array = np.asarray(im, dtype=int)
    for i in range(1, len(array)):
        for j in range(1, len(array[0])):
            sum += abs(array[i][j] - array[i][j-1]) + abs(array[i][j] - array[i+1][j])
    
    dict["sumModulusDifference"] = sum
    return sum

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
    
#Generates a csv file with the metrics of the given URL
dictTocsv(metricsEvaluation("src/img1.jpg"))