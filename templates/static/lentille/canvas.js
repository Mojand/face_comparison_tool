// lang : dictonary containing translated labels. To add a new language, create a new .json file and change fetched file
var lang = null;

// Read lang.json (default in french) 
fetch("static/lang.json")
    .then((response) => response.json())
    .then(function (json) {
        lang = json;
    });

// Minutie shape selected by the user, actually is the name of the corresponding function to be called in order to draw the right shape
var currentMinutie = "drawMinutiesCircle";
// Color selected by the user, directly is pased to the drawing function
var currentColor = "black";
// Scale of the next minuties to be drawn, 2 means twice bigger
var scale = 1;
// Are we currently drawing an arrow or not
var drawingArrow = false;

// Canvas1 (left) : Coordinates of the top/left corner of the background image of the result canvas. Change when the image is moved
var posX = 0;
var posY = 0;
// Canvas2 (right)
var posX2 = 0;
var posY2 = 0;

// Zoom factor of the result image. High zoom means bigger background image, focused result
var cameraZoom = 0;
var cameraZoom2 = 0;

var cameraOffset = null;
var cameraOffset2 = null;

// Array cointaing all minuties for each canvas
var minuties = [];
var minuties2 = [];
// Array containing all written texts on each canvas
var texts = [];
var texts2 = [];

// Array containing all arrows for each canvas
var arrows = [];
var arrows2 = [];

// Default size for minuties, later is multiplied by a scale factor to make it look bigger or smaller
var baseSize = 1;
var baseSize2 = 1;

// Boolean deciding whether the grid is drawn or not
var drawgrid = false;
var drawgrid2 = false;

/**
* Draws a grid on a canvas
* @param {int} dimension Size of the canvas (assuming it's a square)
* @param {<canvas> context} ctx Context of the canvas we want to draw on
* @param {int} nbLines Number of visible lines to be drawn, 9 lines means 10 squares per dimension
*/
function drawGrid(dimension, ctx, nbLines) {

    var nbCut = nbLines + 1;
    var h = dimension;
    var distanceBetweenLines = h / nbCut;

    for (let i = 0; i < nbCut; i++) {
        ctx.beginPath();
        // Makes the grid dashed
        ctx.setLineDash([5, 5]);
        //Vertical line
        ctx.moveTo(0, i * distanceBetweenLines);
        ctx.lineTo(h, i * distanceBetweenLines);
        //Horizontal line
        ctx.moveTo(i * distanceBetweenLines, 0);
        ctx.lineTo(i * distanceBetweenLines, h);

        ctx.strokeStyle = "#004c88";
        ctx.stroke();

        // Sets the next drawing elements to solid and not dashed
        ctx.setLineDash([]);
    }
}

/**
 * Draws a circle on a canvas with a number
 * @param {<canvas> context} context Context where the circle is drawn
 * @param {float} camZoom Current cameraZoom of the canvas  
 * @param {int} minutieX Coordinate X of the minutie in the image background referencial
 * @param {int} minutieY Coordinate Y of the minutie in the image background referencial
 * @param {int} scale Scale of the circle
 * @param {string} number Number attached to the minutie
 * @param {int} numberX Coordinate X of the number in the image background referencial
 * @param {int} numberY Coordinate Y of the number in the image background referencial
 * @param {float} baseSize Base size of the minutie (around 1/15 of the max(width,height))
 * @param {string} color Color of the circle
 * @param {string} fontColor Color of the number
*/
function drawMinutiesCircle(
    context,
    camZoom,
    minutieX,
    minutieY,
    scale,
    number,
    numberX,
    numberY,
    baseSize,
    color = "#999999",
    fontColor
) {

    context.strokeStyle = color;
    context.beginPath();
    // Radius = baseSize*camZoom*scale => when the results zooms, the minutie also zooms because camZoom is updated @ every function call   
    context.arc(minutieX, minutieY, baseSize * camZoom * scale, 0, 2 * Math.PI);
    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = fontColor;
    context.font = "18px Arial";
    context.fillText(number, numberX, numberY);
}

/**
 * Draws a square on a canvas with a number
 * @param {<canvas> context} context Context where the square is drawn
 * @param {float} camZoom Current cameraZoom of the canvas  
 * @param {int} minutieX Coordinate X of the minutie in the image background referencial
 * @param {int} minutieY Coordinate Y of the minutie in the image background referencial
 * @param {int} scale Scale of the square
 * @param {string} number Number attached to the minutie
 * @param {int} numberX Coordinate X of the number in the image background referencial
 * @param {int} numberY Coordinate Y of the number in the image background referencial
 * @param {float} baseSize Base size of the minutie (around 1/15 of the max(width,height))
 * @param {string} color Color of the square
 * @param {string} fontColor Color of the number
*/
function drawMinutiesSquare(
    context,
    camZoom,
    minutieX,
    minutieY,
    scale,
    number,
    numberX,
    numberY,
    baseSize,
    color = "#999999",
    fontColor
) {


    context.strokeStyle = color;

    // Topleft corner = where the mouse clicks minus half of the square side ( = baseSize * camZoom * scale)
    context.strokeRect(
        minutieX - baseSize * camZoom * scale,
        minutieY - baseSize * camZoom * scale,
        baseSize * camZoom * scale * 2,
        baseSize * camZoom * scale * 2
    );
    context.lineWidth = 2;

    context.fillStyle = fontColor;
    context.font = "18px Arial";
    context.fillText(number, numberX, numberY);
}

/**
 * Draws a triangle on a canvas with a number
 * @param {<canvas> context} context Context where the triangle is drawn
 * @param {float} camZoom Current cameraZoom of the canvas  
 * @param {int} minutieX Coordinate X of the minutie in the image background referencial
 * @param {int} minutieY Coordinate Y of the minutie in the image background referencial
 * @param {int} scale Scale of the triangle
 * @param {string} number Number attached to the minutie
 * @param {int} numberX Coordinate X of the number in the image background referencial
 * @param {int} numberY Coordinate Y of the number in the image background referencial
 * @param {float} baseSize Base size of the minutie (around 1/15 of the max(width,height))
 * @param {string} color Color of the triangle
 * @param {string} fontColor Color of the number
*/
function drawMinutiesTriangle(
    context,
    camZoom,
    minutieX,
    minutieY,
    scale,
    number,
    numberX,
    numberY,
    baseSize,
    color = "#999999",
    fontColor
) {
    context.strokeStyle = color;

    // Calculation of the height of the triangle
    let height = baseSize * camZoom * scale * Math.cos(Math.PI / 6) * 2;

    context.beginPath();
    context.moveTo(minutieX - baseSize * camZoom * scale, minutieY + height / 2);
    context.lineTo(minutieX + baseSize * camZoom * scale, minutieY + height / 2);
    context.lineTo(minutieX, minutieY - height / 2);
    context.closePath();

    context.lineWidth = 2;
    context.stroke();

    context.fillStyle = fontColor;
    context.font = "18px Arial";
    context.fillText(number, numberX, numberY);
}

