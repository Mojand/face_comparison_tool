#!/usr/bin/env python3
# -*- coding: utf-8 -*

from crypt import methods
from fileinput import filename
from deepface import DeepFace
from PIL import Image
import io
import base64
import tempfile
import cv2
import detection_retina
import os.path
import time
from io import BytesIO

from flask import Flask, request, jsonify, render_template
from flask_restx import Api, Resource, fields, reqparse



app = Flask(__name__, template_folder="templates", static_folder="templates/static")
api = Api(app=app, title="Frame anaysis", description="Face extraction from a picture")

@app.route("/ui")
def index():
    return render_template("index.html")

@api.route("/face_extraction", methods = ['POST'])

class STM(Resource):

    def post(self):

        # Case 1 : Modification of the image
        """
        Recieves a picture in base64 format or file url, returns all faces in the picture in base64 format in a json format 
        """
        if request.form["Modification"] == "True" :

            # Take the url parameter from the request.from attribute only if there is one
            url = None
            if "url" in request.form:
                url = request.form["url"]
                if url == '':
                    url = None         


            # Take the zoom parameter from the request.from attribute only if there is one, default is 1.3
            zoom = 1.3
            if "zoom" in request.form:
                zoom = request.form["zoom"]
                if zoom == '' :
                    zoom = 1.3
                else :
                    zoom = abs(float(zoom))


            # Check base64 data of file in request.form
            file = None
            if "file" in request.form:
                file = request.form["file"]
                if file == '':
                    file = None
            

            # # Take the first file from the request.files dictionnary
            # FIXME : doesn't work because files dont appear in request.files.items(), for the time being base64 data is passed in request.form instead
            # file = None
            # for file_name, file_pointer in request.files.items():
            #     file = file_pointer.read()
            #     break


            #If there is neither an url or a file -> error
            if url is None and file is None:
                return "no file or url sent", 400

            #If there is both an url and a file -> error
            if url is not None and file is not None:
                return "pick url or file, not both", 500

            #If there is no file data but an url -> use the url to get the file data
            if file is None:
                #If there is no file and an unvalid url -> error
                if not os.path.exists(url):
                    return "Non reachable path! -> " + url, 400
                
                #Function call
                """
                :param url: url of the picture
                :param zoom: zoom factor of the picture
                :return: array with base64 data all detected faces in the picture, returns the whole picture if no face is detected
                """
                frame64 = detection_retina.retinaface_detect_faces_multiple(
                    path=url,ratio=zoom
                )

            #If there is no url but file data -> process the file
            else:
                #Function call
                """
                :param file: file data of the picture
                :param zoom: zoom factor of the picture
                :return: array with base64 data all detected faces in the picture, returns the whole picture if no face is detected
                """
                frame64 = detection_retina.retinaface_detect_faces_multiple(
                    b64=file,ratio=zoom
                )

            #Response in json format sending the base64 data of all detected faces
            response = jsonify({"frameResponse64": frame64})
            #Access control headers to allow cross-origin requests
            response.headers.add("Access-Control-Allow-Origin", "*")

            return response
        
        # Case 2 : Comparison of two pictures
        if request.form["Comparison"] == "True" :

            # Take the file data parameter from the request.from attribute only if there is one
            file = None
            if "file" in request.form:
                file = request.form["file"]
                if file == '':
                    file = None

            #Take the second file data parameter from the request.from attribute only if there is one
            file2 = None
            if "file2" in request.form:
                file2 = request.form["file2"]
                if file2 == '':
                    file2 = None

            #Take the first url parameter from the request.from attribute only if there a valid one
            url = None
            if "url" in request.form:
                url = request.form["url"]
                if not os.path.exists(url) and url != '':
                    return "Non reachable path! 1 -> " + url, 400
                if url == '':
                    url = None   

            #Take the second url parameter from the request.from attribute only if there a valid one
            url2 = None
            if "url2" in request.form:
                url2 = request.form["url2"]
                if not os.path.exists(url2) and url2 != '':
                    return "Non reachable path! 2 -> " + url2, 400
                if url2 == '':
                    url2 = None   
            
            # Delete empty parameters among the four ones
            filtered = list(filter(None,[file,file2,url,url2]))
            
            # We compare only two pictures
            if len(filtered) != 2:
                return "Pick 2 images only", 400 , filtered
                
            #Function call
            """
            Returns the base64 data of the faces in the two pictures
            :param imgDataOrFile: file data or url of the first picture
            :param ratio: zoom factor of the picture, larger because we want the surroundings of the face (larger is less zoomed)
            :return: array with base64 data all detected faces in the picture, returns the whole picture if no face is detected
            """
            faces1 = detection_retina.retinaface_detect_faces_multiple_data_or_file(
                imgDataOrFile=filtered[0],ratio=2.0)
            faces2 = detection_retina.retinaface_detect_faces_multiple_data_or_file(
                imgDataOrFile=filtered[1],ratio=2.0)
            
            # 
            featuresImg1 = []

            for face1 in faces1:    
                #Function call
                """
                Returns facial key positions in the two pictures
                :param imgDataOrFile: file data or url of the first picture
                :return: dictionary with the facial key positions in the picture (facial area, eyes, nose, mouth)
                """ 
                feature = detection_retina.detection_faces_data_or_file(imgDataOrFile = face1)
                
                if feature['face_1']['score'] != 0 :

                    feature['face_1']['facial_area'] =  [float (x) for x in feature['face_1']['facial_area']]
                    feature['face_1']['landmarks']['right_eye'] =  [float (x) for x in feature['face_1']['landmarks']['right_eye']]
                    feature['face_1']['landmarks']['left_eye'] =  [float (x) for x in feature['face_1']['landmarks']['left_eye']]
                    feature['face_1']['landmarks']['nose'] =  [float (x) for x in feature['face_1']['landmarks']['nose']]
                    feature['face_1']['landmarks']['mouth_right'] =  [float (x) for x in feature['face_1']['landmarks']['mouth_right']]
                    feature['face_1']['landmarks']['mouth_left'] =  [float (x) for x in feature['face_1']['landmarks']['mouth_left']]

                    temp = feature['face_1']
                featuresImg1.append((face1,temp))

            

            # features1 = detection_retina.detection_faces_data_or_file(imgDataOrFile=faces1[0])
                        
            # #Convert key positions coordinates to float arrays
            # if features1['face_1']['score'] != 0 :

            #     features1['face_1']['facial_area'] =  [float (x) for x in features1['face_1']['facial_area']]
            #     features1['face_1']['landmarks']['right_eye'] =  [float (x) for x in features1['face_1']['landmarks']['right_eye']]
            #     features1['face_1']['landmarks']['left_eye'] =  [float (x) for x in features1['face_1']['landmarks']['left_eye']]
            #     features1['face_1']['landmarks']['nose'] =  [float (x) for x in features1['face_1']['landmarks']['nose']]
            #     features1['face_1']['landmarks']['mouth_right'] =  [float (x) for x in features1['face_1']['landmarks']['mouth_right']]
            #     features1['face_1']['landmarks']['mouth_left'] =  [float (x) for x in features1['face_1']['landmarks']['mouth_left']]

            featuresImg2 = []

            for face2 in faces2:    
                #Function call
                """
                Returns facial key positions in the two pictures
                :param imgDataOrFile: file data or url of the first picture
                :return: dictionary with the facial key positions in the picture (facial area, eyes, nose, mouth)
                """ 
                feature = detection_retina.detection_faces_data_or_file(imgDataOrFile = face2)
                
                if feature['face_1']['score'] != 0 :

                    feature['face_1']['facial_area'] =  [float (x) for x in feature['face_1']['facial_area']]
                    feature['face_1']['landmarks']['right_eye'] =  [float (x) for x in feature['face_1']['landmarks']['right_eye']]
                    feature['face_1']['landmarks']['left_eye'] =  [float (x) for x in feature['face_1']['landmarks']['left_eye']]
                    feature['face_1']['landmarks']['nose'] =  [float (x) for x in feature['face_1']['landmarks']['nose']]
                    feature['face_1']['landmarks']['mouth_right'] =  [float (x) for x in feature['face_1']['landmarks']['mouth_right']]
                    feature['face_1']['landmarks']['mouth_left'] =  [float (x) for x in feature['face_1']['landmarks']['mouth_left']]

                    temp = feature['face_1']
                featuresImg2.append((face2,temp))

            # features2 = detection_retina.detection_faces_data_or_file(imgDataOrFile=faces2[0])
        
            # if features2['face_1']['score'] != 0 :

            #     features2['face_1']['facial_area'] =  [float (x) for x in features2['face_1']['facial_area']]
            #     features2['face_1']['landmarks']['right_eye'] =  [float (x) for x in features2['face_1']['landmarks']['right_eye']]
            #     features2['face_1']['landmarks']['left_eye'] =  [float (x) for x in features2['face_1']['landmarks']['left_eye']]
            #     features2['face_1']['landmarks']['nose'] =  [float (x) for x in features2['face_1']['landmarks']['nose']]
            #     features2['face_1']['landmarks']['mouth_right'] =  [float (x) for x in features2['face_1']['landmarks']['mouth_right']]
            #     features2['face_1']['landmarks']['mouth_left'] =  [float (x) for x in features2['face_1']['landmarks']['mouth_left']]
    

            #Response in json format sending the base64 data of all detected faces with the facial key positions
            # response = jsonify({"features1": featuresImg2, "features2": features2, "face1": faces1[0], "face2": faces2[0]})
            response = jsonify({"features1": featuresImg1, "features2": featuresImg2})
            #Access control headers to allow cross-origin requests
            response.headers.add("Access-Control-Allow-Origin", "*")

            return response
        
        else :

            return "Unknown functionnality", 400


    
if __name__ == "__main__":
    start_time = time.time()
    app.run(host="0.0.0.0", port=7071)
    print(
        "--- %s seconds ---" % (time.time() - start_time)
    )  # Display the time taken by the algorithm