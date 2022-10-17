var numberFeature = 1;
var chosenCanvas = -1;
var chosenNumber = "-1";
var canvas = null;
var canvas2 = null;

/**
 * Checks for drop event and checks if it's on the first canvas or the second
 */
function setUpDropOnFaceCanvas() {

  document.ondragover = function (event) {
    event.preventDefault();
    if (event.target.id == 'mycanvas1') {
      chosenCanvas = 1;
    }
    else if (event.target.id == 'mycanvas2') {
      chosenCanvas = 2;
    }
    else {
      chosenCanvas = -1;
    }
  }
}

/**
 * Clone a canvas
 * @param {<canvas>} Canvas to be clones
 * @return {<canvas>} Clone of canvas 
*/
function cloneCanvas(oldCanvas) {


  //create a new canvas
  var newCanvas = document.createElement('canvas');
  var context = newCanvas.getContext('2d');

  //set dimensions
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  //apply the old canvas to the new one
  context.drawImage(oldCanvas, 0, 0);

  //return the new canvas
  return newCanvas;
}

/**
 * Add a feature to the feature table 
 * @param {<table> Element} table Table element to add the feature 
 * @param {String} feature Name of the feature to be added 
 */
function addLineInTable(table, feature) {

  // Add a new row
  var tr = document.createElement("tr");
  // Save the number of the feature
  tr.number = numberFeature

  var tdNumber = document.createElement("td");
  var divNumber = document.createElement("div");
  divNumber.innerHTML = numberFeature;
  divNumber.className = "numberClass";
  divNumber.draggable = true;
  tdNumber.appendChild(divNumber)
  tr.appendChild(tdNumber);

  //Feature name
  var tdFeature = document.createElement("td");
  tdFeature.innerHTML = feature;
  tdFeature.className = "featureClass";
  tr.appendChild(tdFeature);

  // Presence of similarity
  var tdPresence = document.createElement("td");
  tdPresence.innerHTML = '<input type="checkbox" id ="' + feature + 'PresenceId" class = "tickClass" >';
  tdPresence.className = "presenceClass";
  tr.appendChild(tdPresence);

  // Absence of similarity
  var tdAbsence = document.createElement("td");
  tdAbsence.innerHTML = '<input type="checkbox" id ="' + feature + 'AbsenceId" class = "tickClass" >';
  tdAbsence.className = "absenceClass";
  tr.appendChild(tdAbsence);

  // Commentairy
  var tdComment = document.createElement("td");
  tdComment.innerHTML = '<textarea id="' + feature + 'CommentId" rows="2" cols="20"></textarea>'
  tdComment.className = "commentClass";
  tr.appendChild(tdComment);

  // Screenshot
  var tdScreen = document.createElement("td");
  const screenBtn = document.createElement("button");
  screenBtn.innerText = "📷"
  screenBtn.className = "screenBtnClass";
  screenBtn.id = feature + "ScreenId"
  screenBtn.onclick = function () {

    // Button looks like it's clicked
    screenBtn.className = "screenBtnClassClicked"

    // Hidden canvas copy where only the minuties corresponding to the right number are displayed
    var copyCanvas1 = document.createElement("canvas");
    copyCtx1 = copyCanvas1.getContext("2d")
    var copyImage1 = new Image();
    copyImage1.src = document.getElementById("myimage1").src
    copyImage1.onload = function () {
      copyImage1.src = document.getElementById("myimage1").src
    }
    // Draw only the right minuties
    drawResult(
      1,
      copyImage1,
      document.getElementById("myimage1"),
      document.getElementById("myresult1"),
      copyCanvas1,
      copyCtx1,
      document.getElementById("mylens"),
      cameraOffset,
      cameraZoom,
      baseSize,
      drawgrid,
      minutiesDraw = minuties,
      textsDraw = texts,
      arrowsDraw = arrows,
      minutieToShow = String(tr.number)
    )

    var copyCanvas2 = document.createElement("canvas");
    copyCtx2 = copyCanvas2.getContext("2d")
    var copyImage2 = new Image();
    copyImage2.src = document.getElementById("myimage2").src
    copyImage2.onload = function () {
      copyImage2.src = document.getElementById("myimage2").src
    }
    drawResult(
      2,
      copyImage2,
      document.getElementById("myimage2"),
      document.getElementById("myresult2"),
      copyCanvas2,
      copyCtx2,
      document.getElementById("mylens2"),
      cameraOffset2,
      cameraZoom2,
      baseSize2,
      drawgrid2,
      minutiesDraw = minuties2,
      textsDraw = texts2,
      arrowsDraw = arrows2,
      minutieToShow = String(tr.number)
    )

    screenBtn.imgleft = copyCanvas1.toDataURL()
    screenBtn.imgright = copyCanvas2.toDataURL()


    // Show the screensots when the mouse is on the button
    var imgHover = document.createElement("img")
    imgHover.className = "hoverImg"
    imgHover.src = screenBtn.imgleft
    var imgHover2 = document.createElement("img")
    imgHover2.className = "hoverImg"
    imgHover2.src = screenBtn.imgright
    imgHover.style.visibility = "hidden"
    imgHover.style.position = "absolute"
    imgHover.style.left = "400px"
    imgHover2.style.visibility = "hidden"
    imgHover2.style.position = "absolute"
    imgHover2.style.left = "850px"


    // If it's the first time clicking on the button, add the two images
    if (screenBtn.childElementCount == 0) {
      screenBtn.appendChild(imgHover2)
      screenBtn.appendChild(imgHover)
    }
    // If it's not, replace the previous images with new ones
    else {
      screenBtn.replaceChildren(imgHover, imgHover2)
      screenBtn.innerHTML = "📷"
    }


    //Show or hide images
    screenBtn.onmousemove = function () {
      imgHover.style.visibility = "visible"
      imgHover2.style.visibility = "visible"
    }
    screenBtn.onmouseleave = function () {
      imgHover.style.visibility = "hidden"
      imgHover2.style.visibility = "hidden"
    }

  }


  tdScreen.appendChild(screenBtn)
  tr.appendChild(tdScreen)

  //Add a button to delete the line
  var tdDelete = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "✕";
  deleteButton.className = "delBtnClass";
  deleteButton.classList.add("squareBtnClass");
  deleteButton.onclick = function () {
    tr.remove();
  }
  tdDelete.appendChild(deleteButton);
  tr.appendChild(tdDelete);

  table.appendChild(tr);

  //Text area to add a new feature
  $('textarea').each(function () {
    this.setAttribute('style', 'height:' + 30 + 'px;overflow-y:hidden;');
  }).on('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  numberFeature = numberFeature + 1

  // If the number is dragged on the canvas
  divNumber.ondragend = function (event) {
    event.preventDefault()
    chosenNumber = event.target.firstChild.nodeValue
    addMinutieToCanvas(event.clientX, event.clientY, chosenCanvas, chosenNumber, Number(document.getElementById("scaleId").value))
  }


}

/**
 * Resets the number of features
 */
function resetNumberFeature() { numberFeature = 1 }