/** 
 * Draws a draggable image on canvas, with minuties, arrows and text.
 * @param {int} numberCanvas Number of the targeted canvas, either 1 (left) or 2 (right).
 * @param {Image} imageCanvasR Image object to be drawn on the canvas, it's source is the same as imageR source.
 * @param {<img>} imageR Base image displayed on the bottom of the result.
 * @param {<div>} resultR Result of the zomm and pan displayed on top of the base image.
 * @param {<canvas>} canvasR Canvas used to draw on the result div.
 * @param {<canvas> context} contextR Context of the canvas .
 * @param {<div>} lensR Lens element appearing on top of the base image.
 * @param {float} cameraOffsetR Offset add to the position of the image in the background, to center the view and not stick to the top left corner
 * @param {float} cameraZoomR Zoom factor of the result image. High zoom means bigger background image, focused result.
 * @param {float} baseSizeR Base size of the minutie
 * @param {boolean} drawgridR Should the grid be drawn or not
 * @param {Array} minutiesDraw All minuties to be drawn
 * @param {Array} textsDraw All texts to be written
 * @param {Array} arrowsDraw All arrows to be drawn
 * @param {string} minutieToShow Choose the number of minuties to be shown, default ="-1" : all minuties are displayed
 */
function drawResult(
    numberCanvas, 
    imageCanvasR, 
    imageR, 
    resultR, 
    canvasR, 
    contextR, 
    lensR, 
    cameraOffsetR, 
    cameraZoomR, 
    baseSizeR, 
    drawgridR, 
    minutiesDraw = [], 
    textsDraw = [], 
    arrowsDraw = [], 
    minutieToShow = "-1"){

    var posXR = numberCanvas == 1 ? "posX" : "posX2"
    var posYR = numberCanvas == 1 ? "posY" : "posY2"

    // Important for images with transparancy, if height and width are not refreshed : sort of "afterglow" effect happens
    canvasR.height = resultR.offsetHeight;
    canvasR.width = resultR.offsetWidth;

    // Taking the size of the canvas size in account and the camera zoom
    window[posXR] = - cameraOffsetR.x * cameraZoomR + canvasR.width / 2;
    window[posYR] = - cameraOffsetR.y * cameraZoomR + canvasR.height / 2;

    contextR.drawImage(imageCanvasR, window[posXR], window[posYR], imageR.naturalWidth * cameraZoomR, imageR.naturalHeight * cameraZoomR);

    // Change size of the lens on the base image
    lensR.style.width = (canvasR.width * imageR.width) / (imageR.naturalWidth * cameraZoomR) + "px";
    lensR.style.height = (canvasR.height * imageR.height) / (imageR.naturalHeight * cameraZoomR) + "px";

    // Change position of the lens on the base image
    lensR.style.left = -(window[posXR] * imageR.width) / (imageR.naturalWidth * cameraZoomR) + "px";
    lensR.style.top = -(window[posYR] * imageR.height) / (imageR.naturalHeight * cameraZoomR) + "px";

    // Draw grid if needed
    if (drawgridR) {
        drawGrid(canvasR.height, contextR, 9);
    }

    // Draw all minuties stored in the minuties array
    for (var minutie of minutiesDraw) {
        if(minutieToShow == '-1'){

            // call a function thanks to its name as a string using < window["nameOfFunction"] >
            window[minutie[4]](
                contextR,
                cameraZoomR,
                minutie[0] * cameraZoomR + window[posXR],
                minutie[1] * cameraZoomR + window[posYR],
                minutie[3],
                minutie[2],
                minutie[0] * cameraZoomR + window[posXR] - baseSizeR * cameraZoomR * minutie[3],
                minutie[1] * cameraZoomR + window[posYR] - baseSizeR * cameraZoomR * minutie[3],
                baseSizeR,
                (color = minutie[5]),
                numberCanvas == 1 ? "red" : "blue"
            );
        }
        else{
            if(minutie[2] == minutieToShow){
                window[minutie[4]](
                    contextR,
                    cameraZoomR,
                    minutie[0] * cameraZoomR + window[posXR],
                    minutie[1] * cameraZoomR + window[posYR],
                    minutie[3],
                    minutie[2],
                    minutie[0] * cameraZoomR + window[posXR] - baseSizeR * cameraZoomR * minutie[3],
                    minutie[1] * cameraZoomR + window[posYR] - baseSizeR * cameraZoomR * minutie[3],
                    baseSizeR,
                    (color = minutie[5]),
                    numberCanvas  == 1 ? "red" : "blue"
                );
            }
        }
    }

    // Write texts stored in the texts array
    for (var text of textsDraw) {
        contextR.textBaseline = "top";
        contextR.textAlign = "left";
        contextR.font = "bold 12pt Arial";

        // Write text twice : black and white with a lift shift for it to be visible whatever the background
        contextR.fillStyle = '#444444';
        contextR.fillText(text[0], text[1] * cameraZoomR + window[posXR] + 1 , text[2] * cameraZoomR + window[posYR] + 1);
        contextR.fillStyle = 'white';
        contextR.fillText(text[0], text[1] * cameraZoomR + window[posXR], text[2] * cameraZoomR + window[posYR]);

    }

    // Draw all arrows stored in the arrows array
    for (var arrow of arrowsDraw){
        createArrowBody(arrow[0]* cameraZoomR + window[posXR], arrow[1]* cameraZoomR + window[posYR], arrow[2]* cameraZoomR + window[posXR], arrow[3]* cameraZoomR + window[posYR], arrow[4], arrow[5], contextR)
    }
}

/**
 * Function activating panZoom on already displayed images and results canvas
 * @param {string} imgID ID of the image element of the interface (at the bottom)
 * @param {string} resultID ID of the result div element of the interface (at the top)
 * @param {string} canvasID ID of the canvas inside the result div
 * @param {string} imgID2 ID of the second image element of the interface (at the bottom)
 * @param {string} resultID2 ID of the second result div element of the interface (at the top)
 * @param {string} canvasID2 ID of the second canvas inside the result div
 */
