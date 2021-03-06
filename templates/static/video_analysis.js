var radios = null;
var buttons = null;

// global variable saving input file content
var Deepface_author1_data;
var PyFeat_author1_data;

var radios = document.getElementsByName("radios");

var buttons = document.getElementsByName("button_type");

var displayField = document.getElementById("responseDisplay");

var btnResetFile = document.getElementById("resetFileBtn");

/* ##################################################################################################################*/
// event listener drag and drop

// Deepface - drag & drop
// Search for
document
  .querySelectorAll(".drop-zone__input[name=fileModif]")
  .forEach((inputElement) => {
    const dropZoneElement = document.getElementById("Modification_dz1");

    dropZoneElement.addEventListener("click", (e) => {
      inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
      if (inputElement.files.length) {
        var reader = new FileReader();
        reader.readAsText(inputElement.files[0]);
        // save dropped file as string in data variable
        reader.onload = function () {
          var text = reader.result;
          Deepface_author1_data = text;
        };
        updateThumbnail(dropZoneElement, inputElement.files[0]);
      }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
      dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("drop-zone--over");
      });
    });

    dropZoneElement.addEventListener("drop", (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        var current_file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
        // save dropped file as string in data variable
        reader.onload = function () {
          var text = reader.result;
          Deepface_author1_data = text;
        };
        inputElement.files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
      }
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

// 
document
  .querySelectorAll(".drop-zone__input[name=fileComp1]")
  .forEach((inputElement) => {
    const dropZoneElement = document.getElementById("Comparison_dz1");

    dropZoneElement.addEventListener("click", (e) => {
      inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
      if (inputElement.files.length) {
        var reader = new FileReader();
        reader.readAsText(inputElement.files[0]);
        // save dropped file as string in data variable
        reader.onload = function () {
          var text = reader.result;
          PyFeat_author1_data = text;
        };
        updateThumbnail(dropZoneElement, inputElement.files[0]);
      }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
      dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("drop-zone--over");
      });
    });

    dropZoneElement.addEventListener("drop", (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        var current_file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
        // save dropped file as string in data variable
        reader.onload = function () {
          var text = reader.result;
          PyFeat_author1_data = text;
        };
        inputElement.files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
      }
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  document
  .querySelectorAll(".drop-zone__input[name=fileComp2]")
  .forEach((inputElement) => {
    const dropZoneElement = document.getElementById("Comparison_dz2");

    dropZoneElement.addEventListener("click", (e) => {
      inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
      if (inputElement.files.length) {
        var reader = new FileReader();
        reader.readAsText(inputElement.files[0]);
        // save dropped file as string in data variable
        reader.onload = function () {
          var text = reader.result;
          PyFeat_author1_data = text;
        };
        updateThumbnail(dropZoneElement, inputElement.files[0]);
      }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
      dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("drop-zone--over");
      });
    });

    dropZoneElement.addEventListener("drop", (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        var current_file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
        // save dropped file as string in data variable
        reader.onload = function () {
          var text = reader.result;
          PyFeat_author1_data = text;
        };
        inputElement.files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
      }
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

function getB64Str(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function downloadFile(content, fileName) {
  var encodedUri = encodeURI(content);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link); // Required for FF
  link.click();
}

function returnInCSVs() {
  // transform the entities and relations into downlodable CSV files
  // entities

  try {
    var entities = vectResponse["list"];

    // collects the names  of the entities, i.e all the possible column names for the csv
    var sKeys = new Set();
    for (i in entities) {
      for (var key in entities[i]) {
        sKeys.add(key);
      }
    }
    let keys = Array.from(sKeys);
    keys.sort();

    // create column names for the CSV file
    var rowLabel = "";
    for (label of keys) {
      rowLabel += label + ";";
    }
    rowLabel = rowLabel.slice(0, -1);

    // create the csv file lines
    var csvContentE = "data:text/csv;charset=utf-8,";
    csvContentE += rowLabel + "\n";

    entities.forEach(function (element) {
      var row = "";
      for (label of keys) {
        try {
          // treats the case where the key holds a complex object
          if (typeof element[label] === "object") {
            row += '"' + JSON.stringify(element[label], null, 2) + '";';
          } else {
            row += element[label] + ";";
          }
        } catch (notLabel) {
          row += ";";
        }
      }
      row = row.slice(0, -1);
      csvContentE += row + "\n";
    });
    downloadFile(csvContentE, "entities.csv");
  } catch (err) {
    alert("Error during the CSV transformation:");
    console.log(err);
    return -1;
  }
}

function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */

function updateThumbnail(dropZoneElement, file) {
  thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }
  thumbnailElement.dataset.label = file.name;
}

function resetThummbnail(dropZoneElementId, filesID){
  //Clear fileNameGUI element
  document.getElementById(filesID).value = null;
  var dropZoneElement = document.getElementById(dropZoneElementId);
  var thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  thumbnailElement.classList.remove("drop-zone__thumb")
  thumbnailElement.innerHTML = "<span class='drop-zone__prompt'>Drop file here or click to upload</span>";  
  thumbnailElement.dataset.label = "";
}

for (var i = 0; i < radios.length; i++) {
  radios[i].onchange = function () {

  $("#formModification").toggleClass("display-none display-inline"); 
  $("#formComparison").toggleClass("display-none display-inline"); 
  $(".setClass").toggleClass("display-none display-flex");
  $(".setClass2").toggleClass("display-none display-flex");
  $(".setShowcaseClass").toggleClass("display-none display-inline");


  };
}

function readBlob(){
  let file = null;
  let filetype = "";
  let filename = "";
  let blob = new Blob([]);
  let fileUrl = "";

  //Extract all files from the fileNameGUI element
  var files = document.getElementById("fileNameGUIModif").files;

  //Get url from input i.e the absolute path of the file given by user
  fileUrl = document.getElementById("url").value;



  //Get zoom value
  let zoomElem = document.getElementById("zoom");
  let zoomElemValue = zoomElem.value;

  //If there is no file nor URL
  if (!files.length && !fileUrl.length) {
    alert("Please select a file or an URL !");
    return;
  }

  if (files.length && fileUrl.length) {
    alert("Please select a single file or an URL !");
    return;
  }

  if (files.length) {
    //Get the first file in the list
    file = files[0];
    blob = file.slice();
    //Get file infos
    filetype = file.type;
    filename = file.name;
  }

  resetThummbnail("Modification_dz1","fileNameGUIModif");

  //Object aimed to read files
  var reader = new FileReader();

  //Once the file is read
  reader.onloadend = function (evt) {
    //Read successfully
    if (evt.target.readyState == FileReader.DONE) {
      // DONE == 2

      //Get the content of the file and convert to b64
      var cont = evt.target.result;
      var base64String = getB64Str(cont);

      let formData = new FormData();

      formData.append("contentType", filetype);
      formData.append("file", base64String);
      formData.append("fileName", filename);
      formData.append("zoom", zoomElemValue);
      formData.append("url", fileUrl);
      formData.append("Modification", "True");
      formData.append("Comparison", "False");


      let xhr = new XMLHttpRequest();
      xhr.onload = function (data) {
        // data is the response from the server, it refers to Timeline
        document.getElementById("loaderImg_ner").style.display = "none";
        treatReturn(data);
      };
      xhr.onerror = function (response) {
        document.getElementById("loaderImg_ner").style.display = "none";
        console.log(response.responseText);
      };

      xhr.open("POST", "/face_extraction");
      xhr.send(formData);
    }
  };

  reader.readAsArrayBuffer(blob);
  

}

function readBlob2(){

  let file = null;
  let filetype = "";
  let filename = "";
  let blob = new Blob([]);
  let fileUrl = "";

  let file2 = null;
  let filetype2 = "";
  let filename2 = "";
  let blob2 = new Blob([]);
  let fileUrl2 = "";

  let base64String2 = "";

  //Extract all files from the fileNameGUI element
  var files = document.getElementById("fileNameGUIComp1").files;
  //Get url from input i.e the absolute path of the file given by user
  fileUrl = document.getElementById("urlComp1").value;

  //Extract all files from the fileNameGUI element
  var files2 = document.getElementById("fileNameGUIComp2").files;
  //Get url from input i.e the absolute path of the file given by user
  fileUrl2 = document.getElementById("urlComp2").value;

  let nbFiles = 0;

  if (!files.length){nbFiles = nbFiles + 1}
  if (!files2.length){nbFiles = nbFiles + 1}
  if (!fileUrl.length){nbFiles = nbFiles + 1}
  if (!fileUrl2.length){nbFiles = nbFiles + 1}

  //If there is no file nor URL
  if (nbFiles != 2) {
    alert("Please select 2 images (files or URLs) !");
    return;
  }

  if (files.length) {
    //Get the first file in the list
    file = files[0];
    blob = file.slice();
    //Get file infos
    filetype = file.type;
    filename = file.name;
  }

  if (files2.length) {
    //Get the first file in the list
    file2 = files2[0];
    blob2 = file2.slice();
    //Get file infos
    filetype2 = file2.type;
    filename2 = file2.name;
  }


  resetThummbnail("Comparison_dz1","fileNameGUIComp1");
  resetThummbnail("Comparison_dz2","fileNameGUIComp2");
  
  //Object aimed to read files
  var reader = new FileReader();
  var reader2 = new FileReader();

  let formData = new FormData();

  reader2.onload = function (evt) {
    if (evt.target.readyState == FileReader.DONE){
      var cont2 = evt.target.result;
      base64String2 = getB64Str(cont2);
    }
  }

  //Once the file is read
  reader.onloadend = function (evt) {
    //Read successfully
    if (evt.target.readyState == FileReader.DONE) {
      // DONE == 2

      //Get the content of the file and convert to b64
      var cont = evt.target.result;
      var base64String = getB64Str(cont);

      formData.append("contentType", filetype);
      formData.append("file", base64String);
      formData.append("fileName", filename);
      formData.append("url", fileUrl);
      formData.append("url2", fileUrl2)
      formData.append("contentType2", filetype2);
      formData.append("file2", base64String2);
      formData.append("fileName2", filename2);
      formData.append("Comparison", "True")
      formData.append("Modification", "False")

      let xhr = new XMLHttpRequest();
      xhr.onload = function (data) {
        // data is the response from the server, it refers to Timeline
        document.getElementById("loaderImg_ner").style.display = "none";
        treatReturn2(data);
      };
      xhr.onerror = function (response) {
        document.getElementById("loaderImg_ner").style.display = "none";
        console.log(response.responseText);
      };

      xhr.open("POST", "/face_extraction");
      xhr.send(formData);
    }
  };
  reader2.readAsArrayBuffer(blob2);
  reader.readAsArrayBuffer(blob);
}

for (var i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function () {
    $("#loaderImg_ner").show();
    var button = this.id;

    if (button == "button_deepface" && document.querySelector("#radio1").checked) {

      readBlob();
    }

    if (button == "button_deepface2" && document.querySelector("#radio2").checked){

      readBlob2();
    }
  };
}

window.addEventListener("DOMContentLoaded", function(){
  if (document.querySelector("#radio1").checked){

    $("#formModification").removeClass("display-none display-inline")
    $("#formModification").addClass("display-inline")

    $("#formComparison").removeClass("display-none display-inline")
    $("#formComparison").addClass("display-none")

  }

  if (document.getElementById("radio2").checked){  
    $("#formModification").removeClass("display-none display-inline")
    $("#formModification").addClass("display-none")

    $("#formComparison").removeClass("display-none display-inline")
    $("#formComparison").addClass("display-inline")
  }


});


function imageModification(img) {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Result elements set up

  //Keep track of the number of images displayed
  let numberImgs = displayField.children.length;

  //Containing all our elements along with the image
  let set = document.createElement("div");

  let btnDelete = document.createElement("button");
  btnDelete.id = "btnDelete" + numberImgs;
  btnDelete.className = "btnDeleteClass";

  btnDelete.onclick = function () {
    this.parentElement.remove();
  }
  btnDelete.innerHTML = "???";
  btnDelete.style.top ="-46%";
  btnDelete.style.left ="98%";
  set.appendChild(btnDelete);

  //Containing the image
  let right = document.createElement("div")
  //Containing 
  let left = document.createElement("div")
  
  right.className = "right-div"
  left.className = "left-div"
  
  set.appendChild(left)
  set.appendChild(right)

  set.className = "setClass";
  set.classList.add("display-flex");
///////////////////////////////////////////////////////////////////////////////////////////////////////
  //Canvas setting up
  let canvas = document.createElement("canvas");
  canvas.className = "canvasClass";
  canvas.id = "canvasId" + numberImgs;
  canvas.removeAttribute("data-caman-id")

  //Context and image setting up
  let ctx = canvas.getContext("2d");
  var image_ = new Image();
  image_.crossOrigin = "";
  image_.src = "data:image/jpg;base64, " + img;
  image_.id = "image_canvas" + numberImgs;
  image_.setAttribute("data-zoom-src",image_.src)



  //Drawing of the canvas content
  image_.onload = function () {
    canvas.width = image_.width;
    canvas.height = image_.height;
    ctx.drawImage(image_, 0, 0, image_.width, image_.height);
  };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Contrast slider set up
  let rangeContr = document.createElement("input");
  rangeContr.id = "contrastR" + numberImgs;
  rangeContr.type = "range";
  rangeContr.min = "-100";
  rangeContr.max = "100";
  rangeContr.defaultValue = 0;
  let labelContr = document.createElement("label");
  labelContr.for = "contrastR" + numberImgs;
  labelContr.innerText = "Contrast ";
  let valContrDisplay = document.createElement("span");
  valContrDisplay.id = "valContrDisplay"+numberImgs;
  valContrDisplay.innerText = rangeContr.value

  left.appendChild(labelContr);
  left.appendChild(valContrDisplay);
  left.appendChild(rangeContr);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // //Button version of the contrast slider
  // let btnContrPlus = document.createElement("button")
  // let btnContrMoins = document.createElement("button")
  // btnContrPlus.id = "btnContrPlus" + numberImgs;
  // btnContrMoins.id = "btnContrMoins" + numberImgs;
  // btnContrPlus.innerText =" Contrast + "
  // btnContrMoins.innerText = " Contrast - "

  // btnContrMoins.onclick = function(){
  //   Caman("#canvasId" + numberImgs, image_, function() {
  //     this.contrast(5).render();
  //   });
  // }
  
  // btnContrPlus.onclick = function(){
  //   Caman("#canvasId" + numberImgs, image_, function() {
  //     this.contrast(-5).render();
  //   });
  // }

  // left.appendChild(btnContrMoins)
  // left.appendChild(btnContrPlus)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Brightness slider set up
  let rangeBright = document.createElement("input");
  rangeBright.id = "brightR" + numberImgs;
  rangeBright.type = "range";
  rangeBright.min = "-100";
  rangeBright.max = "100";
  rangeBright.defaultValue = 0;
  let labelBright = document.createElement("label");
  labelBright.for = "brightR" + numberImgs;
  labelBright.innerText = "Brightness ";
  let valBrightDisplay = document.createElement("span");
  valBrightDisplay.id = "valBrightDisplay"+numberImgs;
  valBrightDisplay.innerText = rangeBright.value

  left.appendChild(labelBright);
  left.appendChild(valBrightDisplay);
  left.appendChild(rangeBright);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Exposure slider set up
  let rangeExpo = document.createElement("input");
  rangeExpo.id = "expoR" + numberImgs;
  rangeExpo.type = "range";
  rangeExpo.min = "-100";
  rangeExpo.max = "100";
  rangeExpo.defaultValue = 0;
  let labelExpo = document.createElement("label");
  labelExpo.for = "expoR" + numberImgs;
  labelExpo.innerText = "Exposure ";
  let valExpoDisplay = document.createElement("span");
  valExpoDisplay.id = "valBrightDisplay"+numberImgs;
  valExpoDisplay.innerText = rangeExpo.value

  left.appendChild(labelExpo);
  left.appendChild(valExpoDisplay);
  left.appendChild(rangeExpo);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Sharpen slider set up
  let rangeSharp = document.createElement("input");
  rangeSharp.id = "sharpR" + numberImgs;
  rangeSharp.type = "range";
  rangeSharp.min = "0";
  rangeSharp.max = "200";
  rangeSharp.defaultValue = 0;
  let labelSharp = document.createElement("label");
  labelSharp.for = "sharpR" + numberImgs;
  labelSharp.innerText = "Sharpen ";
  let valSharpDisplay = document.createElement("span");
  valSharpDisplay.id = "valSharpDisplay"+numberImgs;
  valSharpDisplay.innerText = rangeSharp.value

  left.appendChild(labelSharp);
  left.appendChild(valSharpDisplay);
  left.appendChild(rangeSharp);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Saturation slider set up
  let rangeSat = document.createElement("input");
  rangeSat.id = "satR" + numberImgs;
  rangeSat.type = "range";
  rangeSat.min = "0";
  rangeSat.max = "200";
  rangeSat.defaultValue = 0;
  let labelSat = document.createElement("label");
  labelSat.for = "satR" + numberImgs;
  labelSat.innerText = "Saturation ";
  let valSatDisplay = document.createElement("span");
  valSatDisplay.id = "valSatDisplay"+numberImgs;
  valSatDisplay.innerText = rangeSat.value

  left.appendChild(labelSat);
  left.appendChild(valSatDisplay);
  left.appendChild(rangeSat);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save button set up

  let saveBtn = document.createElement("button");
  saveBtn.id = "saveImg"+numberImgs;
  saveBtn.innerText = "Save as file"
  saveBtn.className="btnUi";
  left.appendChild(saveBtn)
  
  function save(){
    Caman("#canvasId" + numberImgs, image_, function () {
        this.render(function() {
          this.save("jpeg");
        });
    });
  }
  saveBtn.addEventListener("click", save)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reset modification button set up

let resetBtn = document.createElement("button")
resetBtn.id = "reset"+numberImgs;
resetBtn.innerText = "Reset modifications"
resetBtn.className="btnUi";
left.appendChild(resetBtn)

function reset(){
  $("#contrastR" + numberImgs).val(0)
  $("#brightR" + numberImgs).val(0)
  $("#expoR" + numberImgs).val(0)
  $("#sharpR" + numberImgs).val(0)
  $("#satR" + numberImgs).val(0)

  Caman("#canvasId" + numberImgs, image_, function () {
    this.revert(false);
    this.render();
    });
  };

  resetBtn.addEventListener("click", reset);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Undo-Redo div set up

let unDoreDoDiv = document.createElement("div");
unDoreDoDiv.id = "unDoreDoDiv"+numberImgs;
unDoreDoDiv.className = "unDoreDoDiv";
unDoreDoDiv.style.display = "flex"
left.appendChild(unDoreDoDiv);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Undo button set up


let undoBtn = document.createElement("button");
undoBtn.id = "undo"+numberImgs;
undoBtn.innerText = "Undo"
undoBtn.className="btnUi";
undoBtn.style.flex = "1"
unDoreDoDiv.appendChild(undoBtn)

right.images = [];
let currentUndoPosition = -1;

function undo(){
  if(currentUndoPosition > 0){
    currentUndoPosition--;
    console.log(right.images,currentUndoPosition)
    // CHANGER IMAGE + CURSEURS
  }
}

  undoBtn.addEventListener("click", undo);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Redo button set up

  let redoBtn = document.createElement("button");
  redoBtn.id = "redo"+numberImgs;
  redoBtn.innerText = "Redo"
  redoBtn.className="btnUi";
  redoBtn.style.flex = "1"
  unDoreDoDiv.appendChild(redoBtn)

  function redo(){
    if (currentUndoPosition < right.images.length - 1 ){
      currentUndoPosition++;
      
      console.log(right.images,currentUndoPosition)

      canvas.width = image_.width;
      canvas.height = image_.height;
      image_.src = right.images[currentUndoPosition][0];
      ctx.drawImage(image_, 0, 0, image_.width, image_.height);


    }
    else{
      console.log(currentUndoPosition, right.images.length, "not possible")
    }
  }

  redoBtn.addEventListener("click", redo);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Filter function called on every range input  
function filter() {

    var contrastValue = parseInt($("#contrastR" + numberImgs).val());
    var brightValue = parseInt($("#brightR" + numberImgs).val());
    var expoValue = parseInt($("#expoR" + numberImgs).val());
    var sharpValue = parseInt($("#sharpR" + numberImgs).val());
    var satValue = parseInt($("#satR"+ numberImgs).val());
    valBrightDisplay.innerHTML = document.getElementById("brightR" + numberImgs).value+" ";
    valExpoDisplay.innerHTML = document.getElementById("expoR" + numberImgs).value+" ";
    valSharpDisplay.innerHTML = document.getElementById("sharpR" + numberImgs).value+" ";
    valContrDisplay.innerHTML = document.getElementById("contrastR" + numberImgs).value+" ";
    valSatDisplay.innerHTML = document.getElementById("satR" + numberImgs).value+" ";

    Caman("#canvasId" + numberImgs, image_, function () {
      this.revert(false);
      this.brightness(brightValue).saturation(satValue).exposure(expoValue).sharpen(sharpValue).contrast(contrastValue).render();
    });


    if (currentUndoPosition == right.images.length){
      if (right.images.length < 5)
      {    
        right.images.push([canvas.toDataURL(),contrastValue,brightValue,expoValue,sharpValue,satValue]);
        if (currentUndoPosition < 4) currentUndoPosition += 1;
      }
      else
      {
        right.images.shift();
        right.images.push([canvas.toDataURL(),contrastValue,brightValue,expoValue,sharpValue,satValue]);
      }
    }
    else{
      console.log("oui")
      right.images.splice(currentUndoPosition)
      if (right.images.length < 5)
      {    
        right.images.push([canvas.toDataURL(),contrastValue,brightValue,expoValue,sharpValue,satValue]);
        if (currentUndoPosition < 4) currentUndoPosition += 1;
      }
      else
      {
        right.images.shift();
        right.images.push([canvas.toDataURL(),contrastValue,brightValue,expoValue,sharpValue,satValue]);
      }
    }

    console.log(right.images,currentUndoPosition);

}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

right.appendChild(canvas);

displayField.append(set)
// displayField.insertBefore(set,displayField.firstChild);


var panzoom = Panzoom(canvas,{});
right.addEventListener('wheel', panzoom.zoomWithWheel)

document.querySelectorAll('input[type="range"]')[numberImgs*5].onchange = filter
document.querySelectorAll('input[type="range"]')[numberImgs*5+1].onchange = filter
document.querySelectorAll('input[type="range"]')[numberImgs*5+2].onchange = filter
document.querySelectorAll('input[type="range"]')[numberImgs*5+3].onchange = filter
document.querySelectorAll('input[type="range"]')[numberImgs*5+4].onchange = filter

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

function imageComparison(img1, img2){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Result elements set up

  if(document.getElementById("setId2") != null){
    document.getElementById("setId2").remove();
  }

  //Containing both images

  let set = document.createElement("div");
  set.className = "setClass2";
  set.id = "setId2";
  set.classList.add("display-flex");

  let h1 = document.createElement("h1");
  h1.innerText = "Face Comparison";
  h1.className = "h1ComparisonClass";

  const delBtn = document.createElement("button");
  h1.appendChild(delBtn);
  delBtn.style.position = "relative";
  delBtn.style.top = "-51%";
  delBtn.style.left = "41.6%";
  delBtn.innerText="???"

  delBtn.addEventListener("click", function(){
    document.getElementById("setId2").remove();
  });

  set.insertBefore(h1, set.firstChild);

  var h = window.outerHeight;
  var w = window.outerWidth;

  var table=document.createElement("table");
  table.id = "tableId";
  table.className = "tableComp ";
  table.style.width="100%"
  row=table.insertRow(0)

  cel=row.insertCell(0)
  cel.style.maxWidth="45%"
  cel.style.maxHeight="45%"
  cel.style.width="45%"
  cel.style.height="45%"
  let myresult1 = document.createElement("div");
  myresult1.id = "myresult1";
  myresult1.className = "img-zoom-result-class";
  cel.appendChild(myresult1)

  cel=row.insertCell(1)
  cel.style.maxWidth="45%"
  cel.style.maxHeight="45%"
  cel.style.width="45%"
  cel.style.height="45%"
 let myresult2 = document.createElement("div");
  myresult2.id = "myresult2";
  myresult2.className = "img-zoom-result-class";
  cel.appendChild(myresult2)

  

  row=table.insertRow(1)

  cel=row.insertCell(0)
  cel.style.maxWidth=((w/2)-15)+"px"
  cel.style.maxHeight=((h/2)-15)+"px"
  cel.style.width=((w/2)-15)+"px"
  cel.style.height=((h/2)-15)+"px"
  let myresultdiv1 = document.createElement("div");
  myresultdiv1.className = "img-container"
  let myimage1 = document.createElement("img");
  myimage1.id = "myimage1";
  myimage1.src = "data:image/jpg;base64, " + img1;
  myimage1.className = "myimage1Class";
  cel.appendChild(myresultdiv1);
  myresultdiv1.appendChild(myimage1)

  cel2=row.insertCell(1)
  cel2.style.maxWidth=((w/2)-15)+"px"
  cel2.style.maxHeight=((h/2)-15)+"px"
  cel2.style.width=((w/2)-15)+"px"
  cel2.style.height=((h/2)-15)+"px"
  let myresultdiv2 = document.createElement("div");
  myresultdiv2.className = "img-container"
  let myimage2 = document.createElement("img");
  myimage2.id = "myimage2";
  myimage2.src = "data:image/jpg;base64, " + img2;
  myimage2.className = "myimage2Class";
  cel2.appendChild(myresultdiv2);
  myresultdiv2.appendChild(myimage2);

  set.appendChild(table)

  displayField.appendChild(set)

  $(document).ready(function(){
    createUi("myimage1","myresult1", "myimage2", "myresult2", "setId2")
  });
}

function imageComparisonCanvas(img1, img2){

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Result elements set up
  
    if(document.getElementById("setId2") != null){
      document.getElementById("setId2").remove();
    }
  
    //Containing both images
  
    let set = document.createElement("div");
    set.className = "setClass2";
    set.id = "setId2";
    set.classList.add("display-flex");
  
    let h1 = document.createElement("h1");
    h1.innerText = "Face Comparison";
    h1.className = "h1ComparisonClass";
  
    const delBtn = document.createElement("button");
    h1.appendChild(delBtn);
    delBtn.style.position = "relative";
    delBtn.style.top = "-51%";
    delBtn.style.left = "41.6%";
    delBtn.innerText="???"
  
    delBtn.addEventListener("click", function(){
      document.getElementById("setId2").remove();
    });
  
    set.insertBefore(h1, set.firstChild);
  
    var h = window.outerHeight;
    var w = window.outerWidth;
  
    var table=document.createElement("table");
    table.id = "tableId";
    table.className = "tableComp ";
    table.style.width="100%"
    row=table.insertRow(0)
  
    cel=row.insertCell(0)
    cel.style.maxWidth="45%"
    cel.style.maxHeight="45%"
    cel.style.width="45%"
    cel.style.height="45%"
    let myresult1 = document.createElement("div");
    myresult1.id = "myresult1";
    myresult1.className = "img-zoom-result-class";
    let mycanvas1 = document.createElement("canvas");
    mycanvas1.id = "mycanvas1";
    myresult1.appendChild(mycanvas1);
    cel.appendChild(myresult1)
  
    cel=row.insertCell(1)
    cel.style.maxWidth="45%"
    cel.style.maxHeight="45%"
    cel.style.width="45%"
    cel.style.height="45%"
    let myresult2 = document.createElement("div");
    myresult2.id = "myresult2";
    myresult2.className = "img-zoom-result-class";
    let mycanvas2 = document.createElement("canvas");
    mycanvas2.id = "mycanvas2";
    myresult2.appendChild(mycanvas2);
    cel.appendChild(myresult2)
  
    
  
    row=table.insertRow(1)
  
    cel=row.insertCell(0)
    cel.style.maxWidth=((w/2)-15)+"px"
    cel.style.maxHeight=((h/2)-15)+"px"
    cel.style.width=((w/2)-15)+"px"
    cel.style.height=((h/2)-15)+"px"
    let myresultdiv1 = document.createElement("div");
    myresultdiv1.className = "img-container"
    let myimage1 = document.createElement("img");
    myimage1.id = "myimage1";
    myimage1.src = "data:image/jpg;base64, " + img1;
    myimage1.className = "myimage1Class";
    cel.appendChild(myresultdiv1);
    myresultdiv1.appendChild(myimage1)
  
    cel2=row.insertCell(1)
    cel2.style.maxWidth=((w/2)-15)+"px"
    cel2.style.maxHeight=((h/2)-15)+"px"
    cel2.style.width=((w/2)-15)+"px"
    cel2.style.height=((h/2)-15)+"px"
    let myresultdiv2 = document.createElement("div");
    myresultdiv2.className = "img-container"
    let myimage2 = document.createElement("img");
    myimage2.id = "myimage2";
    myimage2.src = "data:image/jpg;base64, " + img2;
    myimage2.className = "myimage2Class";
    cel2.appendChild(myresultdiv2);
    myresultdiv2.appendChild(myimage2);
  
    set.appendChild(table)
  
    displayField.appendChild(set)
  
    $(document).ready(function(){
      createUiCanvSwitch("myimage1","myresult1","mycanvas1","myimage2", "myresult2","mycanvas2" ,"setId2")
    });
  }

function treatReturn(response) {
  repStr = response.target.response;
  imgs = JSON.parse(repStr).frameResponse64;
  var chooseAmongImgs = document.getElementById("chooseId").checked;

  if (chooseAmongImgs){
    if (imgs.length != 1) {
        
    const displayField2 = document.getElementById("responseDisplay");
    let set = document.createElement("div");
    set.className = "setShowcaseClass";
    set.classList.add("display-inline");

    const header = document.createElement("h1");
    header.innerHTML = "Choose face"
    header.style.textAlign = "center"
    set.appendChild(header);
    displayField2.appendChild(set);

  
      for (element of imgs) {
        let img = document.createElement("img");
        img.src = "data:image/jpg;base64, " + element;
        img.element = element;
        img.style.margin = "5px"

        let divImg = document.createElement("div");
        divImg.style.textAlign = "center";
        divImg.appendChild(img);
        set.appendChild(divImg);

        img.addEventListener("click", function (e) {
          displayField2.removeChild(set);
          imageModification(e.target.element);
        });
      }
    }
    else {
    imageModification(imgs[0]);
    }
  }
  else {
    for (element of imgs) {
      imageModification(element);
    }
  }

}

function treatReturn2(response){
  /*
  Treat the response of the server.
  The server sends us all the faces detected in both images with thier respective features in a JSON object.
  We then display the faces in the images and let the user chose the ones used.
  */

  imgStr = response.target.response;

  allFacesDetected1 = JSON.parse(imgStr).features1
  allFacesDetected2 = JSON.parse(imgStr).features2

  var chosen1 = null
  var chosen2 = null

  // Check if there only one face detected in the images
  if (allFacesDetected1.length == 1 & allFacesDetected2.length == 1){
    imageComparisonCanvas(allFacesDetected1[0][0], allFacesDetected2[0][0])
  }


  // Check if there were more than one face detected in the images
  if (allFacesDetected1.length != 1){
    
    const displayField2 = document.getElementById("responseDisplay");
    let set = document.createElement("div");
    set.className = "setShowcaseClass";
    set.classList.add("display-inline");

    const header = document.createElement("h1");
    header.innerHTML = "Choose face"
    header.style.textAlign = "center"
    set.appendChild(header);
    displayField2.appendChild(set);


    for (element of allFacesDetected1) {
      let img = document.createElement("img");
      img.src = "data:image/jpg;base64, " + element[0];
      img.element = element;
      img.style.margin = "5px"
  
      let divImg = document.createElement("div");
      divImg.style.textAlign = "center";
      divImg.appendChild(img);
      set.appendChild(divImg);


      img.addEventListener("click", function (e) {
        displayField2.removeChild(set);
        chosen1 = e.target.element[0];
        if (chosen2 != null){
          imageComparisonCanvas(chosen1, chosen2)
        }
      });
    }
  }
  else {
    chosen1 = allFacesDetected1[0][0];
  } 

  // Same for the second image
  if (allFacesDetected2.length != 1){
      
      const displayField2 = document.getElementById("responseDisplay");
      let set2 = document.createElement("div");
      set2.className = "setShowcaseClass";
      set2.classList.add("display-inline");

      const header2 = document.createElement("h1");
      header2.innerHTML = "Choose face"
      header2.style.textAlign = "center"
      set2.appendChild(header2);
      displayField2.appendChild(set2);
      
      for (element of allFacesDetected2) {
        let img = document.createElement("img");
        img.src = "data:image/jpg;base64, " + element[0];
        img.element = element;
        img.style.margin = "5px"
        let divImg2 = document.createElement("div");
        divImg2.style.textAlign = "center";
        divImg2.appendChild(img);
        set2.appendChild(divImg2);
    
        img.addEventListener("click", function (e) {
          displayField2.removeChild(set2);
          chosen2 = e.target.element[0];
          if (chosen1 != null){
            imageComparisonCanvas(chosen1, chosen2)
          }
        });
      }
    }
  else {
    chosen2 = allFacesDetected2[0][0];
  }

}


