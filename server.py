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

        if request.form["Modification"] == "True" :

            # Take the url parameter from the request.from attribute if there is one
            url = None
            if "url" in request.form:
                url = request.form["url"]
                if url == '':
                    #print("There is no URL "+url)
                    url = None         
                #else:
                    #print("There is an URL "+url)

            zoom = 1.3
            if "zoom" in request.form:
                zoom = request.form["zoom"]
                if zoom == '' :
                    #print("There is no zoom"+ zoom)
                    zoom = 1.3
                else :
                    zoom = abs(float(zoom))
                    #print("There is a zoom "+zoom)

            # Check base64 data of file in request.form (Content-Type)
            file = None
            if "file" in request.form:
                file = request.form["file"]
                if file == '':
                    file = None
                

            # # Take the first file from the request.files dictionnary
            # FIXME : doesn't work because files dont appear in request.files.items(), pass base64 data in reqest instead
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

            #If there is no file -> WORKING WITH URL
            if file is None:
                #If there is no file and an unvalid url -> error
                if not os.path.exists(url):
                    return "Non reachable path! -> " + url, 400
                #Function call
                frame64 = detection_retina.deepface_multiple(
                    path=url,ratio=zoom
                )

            #If there is no ULR -> WORKING WITH FILE    
            else:
                    frame64 = detection_retina.deepface_multiple(
                        b64=file,ratio=zoom
                    )

            response = jsonify({"frameResponse64": frame64})
            response.headers.add("Access-Control-Allow-Origin", "*")

            return response
        
        if request.form["Comparison"] == "True" :

            # request.form["contentType"]
            # request.form["file"]
            # request.form["fileName"]
            # request.form["url"]
            # request.form["url2"]
            # request.form["contentType2"]
            # request.form["file2"]
            # request.form["fileName2"]
            # request.form["Comparison"]
            # request.form["Modification"]

            file = None
            if "file" in request.form:
                file = request.form["file"]
                if file == '':
                    file = None

            file2 = None
            if "file2" in request.form:
                file2 = request.form["file2"]
                if file2 == '':
                    file2 = None

            url = None
            if "url" in request.form:
                url = request.form["url"]
                if not os.path.exists(url):
                    return "Non reachable path! -> " + url, 400
                if url == '':
                    #print("There is no URL "+url)
                    url = None   

            url2 = None
            if "url2" in request.form:
                url2 = request.form["url2"]
                if not os.path.exists(url2):
                    return "Non reachable path! -> " + url2, 400
                if url2 == '':
                    #print("There is no URL "+url)
                    url2 = None   

            filtered = list(filter(None,[file,file2,url,url2]))
            
            return 1
        
        else :

            return "Unknown functionnality", 400


    
if __name__ == "__main__":
    start_time = time.time()
    app.run(host="0.0.0.0", port=7071)
    print(
        "--- %s seconds ---" % (time.time() - start_time)
    )  # Display the time taken by the algorithm