function panZoomCanvasSwitch(imgID, resultID, canvasID, imgID2, resultID2, canvasID2) {

    ///////////////////////////////////        RESULT 1          ////////////////////////////////////////

    // Get DOM elements
    var canvas = document.getElementById(canvasID);
    var image = document.getElementById(imgID);
    var ctx = canvas.getContext("2d");
    canvas.context = ctx;
    var result = document.getElementById(resultID);

    //For every function call, all elements added are deleted
    minuties = [];
    texts = [];
    arrows = [];

    // Number of minuties added by doubleclicking on the canvas, not counting those added via the feature table and arrows
    var numberMinutie = 1;
    // Base size of minuties, around 1/40th of the smaller side of the image
    baseSize = Math.max(image.naturalHeight, image.naturalWidth) / 40;

    // Set up image object to be drawn on the canvas
    var imgCanvas = new Image();
    imgCanvas.src = image.src;
    imgCanvas.onload = function () {
        imgCanvas.src = image.src;
    };

    // Ajust canvas size to fit the result div
    canvas.height = result.offsetHeight;
    canvas.width = result.offsetWidth;

    // Base cameraZoom
    cameraZoom = 1;

    // If the base image is smaller than the result size (meaning that the lens would overflow the image div) we initiate a higher zoom from the start
    if (image.naturalWidth < canvas.offsetWidth) {
        cameraZoom = (canvas.offsetWidth * 1.5) / image.naturalWidth;
    }
    // Check also height, update only if 
    if (image.naturalHeight < canvas.offsetHeight) {
        if (cameraZoom < (canvas.offsetHeight * 1.5) / image.naturalHeight) {
            cameraZoom = (canvas.offsetHeight * 1.5) / image.naturalHeight;
        }
    }

    // Zoom limits
    let maxZoom = 30;
    let minZoom = 0.01;

    // Factor for zoom scrolling
    let scrollSensitivity = 0.0005;

    // IsDragging === true if you are clicking on the result div
    let isDragging = false;

    // Position where you started dragging, used to calculate total dragged distance
    let dragStart = { x: 0, y: 0 };
    let lastZoom = cameraZoom;

    // Position of the top left corner of the div result
    cameraOffset = {
        x: image.naturalWidth / 2,
        y: image.naturalHeight / 2,
    };

    // lens set up, applied above the image div on the bottom
    lens = document.createElement("DIV");
    lens.id = "mylens";
    lens.setAttribute("frozen", false);
    // if frozen -> nothing happens
    lens.frozen = false;
    // Check if there is already another lens above the image div, is so, delete the lens
    if (image.previousElementSibling != null) {
        image.previousElementSibling.remove();
    }
    lens.setAttribute("class", "img-zoom-lens");
    
    // Add lens on the div
    image.parentElement.insertBefore(lens, image);

    // Position of the top left corner of the image inside the canvas
    posX = - cameraOffset.x * cameraZoom + canvas.width / 2;
    posY = - cameraOffset.y * cameraZoom + canvas.height / 2;

    ///////////////////////////////////        RESULT 2          ////////////////////////////////////////

    var canvas2 = document.getElementById(canvasID2);
    var image2 = document.getElementById(imgID2);
    var ctx2 = canvas2.getContext("2d");
    canvas2.context = ctx2;
    var result2 = document.getElementById(resultID2);
    minuties2 = [];
    texts2 = [];
    arrows2 = [];
    var numberMinutie2 = 1;
    baseSize2 = Math.max(image2.naturalHeight, image2.naturalWidth) / 40;

    var imgCanvas2 = new Image();
    imgCanvas2.src = image2.src;

    imgCanvas2.onload = function () {
        imgCanvas2.src = image2.src;
    };

    canvas2.height = result2.offsetHeight;
    canvas2.width = result2.offsetWidth;

    cameraZoom2 = 1;

    if (image2.naturalWidth < canvas2.offsetWidth) {
        cameraZoom2 = (canvas2.offsetWidth * 1.5) / image2.naturalWidth;
    }

    if (image2.naturalHeight < canvas2.offsetHeight) {
        if (cameraZoom2 < (canvas2.offsetHeight * 1.5) / image2.naturalHeight) {
            cameraZoom2 = (canvas2.offsetHeight * 1.5) / image2.naturalHeight;
        }
    }

    let maxZoom2 = 30;
    let minZoom2 = 0.01;
    let scrollSensitivity2 = 0.0005;

    let isDragging2 = false;
    let dragStart2 = { x: 0, y: 0 };
    let lastZoom2 = cameraZoom2;
    cameraOffset2 = {
        x: image2.naturalWidth / 2,
        y: image2.naturalHeight / 2,
    };

    lens2 = document.createElement("DIV");
    lens2.id = "mylens2";
    lens2.setAttribute("frozen", false);
    lens2.frozen = false;
    if (image2.previousElementSibling != null) {
        image2.previousElementSibling.remove();
    }
    lens2.setAttribute("class", "img-zoom-lens");
    image2.parentElement.insertBefore(lens2, image2);

    posX2 = -cameraOffset2.x * cameraZoom2 + canvas2.width / 2;
    posY2 = -cameraOffset2.y * cameraZoom2 + canvas2.height / 2;

    ///////////////////////////////////////      SHARED ATTRIBUTES       //////////////////////////////////////////////////////////

    // if areShared is true, both canvas move at the same time
    var areShared = false;

    ///////////////////////////////////////             DRAW            ////////////////////////////////////////////////////////////
    
    // Button to activate the grid or not
    const btnGrid = document.getElementById("gridBtnId");
    btnGrid.addEventListener("click", function () {
        drawgrid = !drawgrid;
        drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
    });

    // Draw from the start

    imgCanvas.onload = drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
    drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")

    ///////////////////////////////////////             DRAW2            ////////////////////////////////////////////////////////////


    const btnGrid2 = document.getElementById("gridBtnId2");
    btnGrid2.addEventListener("click", function () {
        drawgrid2 = !drawgrid2;
        drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

    });


    imgCanvas2.onload = drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")
    drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

    ///////////////////////////////////////           DRAG FUNCTIONS          ////////////////////////////////////////////////////////////

    // Get position of the user cursor
    function getEventLocation(e) {
        return { x: e.clientX, y: e.clientY };
    }

    // Toogle frozen attribute
    function freezeUnfreeze(e) {
        e.target.frozen = !e.target.frozen;
        e.target.setAttribute("frozen", e.target.frozen);
    }

    // Remembers wherer the mousedown event occured
    function onPointerDown(e) {
        isDragging = true;
        dragStart.x = getEventLocation(e).x;
        dragStart.y = getEventLocation(e).y;
    }

    function onPointerDown2(e) {
        isDragging2 = true;
        dragStart2.x = getEventLocation(e).x;
        dragStart2.y = getEventLocation(e).y;
    }


    // Releases the mouse. End of dragging
    function onPointerUp(e) {
        isDragging = false;
    }

    function onPointerUp2(e) {
        isDragging2 = false;
    }

    // Move the result when dragging it
    function onPointerMove(e) {

        // If both results move separatly
        if (!areShared) {
            // Change the position of the image only if you are dragging, not if you are simply passing the move over the canvas
            if (isDragging) {
                // If the result is not frozen
                if (!lens.frozen) {
                    // We add every single call the dragged distance to the result scaled with the cameraZoom
                    cameraOffset.x += -(getEventLocation(e).x - dragStart.x) / cameraZoom;
                    cameraOffset.y += -(getEventLocation(e).y - dragStart.y) / cameraZoom;

                    // Reset the dragging starting point for the next dragging callback
                    dragStart.x = getEventLocation(e).x;
                    dragStart.y = getEventLocation(e).y;

                    // Check for boundaries
                    if (cameraOffset.x * cameraZoom - canvas.width / 2 < 0) {
                        cameraOffset.x = canvas.width / (2 * cameraZoom);
                    }

                    if (cameraOffset.y * cameraZoom - canvas.height / 2 < 0) {
                        cameraOffset.y = canvas.height / (2 * cameraZoom);
                    }

                    // image.naturalWidth * cameraZoom equals to the width of the image inside the canvas 
                    if (cameraOffset.x * cameraZoom + canvas.width / 2 > image.naturalWidth * cameraZoom) {
                        cameraOffset.x = image.naturalWidth - canvas.width / (2 * cameraZoom);
                    }

                    if (cameraOffset.y * cameraZoom + canvas.height / 2 > image.naturalHeight * cameraZoom) {
                        cameraOffset.y = image.naturalHeight - canvas.height / (2 * cameraZoom);
                    }

                    // Draw only in the first result canvas
                    drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
                }
            }
        }

        // If we want both the results to move together
        else {
            if (isDragging) {
                if (!lens.frozen) {
                    cameraOffset.x += -(getEventLocation(e).x - dragStart.x) / cameraZoom;
                    cameraOffset.y += -(getEventLocation(e).y - dragStart.y) / cameraZoom;

                    if (cameraOffset.x * cameraZoom - canvas.width / 2 < 0) {
                        cameraOffset.x = canvas.width / (2 * cameraZoom);
                    }

                    if (cameraOffset.y * cameraZoom - canvas.height / 2 < 0) {
                        cameraOffset.y = canvas.height / (2 * cameraZoom);
                    }

                    if (cameraOffset.x * cameraZoom + canvas.width / 2 > image.naturalWidth * cameraZoom) {
                        cameraOffset.x = image.naturalWidth - canvas.width / (2 * cameraZoom);
                    }

                    if (cameraOffset.y * cameraZoom + canvas.height / 2 > image.naturalHeight * cameraZoom) {
                        cameraOffset.y = image.naturalHeight - canvas.height / (2 * cameraZoom);
                    }

                    drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
                }

                if (!lens2.frozen) {
                    // We add the dragging distance made in the first result div
                    cameraOffset2.x += -(getEventLocation(e).x - dragStart.x) / cameraZoom2;
                    cameraOffset2.y += -(getEventLocation(e).y - dragStart.y) / cameraZoom2;

                    // We reset the starting position after both divs are done
                    dragStart.x = getEventLocation(e).x;
                    dragStart.y = getEventLocation(e).y;

                    if (cameraOffset2.x * cameraZoom2 - canvas2.width / 2 < 0) {
                        cameraOffset2.x = canvas2.width / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.y * cameraZoom2 - canvas2.height / 2 < 0) {
                        cameraOffset2.y = canvas2.height / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.x * cameraZoom2 + canvas2.width / 2 > image2.naturalWidth * cameraZoom2) {
                        cameraOffset2.x = image2.naturalWidth - canvas2.width / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.y * cameraZoom2 + canvas2.height / 2 > image2.naturalHeight * cameraZoom2) {
                        cameraOffset2.y = image2.naturalHeight - canvas2.height / (2 * cameraZoom2);
                    }

                    drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

                } else {
                    // If the other div is frozen, we had to reset the starting position regardless
                    dragStart.x = getEventLocation(e).x;
                    dragStart.y = getEventLocation(e).y;
                }
            }
        }
    }

    function onPointerMove2(e) {
        if (!areShared) {
            if (isDragging2) {
                if (!lens2.frozen) {
                    cameraOffset2.x += -(getEventLocation(e).x - dragStart2.x) / cameraZoom2;
                    cameraOffset2.y += -(getEventLocation(e).y - dragStart2.y) / cameraZoom2;

                    dragStart2.x = getEventLocation(e).x;
                    dragStart2.y = getEventLocation(e).y;

                    if (cameraOffset2.x * cameraZoom2 - canvas2.width / 2 < 0) {
                        cameraOffset2.x = canvas2.width / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.y * cameraZoom2 - canvas2.height / 2 < 0) {
                        cameraOffset2.y = canvas2.height / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.x * cameraZoom2 + canvas2.width / 2 > image2.naturalWidth * cameraZoom2) {
                        cameraOffset2.x = image2.naturalWidth - canvas2.width / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.y * cameraZoom2 + canvas2.height / 2 > image2.naturalHeight * cameraZoom2) {
                        cameraOffset2.y = image2.naturalHeight - canvas2.height / (2 * cameraZoom2);
                    }

                    // ;
                    drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

                }
            }
        } else {
            if (isDragging2) {
                if (!lens2.frozen) {
                    cameraOffset2.x += -(getEventLocation(e).x - dragStart2.x) / cameraZoom2;
                    cameraOffset2.y += -(getEventLocation(e).y - dragStart2.y) / cameraZoom2;

                    if (cameraOffset2.x * cameraZoom2 - canvas2.width / 2 < 0) {
                        cameraOffset2.x = canvas2.width / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.y * cameraZoom2 - canvas2.height / 2 < 0) {
                        cameraOffset2.y = canvas2.height / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.x * cameraZoom2 + canvas2.width / 2 > image2.naturalWidth * cameraZoom2) {
                        cameraOffset2.x = image2.naturalWidth - canvas2.width / (2 * cameraZoom2);
                    }

                    if (cameraOffset2.y * cameraZoom2 + canvas2.height / 2 > image2.naturalHeight * cameraZoom2) {
                        cameraOffset2.y = image2.naturalHeight - canvas2.height / (2 * cameraZoom2);
                    }

                    // ;
                    drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

                }

                // If the result is not frozen
                if (!lens.frozen) {
                    // We add every single call the dragged distance to the result scaled with the cameraZoom
                    cameraOffset.x += -(getEventLocation(e).x - dragStart2.x) / cameraZoom;
                    cameraOffset.y += -(getEventLocation(e).y - dragStart2.y) / cameraZoom;

                    // Reset the dragging starting point for the next dragging callback

                    dragStart2.x = getEventLocation(e).x;
                    dragStart2.y = getEventLocation(e).y;

                    // Check for boundaries
                    if (cameraOffset.x * cameraZoom - canvas.width / 2 < 0) {
                        cameraOffset.x = canvas.width / (2 * cameraZoom);
                    }

                    if (cameraOffset.y * cameraZoom - canvas.height / 2 < 0) {
                        cameraOffset.y = canvas.height / (2 * cameraZoom);
                    }

                    if (cameraOffset.x * cameraZoom + canvas.width / 2 > image.naturalWidth * cameraZoom) {
                        cameraOffset.x = image.naturalWidth - canvas.width / (2 * cameraZoom);
                    }

                    if (cameraOffset.y * cameraZoom + canvas.height / 2 > image.naturalHeight * cameraZoom) {
                        cameraOffset.y = image.naturalHeight - canvas.height / (2 * cameraZoom);
                    }

                    // Draw only in the first result canvas
                    // ;
                    drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
                } else {
                    dragStart2.x = getEventLocation(e).x;
                    dragStart2.y = getEventLocation(e).y;
                }
            }
        }
    }

    // Change the zoom of the result using the scroll button
    function adjustZoom(e, zoomAmount) {
        e.preventDefault();

        // Check where we are scrolling
        var posClickedOnRealImage = getRealPositionOnCanvas(1,e.clientX,e.clientY)
        // Array containing infos of the minutie if we are scroll on it, [0] = false if the minutie is not targeted, [1] = number of the targeted minutie
        var scaleMinutie = [false,-1];
            
        // Check if we are scrolling on a minutie 
        for (minutie of minuties) {
            // Checking the circle around the center of all minuties regardless of its shape
            if (
                Math.sqrt(
                    (posClickedOnRealImage.x - minutie[0]) * (posClickedOnRealImage.x - minutie[0]) +
                        (posClickedOnRealImage.y - minutie[1]) * (posClickedOnRealImage.y - minutie[1])
                ) <
                baseSize * minutie[3]
            ) {
                
                scaleMinutie = [true,minuties.indexOf(minutie)]
            }

        }
            
        // Either scale the whole image, or scale only the targeted minutie
        if (!isDragging & !lens.frozen) {
            if (!scaleMinutie[0]){
                lastZoom = cameraZoom;

                cameraZoom += (zoomAmount * cameraZoom) / 2;

                cameraZoom = Math.min(cameraZoom, maxZoom);
                cameraZoom = Math.max(cameraZoom, minZoom);

                if (lens.offsetWidth / (1 + zoomAmount) > image.width) {
                    cameraZoom = lastZoom;
                }

                if (lens.offsetHeight / (1 + zoomAmount) > image.height) {
                    cameraZoom = lastZoom;
                }

                if (cameraOffset.x * cameraZoom - canvas.width / 2 < 0) {
                    cameraOffset.x = canvas.width / (2 * cameraZoom);
                }

                if (cameraOffset.y * cameraZoom - canvas.height / 2 < 0) {
                    cameraOffset.y = canvas.height / (2 * cameraZoom);
                }

                if (cameraOffset.x * cameraZoom + canvas.width / 2 > image.naturalWidth * cameraZoom) {
                    cameraOffset.x = image.naturalWidth - canvas.width / (2 * cameraZoom);
                }

                if (cameraOffset.y * cameraZoom + canvas.height / 2 > image.naturalHeight * cameraZoom) {
                    cameraOffset.y = image.naturalHeight - canvas.height / (2 * cameraZoom);
                }
            }
            else{
                minuties[scaleMinutie[1]][3] = Math.max(minuties[scaleMinutie[1]][3] += zoomAmount, 0.1) 
            }
            drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
        }
    }

    function adjustZoom2(e, zoomAmount) {
        e.preventDefault();

        var posClickedOnRealImage = getRealPositionOnCanvas(2,e.clientX,e.clientY)
        var scaleMinutie = [false,-1];

            for (minutie of minuties2) {
                if (
                    Math.sqrt(
                        (posClickedOnRealImage.x - minutie[0]) * (posClickedOnRealImage.x - minutie[0]) +
                            (posClickedOnRealImage.y - minutie[1]) * (posClickedOnRealImage.y - minutie[1])
                    ) <
                    baseSize * minutie[3]
                ) {
                   
                    scaleMinutie = [true,minuties2.indexOf(minutie)]
                }

            }

        if (!isDragging2 & !lens2.frozen) {
            if (!scaleMinutie[0]){

                lastZoom2 = cameraZoom2;

                cameraZoom2 += (zoomAmount * cameraZoom2) / 2;

                cameraZoom2 = Math.min(cameraZoom2, maxZoom2);
                cameraZoom2 = Math.max(cameraZoom2, minZoom2);

                if (lens2.offsetWidth / (1 + zoomAmount) > image2.width) {
                    cameraZoom2 = lastZoom2;
                }

                if (lens2.offsetHeight / (1 + zoomAmount) > image2.height) {
                    cameraZoom2 = lastZoom2;
                }

                if (cameraOffset2.x * cameraZoom2 - canvas2.width / 2 < 0) {
                    cameraOffset2.x = canvas2.width / (2 * cameraZoom2);
                }

                if (cameraOffset2.y * cameraZoom2 - canvas2.height / 2 < 0) {
                    cameraOffset2.y = canvas2.height / (2 * cameraZoom2);
                }

                if (cameraOffset2.x * cameraZoom2 + canvas2.width / 2 > image2.naturalWidth * cameraZoom2) {
                    cameraOffset2.x = image2.naturalWidth - canvas2.width / (2 * cameraZoom2);
                }

                if (cameraOffset2.y * cameraZoom2 + canvas2.height / 2 > image2.naturalHeight * cameraZoom2) {
                    cameraOffset2.y = image2.naturalHeight - canvas2.height / (2 * cameraZoom2);
                }
            }
                else{
                    minuties2[scaleMinutie[1]][3] = Math.max(minuties2[scaleMinutie[1]][3] += zoomAmount, 0.1) 
                }

            // ;
            drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

        }
    }

    // Add mouse events
    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mouseup", onPointerUp);
    // Moving after dragging
    canvas.addEventListener("mousemove", onPointerMove);
    // Zooming image or minutie
    canvas.addEventListener("wheel", (e) => adjustZoom(e, (zoomAmount = e.deltaY * scrollSensitivity)));
    // Let go the dragging
    canvas.addEventListener("mouseleave", (e) => (isDragging = false));
    // Freeze or unfreeze the dragging when clicking on the lens
    lens.addEventListener("mousedown", freezeUnfreeze);
    // Double click to add or remove a minutie
    canvas.addEventListener("dblclick", function (e) {
        e.preventDefault();

        // Position clicked in the real image referencial, not in the screen referencial. Is between [0, image.naturalWidth] and [0, image.naturalHeight]
        var posClickedOnRealImage = getRealPositionOnCanvas(1,getEventLocation(e).x, getEventLocation(e).y )
        // If a minuties is clicked, needs to be deleted
        var deleted = false;

        for (minutie of minuties) {
            if (
                Math.sqrt(
                    (posClickedOnRealImage.x - minutie[0]) * (posClickedOnRealImage.x - minutie[0]) +
                        (posClickedOnRealImage.y - minutie[1]) * (posClickedOnRealImage.y - minutie[1])
                ) <
                baseSize * minutie[3]
            ) {
                // Remove the targeted minuties only once
                if (deleted == false) {minuties.splice(minuties.indexOf(minutie), 1);}
                deleted = true;
            }
        }

        // Remove also texts
        for (text of texts){

            // Check for text hitbox
            var underTopOfText = posClickedOnRealImage.y > text[2] - 2 
            var overBootomOfText = posClickedOnRealImage.y < text[2] + 20
            var inLeftOfText = posClickedOnRealImage.x > text[1] - 2
            var inRightOfText = posClickedOnRealImage.x < text[1] + ctx.measureText(text[0]).width/2 + 2

            if ((underTopOfText) && (overBootomOfText) &&(inLeftOfText) && (inRightOfText)){
                
                if (deleted == false) {texts.splice(texts.indexOf(text), 1);}
                deleted = true;
            
            }
        }

        // If nothing has to be deleted, can add a minutie instead
        if (deleted == false) {
            minuties.push([
                posClickedOnRealImage.x,
                posClickedOnRealImage.y,
                "",
                scale,
                currentMinutie,
                currentColor,
            ]);
            numberMinutie = numberMinutie + 1;
        }



        // ;
        drawResult(1, imgCanvas, image, result, canvas, ctx, lens, cameraOffset, cameraZoom, baseSize, drawgrid, minutiesDraw = minuties, textsDraw = texts, arrowsDraw = arrows, minutieToShow = "-1")
    });
    // Add text to canvas
    canvas.addEventListener("long-press", function (e) {
        addTextToCanvas(1, e.detail.clientX, e.detail.clientY, ctx);
    });
    canvas.onclick =  function (e){
        // If the arrows option is selected
        if (drawingArrow){
            addArrowCanvas(1, scale, currentColor, e)
        }
    }

    canvas2.addEventListener("mousedown", onPointerDown2);
    canvas2.addEventListener("mouseup", onPointerUp2);
    canvas2.addEventListener("mousemove", onPointerMove2);
    canvas2.addEventListener("wheel", (e) => adjustZoom2(e, (zoomAmount = e.deltaY * scrollSensitivity2)));
    canvas2.addEventListener("mouseleave", (e) => (isDragging2 = false));
    lens2.addEventListener("mousedown", freezeUnfreeze);
    canvas2.addEventListener("dblclick", function (e) {
        e.preventDefault();

        var posClickedOnRealImage = getRealPositionOnCanvas(2,getEventLocation(e).x, getEventLocation(e).y )

        var deleted = false;

        for (minutie of minuties2) {
            if (
                Math.sqrt(
                    (posClickedOnRealImage.x - minutie[0]) * (posClickedOnRealImage.x - minutie[0]) +
                        (posClickedOnRealImage.y - minutie[1]) * (posClickedOnRealImage.y - minutie[1])
                ) <
                baseSize2 * minutie[3]
            ) {
                minuties2.splice(minuties2.indexOf(minutie), 1);
                deleted = true;
            }
        }

        for (text of texts2){

            var underTopOfText = posClickedOnRealImage.y > text[2] - 2 
            var overBootomOfText = posClickedOnRealImage.y < text[2] + 10
            var inLeftOfText = posClickedOnRealImage.x > text[1] - 2
            var inRightOfText = posClickedOnRealImage.x < text[1] + ctx2.measureText(text[0]).width/2 + 2

            if ((underTopOfText) && (overBootomOfText) &&(inLeftOfText) && (inRightOfText)){
                
                texts2.splice(texts2.indexOf(text), 1);
                deleted = true;
            
            }
        }

        if (deleted == false) {
            minuties2.push([
                posClickedOnRealImage.x,
                posClickedOnRealImage.y,
                "",
                scale,
                currentMinutie,
                currentColor,
            ]);
            numberMinutie2 = numberMinutie2 + 1;
        }

        // ;
        drawResult(2, imgCanvas2, image2, result2, canvas2, ctx2, lens2, cameraOffset2, cameraZoom2, baseSize2, drawgrid2, minutiesDraw = minuties2, textsDraw = texts2, arrowsDraw = arrows2, minutieToShow = "-1")

    });
    canvas2.addEventListener("long-press", function (e) {
        addTextToCanvas(2, e.detail.clientX, e.detail.clientY, ctx2);
    });
    canvas2.onclick =  function (e){
        if (drawingArrow){
            addArrowCanvas(2, scale, currentColor, e)
        }
    }

    // Swaping between sync and async functionality
    var swapbtn = document.getElementById("swapbtn");
    swapbtn.addEventListener("click", function () {
        areShared = !areShared;
        if (areShared) {
            swapbtn.innerText = lang["Sync"];
        } else {
            swapbtn.innerText = lang["Async"];
        }
    });

}

