var radios = null;
var buttons = null;
var Deepface = null;
var PyFeat = null;

// global variable saving input file content
var nvn_pool_data;
var Deepface_author1_data;
var PyFeat_author1_data;

var radios = document.getElementsByName("radios");

var buttons = document.getElementsByName("button_type");

var displayField = document.getElementById("responseDisplay");

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

// PyFeat - drag & drop
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

for (var i = 0; i < radios.length; i++) {
  radios[i].onchange = function () {

  $("#formModification").toggleClass("display-none display-inline"); 
  $("#formComparison").toggleClass("display-none display-inline"); 

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

  if (files.length) {
    //Get the first file in the list
    file = files[0];
    blob = file.slice();
    //Get file infos
    filetype = file.type;
    filename = file.name;
  }

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
  console.log(numberImgs)
  //Containing all our elements along with the image
  let set = document.createElement("div");


  //Containing the image
  let right = document.createElement("div")
  //Containing 
  let left = document.createElement("div")
  
  right.className = "right-div"
  left.className = "left-div"
  
  set.appendChild(left)
  set.appendChild(right)

  set.className = "setClass"
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
  //Button try
  let btnContrPlus = document.createElement("button")
  let btnContrMoins = document.createElement("button")
  btnContrPlus.id = "btnContrPlus" + numberImgs;
  btnContrMoins.id = "btnContrMoins" + numberImgs;
  btnContrPlus.innerText =" Contrast + "
  btnContrMoins.innerText = " Contrast - "

  btnContrMoins.onclick = function(){
    Caman("#canvasId" + numberImgs, image_, function() {
      this.contrast(5).render();
    });
  }
  
  btnContrPlus.onclick = function(){
    Caman("#canvasId" + numberImgs, image_, function() {
      this.contrast(-5).render();
    });
  }

  left.appendChild(btnContrMoins)
  left.appendChild(btnContrPlus)

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
// Reset zoom button set up


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
  }




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
}

function treatReturn(response) {
  imgStr = response.target.response;
  img = JSON.parse(imgStr).frameResponse64;

  for (element of img){
    imageModification(element);
  }

}

function treatReturn2(response){
  console.log("yes")
}