/**
 * Downlaod the content of both result div 
 */
function downloadCanv() {

    html2canvas(document.getElementById("myresult1"), {
        letterRendering: 1,
        allowTaint: true,
    }).then((canvas) => {
        var link = document.createElement("a");
        link.download = "leftImg.png";
        link.setAttribute("crossOrigin", "anonymous");
        try {
            link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        } catch (e) {
            console.log(e);
            alert("DataURL security error");
        }
        link.click();
    });

    html2canvas(document.getElementById("myresult2"), {
        letterRendering: 1,
        allowTaint: true,
    }).then((canvas) => {
        var link = document.createElement("a");
        link.download = "rightImg.png";
        link.setAttribute("crossOrigin", "anonymous");
        try {
            link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        } catch (e) {
            console.log(e);
            alert("DataURL security error");
        }
        link.click();
    });
}

/**
 * Build the interface for all the buttons
 * @param {string} imgID ID of the image element of the interface (at the bottom)
 * @param {string} resultID ID of the result div element of the interface (at the top)
 * @param {string} canvasID ID of the canvas inside the result div
 * @param {string} imgID2 ID of the second image element of the interface (at the bottom)
 * @param {string} resultID2 ID of the second result div element of the interface (at the top)
 * @param {string} canvasID2 ID of the second canvas inside the result div
 * @param {string} posID ID of the element where the whole interface is built
 */
function createUiCanvSwitch(imgID, resultID, canvasID, imgID2, resultID2, canvasID2, posID) {

    var btnPlace = null;

    if (document.getElementById(posID) != null) {
        btnPlace = document.getElementById(posID);
    } else {
        btnPlace = document.body;
    }

    const sync = document.createElement("button");

    const downlo = document.createElement("button");

    sync.className = "btnUi";
    sync.classList.add("btnComp");
    sync.id = "swapbtn";

    downlo.className = "btnUi";
    downlo.classList.add("btnComp");
    downlo.id = "downloId";

    sync.style.left = "101px";
    sync.style.top = "5px";

    downlo.style.left = "10px";
    downlo.style.top = "5px";

    sync.innerHTML = lang["Async"];
    downlo.innerHTML = lang["Download"];

    for (node of btnPlace.childNodes) {
        if (node.id == "swapbtn") {
            node.remove();
        }
    }

    for (node of btnPlace.childNodes) {
        if (node.id == "downloId") {
            node.remove();
        }
    }

    btnPlace.insertBefore(sync, btnPlace.firstChild);
    btnPlace.insertBefore(downlo, btnPlace.firstChild);

    panZoomCanvasSwitch(imgID, resultID, canvasID, imgID2, resultID2, canvasID2);

    downlo.onclick = downloadCanv;
}

/**
 * Adds a minutie to a canvas, used when dragging a number directly on the canvas
 * @param {int} clientX Coordinate X of the position on the event, in the viewport
 * @param {int} clientY Coordinate Y of the position on the event, in the viewport
 * @param {int} canvasNumber Number of the canvas 1 (left) or 2 (right)
 * @param {int} chosenNumber Number associated with the minutie
 * @param {float} scale Scale of the minutie
 */
function addMinutieToCanvas(clientX, clientY, canvasNumber, chosenNumber, scale) {

    // Chose correct global variable (linked to the canvas 1 or 2)
    var targetPosX = canvasNumber == 1 ? posX : posX2;
    var targetPosY = canvasNumber == 1 ? posY : posY2;
    var targetCameraZoom = canvasNumber == 1 ? cameraZoom : cameraZoom2;
    var minutiesTable = canvasNumber == 1 ? minuties : minuties2;
    var targetCanvas = canvasNumber == 1 ? document.getElementById("mycanvas1") : document.getElementById("mycanvas2");
    var targetBase = canvasNumber == 1 ? baseSize : baseSize2;


    // Position of the click in the image referencial
    posClickedOnRealImage = getRealPositionOnCanvas(canvasNumber, clientX, clientY)
    
    // Add the minutie to the right array
    minutiesTable.push([
        posClickedOnRealImage.x,
        posClickedOnRealImage.y,
        chosenNumber,
        scale,
        currentMinutie,
        currentColor,
    ]);

    var targetCtx = targetCanvas.getContext("2d");

    var fontColor = canvasNumber == 1 ? "red" : "blue";

    // Reset testBaseline to its default value : "alphabetic", was changed after insertion of text to the value : "top"
    targetCtx.textBaseline = "alphabetic"

    // Draw the minutie in the right shape
    window[currentMinutie](
        targetCtx,
        targetCameraZoom,
        posClickedOnRealImage.x * targetCameraZoom + targetPosX,
        posClickedOnRealImage.y * targetCameraZoom + targetPosY,
        scale,
        chosenNumber,
        posClickedOnRealImage.x * targetCameraZoom + targetPosX - targetBase * targetCameraZoom * scale,
        posClickedOnRealImage.y * targetCameraZoom + targetPosY - targetBase * targetCameraZoom * scale,
        baseSize,
        currentColor,
        fontColor
    );
}

/**
 * Add events to shape and scale selectors 
 */
function setUpShapes() {

    $(function () {
        // If shapeCircle button is clicked : chose circle minuties : "currentMinutie" global variable is changed
        document.getElementById("shapeCircleId").onclick = function () {
            currentMinutie = "drawMinutiesCircle";
        };
        document.getElementById("shapeSquareId").onclick = function () {
            currentMinutie = "drawMinutiesSquare";
        };
        document.getElementById("shapeTriangleId").onclick = function () {
            currentMinutie = "drawMinutiesTriangle";
        };
        document.getElementById("shapeArrowId").onclick = function () {
            drawingArrow = true;
        };
        document.getElementById("scaleId").onchange = function () {
            scale = Number(this.value);
        };
    });
}

/**
 * Add events to color selectors 
 */
function setUpColors() {

    $(function () {
        document.getElementById("colorRedId").onclick = function () {
            currentColor = "red";
        };
        document.getElementById("colorBlueId").onclick = function () {
            currentColor = "blue";
        };
        document.getElementById("colorGreenId").onclick = function () {
            currentColor = "green";
        };
        document.getElementById("colorWhiteId").onclick = function () {
            currentColor = "white";
        };
        document.getElementById("colorBlackId").onclick = function () {
            currentColor = "black";
        };
    });
}

/**
 * Returns the position clicked on the canvas according to the real image referencial
 * @param {int} clientX Coordinate X of the position on the event, in the viewport
 * @param {int} clientY Coordinate Y of the position on the event, in the viewport
 * @param {int} canvasNumber Number of the canvas 1 (left) or 2 (right)
 */
function getRealPositionOnCanvas(canvasNumber, clientX, clientY) {

    // Get the right variables of the canvas
    var targetPosX = canvasNumber == 1 ? posX : posX2;
    var targetPosY = canvasNumber == 1 ? posY : posY2;
    var targetCameraZoom = canvasNumber == 1 ? cameraZoom : cameraZoom2;
    var targetImage = canvasNumber == 1 ? document.getElementById("myimage1") : document.getElementById("myimage2");
    var targetCanvas = canvasNumber == 1 ? document.getElementById("mycanvas1") : document.getElementById("mycanvas2");

    // Get position of the top left of the lens (the view of the result) in the real image referencial
    var topLeftOfLens = {
        x: - targetPosX / targetCameraZoom,
        y: - targetPosY / targetCameraZoom,
    };

    var lensWidth = (targetCanvas.width * targetImage.width) / (targetImage.naturalWidth * targetCameraZoom);
    var lensHeight = (targetCanvas.height * targetImage.height) / (targetImage.naturalHeight * targetCameraZoom);

    // Size of the lens in the real image referencial
    var sizeOfLens = {
        width: targetImage.naturalWidth * (lensWidth / targetImage.width),
        height: targetImage.naturalHeight * (lensHeight / targetImage.height),
    };

    // Position where we click on the canvas in term of proportion of lens (view) e.g if the center of the canvas is clicked, the result is {0.5,0.5}
    var fractionOfClickInCanvas = {
        x: (clientX - targetCanvas.getBoundingClientRect().left) / targetCanvas.offsetHeight,
        y: (clientY - targetCanvas.getBoundingClientRect().top) / targetCanvas.offsetWidth,
    };

    // Position of the top left of the lens added to the position clicked in the lens (in term of real image distance)
    var posClickedOnRealImage = {
        x: Math.floor(topLeftOfLens.x + sizeOfLens.width * fractionOfClickInCanvas.x),
        y: Math.floor(topLeftOfLens.y + sizeOfLens.height * fractionOfClickInCanvas.y),
    };

    return posClickedOnRealImage;
}

/**
 * Write a txt on the canvas, called by the long click event
 * @param {int} canvasNumber: Canvas 1 or 2
 * @param {int} clientX: Coordinate X where the user clicks
 * @param {int} clientY: Coordinate Y where the user clicks
 * @param {<canvas> context} ctx: Context where the text will be written
*/
function addTextToCanvas(canvasNumber, clientX, clientY, ctx) {

    // Creation of the text input
    var input = document.createElement("input");
    document.getElementById("myresult1").appendChild(input)
    input.type = "text";
    input.style.position = "fixed";
    input.style.left = clientX - 4 + "px";
    input.style.top = clientY - 4 + "px";
    input.tabIndex = 0;
    input.className = "inputTextOnImage"

    // Get pos of the text in the image referencial
    var pos = getRealPositionOnCanvas(canvasNumber, clientX, clientY);
    input.style.width = '20px'
    // Each keydown triggers the enter handling function
    input.onkeydown = function (e) {
        handleEnter(e, ctx, pos.x, pos.y, canvasNumber);
        this.style.width = ((this.value.length + 1)*10) + 20 + 'px'
    };

    document.body.appendChild(input);
    window.setTimeout(() => input.focus(), 0);

}

/**
 * Handles what is written by the user when pressing ENTER key
 * @param {event} e Event onkeydown
 * @param {<canvas> context} ctx Context of the corresponding canvas
 * @param {int} posX Position X of the text in the image referencial
 * @param {int} posY Position Y of the text in the image referencial
 * @param {int} canvasNumber Number of the right canvas
*/
function handleEnter(e, ctx, posX, posY, canvasNumber) {

    var keyCode = e.keyCode;
    // Check if the ENTER key is pressed
    if (keyCode === 13) {

        drawTextCanvas(e.target.value, posX, posY, ctx, canvasNumber);
        document.body.removeChild(e.target);
    }
}

/**
 * Draw text on the canvas
 * @param {string} txt Text to be written
 * @param {int} x Coordinate X of the position of the text in the real image referencial
 * @param {int} y Coordinate Y of the position of the text in the real image referencial
 * @param {<canvas> context} ctx Context of the canvas wherer the text is needs to be written
 * @param {int} canvasNumber Number of the targetted canvas 1 (left) or 2 (right)
 * 
 */
function drawTextCanvas(txt, x, y, ctx, canvasNumber) {
    
    var targetPosX = canvasNumber == 1 ? posX : posX2;
    var targetPosY = canvasNumber == 1 ? posY : posY2;
    var targetCameraZoom = canvasNumber == 1 ? cameraZoom : cameraZoom2;

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = "bold 12pt Arial";

    ctx.fillStyle = '#444444';
    ctx.fillText(txt, x * targetCameraZoom + targetPosX +1, y * targetCameraZoom + targetPosY+1);
    ctx.fillStyle = 'white';
    ctx.fillText(txt, x * targetCameraZoom + targetPosX, y * targetCameraZoom + targetPosY);



    canvasNumber == 1 ? texts.push([txt, x, y]) : texts2.push([txt, x, y]);
}

/**
 * Draws the arrow body, the line part
 * @param {int} x1 Coordinate X of the start of the arrow
 * @param {int} y1 Coordinate Y of the start of the arrow
 * @param {int} x2 Coordinate X of the end of the arrow
 * @param {int} y2 Coordinate Y of the end of the arrow
 * @param {float} scale Scale of the arrow : thickness and size of the head
 * @param {string} color Color of the arrow
 * @param {<canvas> context} ctx Context where the arrow is drawn
 */
function createArrowBody(x1, y1, x2, y2, scale, color, ctx){

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = scale;
  
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
  
    var angle = Math.atan((y2-y1)/(x2-x1))
    angle += ((x2 >= x1)?90:-90)*Math.PI/180; 
  
    createArrowHead(x2, y2, angle, scale, ctx)
  
}

/**
 * Draws the arrow head
 * @param {int} x2 Coordinate X of the end of the arrow
 * @param {int} y2 Coordinate Y of the end of the arrow
 * @param {float} angleRadian Global orientation of the arrow
 * @param {float} scale Scale of the arrow
 * @param {<canvas> context} ctx Context where the arrow is drawn
 */
function createArrowHead(x2, y2, angleRadian, scale, ctx){

    ctx.save();
    ctx.beginPath();
    // Changes the origin of the context temporarily
    ctx.translate(x2,y2);
    ctx.rotate(angleRadian);
    ctx.moveTo(0,-2*scale);
    ctx.lineTo(2*scale,5*scale);
    ctx.lineTo(-2*scale,5*scale);
    ctx.closePath();
    ctx.restore();
    ctx.fill();

}

/**
 * Freezes the canvas, draws the arrow on the canvas once, saves it in corresponding array, unfreezes the canvas
 * @param {int} canvasNumber Number of the canvas
 * @param {float} scale Scale of the arrow
 * @param {string} color Color of the arrow
 * @param {Event} e Event object coming from a mouve click event listener
 */
function addArrowCanvas(canvasNumber, scale, color, e){
    
    var targetLens = canvasNumber == 1 ? document.getElementById("mylens") : document.getElementById("mylens2")
    var targetArrows = canvasNumber == 1 ? arrows : arrows2
    
    if(drawingArrow & targetLens.frozen === false){
        //Get lens and freeze it so the view doesn't move during arrow creation
        
        targetLens.frozen = !targetLens.frozen;
        targetLens.setAttribute("frozen", targetLens.frozen);

        //Add the arrow to the canvas
        posOnCanvas = loadBothClicksUnfreeze(canvasNumber, scale, color, targetArrows, targetLens, e)
    }
}

/**
 * Listens for both clicks on the canvas
 * @param {int} canvasNumber Number of the canvas
 * @param {float} scale Scale of the arrow
 * @param {string} color Color of the arrow
 * @param {Array} arrows Array of all arrows of the result
 * @param {<div>} lens Lens of the corresponding canvas
 * @param {Event} e Event object coming from a mouve click event listener
 */
function loadBothClicksUnfreeze(canvasNumber, scale, color, arrows,lens,e){

    var targetCanvas = canvasNumber == 1 ? document.getElementById("mycanvas1") : document.getElementById("mycanvas2")
    var targetCameraZoom = canvasNumber == 1 ? cameraZoom : cameraZoom2
    var targetPosX = canvasNumber == 1 ? posX : posX2
    var targetPosY = canvasNumber == 1 ? posY : posY2

    var firstClick = null;
    var secondClick = null;


    function clickTwice(e){

        // Get first click
        if (firstClick === null){
            firstClick = [getRealPositionOnCanvas(canvasNumber,e.clientX,e.clientY).x,
                          getRealPositionOnCanvas(canvasNumber,e.clientX,e.clientY).y ]
        }
        // Get second click
        else if (secondClick === null){
            secondClick = [getRealPositionOnCanvas(canvasNumber,e.clientX,e.clientY).x,
                           getRealPositionOnCanvas(canvasNumber,e.clientX,e.clientY).y ]

            // Add the arrow
            createArrowBody(
                firstClick[0] * targetCameraZoom + targetPosX,
                firstClick[1]* targetCameraZoom + targetPosY,
                secondClick[0] * targetCameraZoom + targetPosX,
                secondClick[1]* targetCameraZoom + targetPosY, 
                scale, 
                color, 
                targetCanvas.context)

            arrows.push([...firstClick ,...secondClick, scale, color])
            firstClick = null;
            secondClick = null;
            drawingArrow = false;

            // Unfreeze the lens
            lens.frozen = !lens.frozen;
            lens.setAttribute("frozen", lens.frozen);
            // Remove the double click event listener
            targetCanvas.removeEventListener('click',clickTwice);        
        }
    }

    targetCanvas.addEventListener('click', clickTwice);
    
}

