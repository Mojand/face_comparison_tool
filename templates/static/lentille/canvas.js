function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}


function panZoomCanvasAsync(imgID, resultID, canvasID, imgID2, result2ID, canvasID2){

    var canvas = document.getElementById(canvasID);
    var image = document.getElementById(imgID);
    var ctx = canvas.getContext('2d');
    var result = document.getElementById(resultID);

    canvas.height = result.offsetHeight;
    canvas.width = result.offsetWidth;  

    var imgCanvas = new Image();
    imgCanvas.src = image.src;

    let cameraZoom = 1

    if(image.naturalWidth < canvas.offsetWidth){
        cameraZoom = (canvas.offsetWidth*1.5)/image.naturalWidth
    }

    if(image.naturalHeight < canvas.offsetHeight){
        if (cameraZoom < (canvas.offsetHeight*1.5)/image.naturalHeight) {
            cameraZoom = (canvas.offsetHeight*1.5)/image.naturalHeight
        }
    }

    let maxZoom = 15
    let minZoom = 0.01
    let scrollSensitivity = 0.0005

    let isDragging = false
    let dragStart = { x: 0, y: 0 }
    let lastZoom = cameraZoom
    var cameraOffset = {x: image.naturalWidth/2, y: image.naturalHeight/2};


    lens = document.createElement("DIV");
    lens.id = "mylens";
    lens.setAttribute("frozen", false)
    lens.frozen = false
    lens.setAttribute("class", "img-zoom-lens");
    image.parentElement.insertBefore(lens, image);


    var posX = - cameraOffset.x*cameraZoom + canvas.width/2;
    var posY = - cameraOffset.y*cameraZoom + canvas.height/2;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var canvas2 = document.getElementById(canvasID2);
    var image2 = document.getElementById(imgID2);
    var ctx2 = canvas2.getContext('2d');
    var result2 = document.getElementById(result2ID);

    canvas2.height = result2.offsetHeight;
    canvas2.width = result2.offsetWidth;  

    var imgCanvas2 = new Image();
    imgCanvas2.src = image2.src;

    let cameraZoom2 = 1

    

    if(image2.naturalWidth < canvas2.offsetWidth){
        cameraZoom2 = (canvas2.offsetWidth*1.5)/image2.naturalWidth
    }

    if(image2.naturalHeight < canvas2.offsetHeight){
        if (cameraZoom2 < (canvas2.offsetHeight*1.5)/image2.naturalHeight){
            cameraZoom2 = (canvas2.offsetHeight*1.5)/image2.naturalHeight
        }
    }

    let maxZoom2 = 15
    let minZoom2 = 0.01
    let scrollSensitivity2 = 0.0005

    let isDragging2 = false
    let dragStart2 = { x: 0, y: 0 }
    let lastZoom2 = cameraZoom2
    var cameraOffset2 = {x: image2.naturalWidth/2, y: image2.naturalHeight/2};


    lens2 = document.createElement("DIV");
    lens2.id = "mylens2";
    lens2.setAttribute("frozen", false)
    lens2.frozen = false
    lens2.setAttribute("class", "img-zoom-lens");
    image2.parentElement.insertBefore(lens2, image2);


    var posX2 = - cameraOffset2.x*cameraZoom2 + canvas2.width/2;
    var posY2 = - cameraOffset2.y*cameraZoom2 + canvas2.height/2;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function draw(){

        canvas.height = result.offsetHeight;
        canvas.width = result.offsetWidth;  
        
        posX = - cameraOffset.x*cameraZoom + canvas.width/2;
        posY = - cameraOffset.y*cameraZoom + canvas.height/2;

        ctx.drawImage(imgCanvas, posX, posY, image.naturalWidth*cameraZoom, image.naturalHeight*cameraZoom);
        
        lens.style.width = (canvas.width*image.width)/(image.naturalWidth*cameraZoom) + "px";
        lens.style.height = (canvas.height*image.height)/(image.naturalHeight*cameraZoom) + "px";

        lens.style.left = -(posX*image.width)/(image.naturalWidth*cameraZoom) + "px";
        lens.style.top = -(posY*image.height)/(image.naturalHeight*cameraZoom) + "px";
   }

    imgCanvas.onload = draw()  

    function draw2(){
        
        canvas2.height = result2.offsetHeight;
        canvas2.width = result2.offsetWidth; 

        posX2 = - cameraOffset2.x*cameraZoom2 + canvas2.width/2;
        posY2 = - cameraOffset2.y*cameraZoom2 + canvas2.height/2;

        ctx2.drawImage(imgCanvas2, posX2, posY2, image2.naturalWidth*cameraZoom2, image2.naturalHeight*cameraZoom2);
        
        lens2.style.width = (canvas2.width*image2.width)/(image2.naturalWidth*cameraZoom2) + "px";
        lens2.style.height = (canvas2.height*image2.height)/(image2.naturalHeight*cameraZoom2) + "px";

        lens2.style.left = -(posX2*image2.width)/(image2.naturalWidth*cameraZoom2) + "px";
        lens2.style.top = -(posY2*image2.height)/(image2.naturalHeight*cameraZoom2) + "px";
    }
    imgCanvas2.onload = draw2()    

    // Gets the relevant location from a mouse or single touch event
    
    function getEventLocation(e)
    {
        return { x: e.clientX, y: e.clientY }        
    }

    function freezeUnfreeze(e){

        e.target.frozen = !e.target.frozen
        e.target.setAttribute("frozen", e.target.frozen)
    }

    function onPointerDown(e)
    {
        isDragging = true
        dragStart.x = getEventLocation(e).x
        dragStart.y = getEventLocation(e).y

    }

    function onPointerDown2(e)
    {
        isDragging2 = true
        dragStart2.x = getEventLocation(e).x
        dragStart2.y = getEventLocation(e).y

    }

    function onPointerUp(e)
    {
        isDragging = false
        
    }

    function onPointerUp2(e)
    {
        isDragging2 = false
        
    }

    function onPointerMove(e)
    {
        if (isDragging)
        {
            if (!lens.frozen){

            cameraOffset.x +=  -(getEventLocation(e).x - dragStart.x)/cameraZoom
            cameraOffset.y +=  -(getEventLocation(e).y - dragStart.y)/cameraZoom
            
            dragStart.x = getEventLocation(e).x
            dragStart.y = getEventLocation(e).y



                if (cameraOffset.x*cameraZoom - canvas.width/2 < 0){
                    cameraOffset.x = canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom - canvas.height/2 < 0){
                    cameraOffset.y = canvas.height/(2*cameraZoom)
                }

                if (cameraOffset.x*cameraZoom + canvas.width/2 > image.naturalWidth*cameraZoom){
                    cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom + canvas.height/2 > image.naturalHeight*cameraZoom){
                    cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoom)
                }
                
                draw()

            }
        }
    }

    function onPointerMove2(e)
    {
        if (isDragging2)
        {

            if(!lens2.frozen){

            cameraOffset2.x +=  -(getEventLocation(e).x - dragStart2.x)/cameraZoom2
            cameraOffset2.y +=  -(getEventLocation(e).y - dragStart2.y)/cameraZoom2
            
            dragStart2.x = getEventLocation(e).x
            dragStart2.y = getEventLocation(e).y



                if (cameraOffset2.x*cameraZoom2 - canvas2.width/2 < 0){
                    cameraOffset2.x = canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 - canvas2.height/2 < 0){
                    cameraOffset2.y = canvas2.height/(2*cameraZoom2)
                }

                if (cameraOffset2.x*cameraZoom2 + canvas2.width/2 > image2.naturalWidth*cameraZoom2){
                    cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 + canvas2.height/2 > image2.naturalHeight*cameraZoom2){
                    cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoom2)
                }

                draw2()
            }
        }
    }

    function adjustZoom(e,zoomAmount)
    {
        e.preventDefault();
        if (!isDragging & !lens.frozen)
        {
            lastZoom = cameraZoom

            cameraZoom += zoomAmount
            
            cameraZoom = Math.min( cameraZoom, maxZoom )
            cameraZoom = Math.max( cameraZoom, minZoom )

            if (lens.offsetWidth/(1+zoomAmount)> image.width){
                cameraZoom = lastZoom
            }

            if (lens.offsetHeight/(1+zoomAmount) > image.height){
                cameraZoom = lastZoom
            }

            if (cameraOffset.x*cameraZoom - canvas.width/2 < 0){
                cameraOffset.x = canvas.width/(2*cameraZoom)
            }

            if (cameraOffset.y*cameraZoom - canvas.height/2 < 0){
                cameraOffset.y = canvas.height/(2*cameraZoom)
            }

            if (cameraOffset.x*cameraZoom + canvas.width/2 > image.naturalWidth*cameraZoom){
                cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoom)
            }

            if (cameraOffset.y*cameraZoom + canvas.height/2 > image.naturalHeight*cameraZoom){
                cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoom)
            }

            draw()

        }
    }

    function adjustZoom2(e,zoomAmount)
    {
        e.preventDefault();
        if (!isDragging2 & !lens2.frozen)
        {
            lastZoom2 = cameraZoom2

            cameraZoom2 += zoomAmount
            
            cameraZoom2 = Math.min( cameraZoom2, maxZoom2 )
            cameraZoom2 = Math.max( cameraZoom2, minZoom2 )

            if (lens2.offsetWidth/(1+zoomAmount)> image2.width){
                cameraZoom2 = lastZoom2
            }

            if (lens2.offsetHeight/(1+zoomAmount) > image2.height){
                cameraZoom2 = lastZoom2
            }

            if (cameraOffset2.x*cameraZoom2 - canvas2.width/2 < 0){
                cameraOffset2.x = canvas2.width/(2*cameraZoom2)
            }

            if (cameraOffset2.y*cameraZoom2 - canvas2.height/2 < 0){
                cameraOffset2.y = canvas2.height/(2*cameraZoom2)
            }

            if (cameraOffset2.x*cameraZoom2 + canvas2.width/2 > image2.naturalWidth*cameraZoom2){
                cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoom2)
            }

            if (cameraOffset2.y*cameraZoom2 + canvas2.height/2 > image2.naturalHeight*cameraZoom2){
                cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoom2)
            }

            draw2()

        }
    }



    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener( 'wheel', (e) => adjustZoom(e,zoomAmount=e.deltaY*scrollSensitivity))
    canvas.addEventListener( 'mouseleave', (e)=> isDragging = false)
    lens.addEventListener('mousedown',freezeUnfreeze)

    canvas2.addEventListener('mousedown', onPointerDown2)
    canvas2.addEventListener('mouseup', onPointerUp2)
    canvas2.addEventListener('mousemove', onPointerMove2)
    canvas2.addEventListener( 'wheel', (e) => adjustZoom2(e,zoomAmount=e.deltaY*scrollSensitivity2))
    canvas2.addEventListener( 'mouseleave', (e)=> isDragging2 = false)
    lens2.addEventListener('mousedown',freezeUnfreeze)

}

function panZoomCanvasSync(imgID, resultID, canvasID, imgID2, result2ID, canvasID2){

    // Setting up all document elements
    var canvas = document.getElementById(canvasID);
    var image = document.getElementById(imgID);
    var ctx = canvas.getContext('2d');
    var result = document.getElementById(resultID);
    lens = document.createElement("DIV");
    lens.id = "mylens";
    lens.setAttribute("frozen", false)
    lens.frozen = false
    lens.setAttribute("class", "img-zoom-lens");
    image.parentElement.insertBefore(lens, image);

    var canvas2 = document.getElementById(canvasID2);
    var image2 = document.getElementById(imgID2);
    var ctx2 = canvas2.getContext('2d');
    var result2 = document.getElementById(result2ID);
    lens2 = document.createElement("DIV");
    lens2.id = "mylens2";
    lens2.setAttribute("frozen", false)
    lens2.frozen = false
    lens2.setAttribute("class", "img-zoom-lens");
    image2.parentElement.insertBefore(lens2, image2);

    canvas.height = result.offsetHeight;
    canvas.width = result.offsetWidth;  
    canvas2.height = result2.offsetHeight;
    canvas2.width = result2.offsetWidth; 

    // Setting up canvas images
    var imgCanvas = new Image();
    imgCanvas.src = image.src;

    var imgCanvas2 = new Image();
    imgCanvas2.src = image2.src;


    // Shared elements between both canvases
    let cameraZoomShared = 1

    if(image.naturalWidth < canvas.offsetWidth){
        cameraZoomShared = (canvas.offsetWidth*1.5)/image.naturalWidth
    }

    if(image.naturalHeight < canvas.offsetHeight){
        if (cameraZoomShared < (canvas.offsetHeight*1.5)/image.naturalHeight) {
            cameraZoomShared = (canvas.offsetHeight*1.5)/image.naturalHeight
        }
    }

    if (image2.naturalWidth < canvas2.offsetWidth){
        if (cameraZoomShared < (canvas2.offsetWidth*1.5)/image2.naturalWidth) {
            cameraZoomShared = (canvas2.offsetWidth*1.5)/image2.naturalWidth
        }
    }

    if (image2.naturalHeight < canvas2.offsetHeight){
        if (cameraZoomShared < (canvas2.offsetHeight*1.5)/image2.naturalHeight) {
            cameraZoomShared = (canvas2.offsetHeight*1.5)/image2.naturalHeight
        }
    }

    let maxZoomShared = 5
    let minZoomShared = 0.1
    let scrollSensitivityShared = 0.0005
    let isDraggingShared = false
    let lastZoomShared = cameraZoomShared

    // Coordinates at which the mouse was pressed before moving it
    let dragStart = { x: 0, y: 0 }
    let cameraOffset = {x: image.naturalWidth/2, y: image.naturalHeight/2};
    let posX = - cameraOffset.x*cameraZoomShared + canvas.width/2;
    let posY = - cameraOffset.y*cameraZoomShared + canvas.height/2;


    
    let dragStart2 = { x: 0, y: 0 }
    var cameraOffset2 = {x: image2.naturalWidth/2, y: image2.naturalHeight/2};
    var posX2 = - cameraOffset2.x*cameraZoomShared + canvas2.width/2;
    var posY2 = - cameraOffset2.y*cameraZoomShared + canvas2.height/2;


    function draw(){
        /*
        Draws the result of the zoom on the canvas
        */

        canvas.height = result.offsetHeight;
        canvas.width = result.offsetWidth;  
        canvas2.height = result2.offsetHeight;
        canvas2.width = result2.offsetWidth; 

        // Position of the image in the canvas
        // cameraOffset*cameraZoom because the image is scaled with the top left corner as the origin
        posX = - cameraOffset.x*cameraZoomShared + canvas.width/2;
        posY = - cameraOffset.y*cameraZoomShared + canvas.height/2;

        ctx.drawImage(imgCanvas, posX, posY, image.naturalWidth*cameraZoomShared, image.naturalHeight*cameraZoomShared);
        
        // Size of the lens on the preview image
        lens.style.width = (canvas.width*image.width)/(image.naturalWidth*cameraZoomShared) + "px";
        lens.style.height = (canvas.height*image.height)/(image.naturalHeight*cameraZoomShared) + "px";

        // Position of the lens on the preview image
        lens.style.left = -(posX*image.width)/(image.naturalWidth*cameraZoomShared) + "px";
        lens.style.top = -(posY*image.height)/(image.naturalHeight*cameraZoomShared) + "px";

   

        posX2 = - cameraOffset2.x*cameraZoomShared + canvas2.width/2;
        posY2 = - cameraOffset2.y*cameraZoomShared + canvas2.height/2;

        ctx2.drawImage(imgCanvas2, posX2, posY2, image2.naturalWidth*cameraZoomShared, image2.naturalHeight*cameraZoomShared);
        
        lens2.style.width = (canvas2.width*image2.width)/(image2.naturalWidth*cameraZoomShared) + "px";
        lens2.style.height = (canvas2.height*image2.height)/(image2.naturalHeight*cameraZoomShared) + "px";

        lens2.style.left = -(posX2*image2.width)/(image2.naturalWidth*cameraZoomShared) + "px";
        lens2.style.top = -(posY2*image2.height)/(image2.naturalHeight*cameraZoomShared) + "px";
    }

    imgCanvas2.onload = draw()    

    // Gets the relevant location from a mouse or single touch event
    
    function freezeUnfreeze(e){

        e.target.frozen = !e.target.frozen
        e.target.setAttribute("frozen", e.target.frozen)
    }

    function getEventLocation(e)
    {
        return { x: e.clientX, y: e.clientY }        
    }

    function onPointerDown(e)
    {
        isDraggingShared = true
        dragStart.x = getEventLocation(e).x
        dragStart.y = getEventLocation(e).y

    }

    function onPointerDown2(e)
    {
        isDraggingShared = true
        dragStart2.x = getEventLocation(e).x
        dragStart2.y = getEventLocation(e).y

    }

    function onPointerUp(e)
    {
        isDraggingShared = false
        
    }

    function onPointerUp2(e)
    {
        isDraggingShared = false
        
    }

    function onPointerMoveSync(e)
    {

        if (isDraggingShared)
        {

            let incrementX = 0;
            let incrementY = 0;

            if (e.target.id == canvasID){
                incrementX = dragStart.x - getEventLocation(e).x;
                incrementY = dragStart.y - getEventLocation(e).y;
            }

            if (e.target.id == canvasID2){
                incrementX = dragStart2.x - getEventLocation(e).x;
                incrementY = dragStart2.y - getEventLocation(e).y;
            }

            if (!lens.frozen){

                cameraOffset.x +=  incrementX/cameraZoomShared
                cameraOffset.y +=  incrementY/cameraZoomShared

                if (cameraOffset.x*cameraZoomShared - canvas.width/2 < 0){
                    cameraOffset.x = canvas.width/(2*cameraZoomShared)
                }

                if (cameraOffset.y*cameraZoomShared - canvas.height/2 < 0){
                    cameraOffset.y = canvas.height/(2*cameraZoomShared)
                }

                if (cameraOffset.x*cameraZoomShared + canvas.width/2 > image.naturalWidth*cameraZoomShared){
                    cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoomShared)
                }

                if (cameraOffset.y*cameraZoomShared + canvas.height/2 > image.naturalHeight*cameraZoomShared){
                    cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoomShared)
                }

            }

            if (!lens2.frozen){


                cameraOffset2.x +=  incrementX/cameraZoomShared
                cameraOffset2.y +=  incrementY/cameraZoomShared

                if (cameraOffset2.x*cameraZoomShared - canvas2.width/2 < 0){
                    cameraOffset2.x = canvas2.width/(2*cameraZoomShared)
                }

                if (cameraOffset2.y*cameraZoomShared - canvas2.height/2 < 0){
                    cameraOffset2.y = canvas2.height/(2*cameraZoomShared)
                }

                if (cameraOffset2.x*cameraZoomShared + canvas2.width/2 > image2.naturalWidth*cameraZoomShared){
                    cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoomShared)
                }

                if (cameraOffset2.y*cameraZoomShared + canvas2.height/2 > image2.naturalHeight*cameraZoomShared){
                    cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoomShared)
                }
            }

            dragStart.x = getEventLocation(e).x
            dragStart.y = getEventLocation(e).y
            dragStart2.x = getEventLocation(e).x
            dragStart2.y = getEventLocation(e).y

                draw()
        }
    }

    function adjustZoomSync(e,zoomAmount)
    {
        e.preventDefault();
        if (!isDraggingShared && !lens.frozen && !lens2.frozen)
        {
            lastZoomShared = cameraZoomShared

            cameraZoomShared += zoomAmount
            
            cameraZoomShared = Math.min( cameraZoomShared, maxZoomShared )
            cameraZoomShared = Math.max( cameraZoomShared, minZoomShared )

            if (lens.offsetWidth/(1+zoomAmount)> image.width){
                cameraZoomShared = lastZoomShared
            }

            if (lens.offsetHeight/(1+zoomAmount) > image.height){
                cameraZoomShared = lastZoomShared
            }

            if (cameraOffset.x*cameraZoomShared - canvas.width/2 < 0){
                cameraOffset.x = canvas.width/(2*cameraZoomShared)
            }

            if (cameraOffset.y*cameraZoomShared - canvas.height/2 < 0){
                cameraOffset.y = canvas.height/(2*cameraZoomShared)
            }

            if (cameraOffset.x*cameraZoomShared + canvas.width/2 > image.naturalWidth*cameraZoomShared){
                cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoomShared)
            }

            if (cameraOffset.y*cameraZoomShared + canvas.height/2 > image.naturalHeight*cameraZoomShared){
                cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoomShared)
            }



            if (lens2.offsetWidth/(1+zoomAmount)> image2.width){
                cameraZoomShared = lastZoomShared
            }

            if (lens2.offsetHeight/(1+zoomAmount) > image2.height){
                cameraZoomShared = lastZoomShared
            }

            if (cameraOffset2.x*cameraZoomShared - canvas2.width/2 < 0){
                cameraOffset2.x = canvas2.width/(2*cameraZoomShared)
            }

            if (cameraOffset2.y*cameraZoomShared - canvas2.height/2 < 0){
                cameraOffset2.y = canvas2.height/(2*cameraZoomShared)
            }

            if (cameraOffset2.x*cameraZoomShared + canvas2.width/2 > image2.naturalWidth*cameraZoomShared){
                cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoomShared)
            }

            if (cameraOffset2.y*cameraZoomShared + canvas2.height/2 > image2.naturalHeight*cameraZoomShared){
                cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoomShared)
            }

            draw()

        }
    }

    
    
    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('mousemove', onPointerMoveSync)
    canvas.addEventListener('wheel', (e) => adjustZoomSync(e,zoomAmount=e.deltaY*scrollSensitivityShared))
    canvas.addEventListener('mouseleave', (e)=> isDraggingShared = false)
    lens.addEventListener('mousedown',freezeUnfreeze)

    canvas2.addEventListener('mousedown', onPointerDown2)
    canvas2.addEventListener('mouseup', onPointerUp2)
    canvas2.addEventListener('mousemove', onPointerMoveSync)
    canvas2.addEventListener('wheel', (e) => adjustZoomSync(e,zoomAmount=e.deltaY*scrollSensitivityShared))
    canvas2.addEventListener('mouseleave', (e)=> isDraggingShared = false)
    lens2.addEventListener('mousedown',freezeUnfreeze)

}

function panZoomCanvasSwitch(imgID, resultID, canvasID, imgID2, result2ID, canvasID2){

///////////////////////////////////        RESULT 1          ////////////////////////////////////////

    var canvas = document.getElementById(canvasID);
    var image = document.getElementById(imgID);
    var ctx = canvas.getContext('2d');
    var result = document.getElementById(resultID);

    // Ajust canvas size to fit the result div
    canvas.height = result.offsetHeight;
    canvas.width = result.offsetWidth;  

    // Set up canvas image
    var imgCanvas = new Image();
    imgCanvas.src = image.src;

    let cameraZoom = 1

    // If the base image is smaller than the result size (meaning that the lens would overflow the image div) we initiate a higher zoom from the start
    if(image.naturalWidth < canvas.offsetWidth){
        cameraZoom = (canvas.offsetWidth*1.5)/image.naturalWidth
    }

    if(image.naturalHeight < canvas.offsetHeight){
        if (cameraZoom < (canvas.offsetHeight*1.5)/image.naturalHeight) {
            cameraZoom = (canvas.offsetHeight*1.5)/image.naturalHeight
        }
    }

    // Zoom limits
    let maxZoom = 30
    let minZoom = 0.01
    let scrollSensitivity = 0.0005

    // IsDragging === true if you are clickig on the result div
    let isDragging = false
    
    // Position where you started dragging, used to calculate total dragged distance
    let dragStart = { x: 0, y: 0 }
    let lastZoom = cameraZoom

    // Position of the top left corner of the div result 
    var cameraOffset = {x: image.naturalWidth/2, y: image.naturalHeight/2};

    // lens set up
    lens = document.createElement("DIV");
    lens.id = "mylens";
    lens.setAttribute("frozen", false)
    // if frozen -> nothing happens
    lens.frozen = false
    lens.setAttribute("class", "img-zoom-lens");
    image.parentElement.insertBefore(lens, image);

    // Position of the top left corner of the div result using the center of the div as a reference
    var posX = - cameraOffset.x*cameraZoom + canvas.width/2;
    var posY = - cameraOffset.y*cameraZoom + canvas.height/2;


///////////////////////////////////        RESULT 2          ////////////////////////////////////////

    var canvas2 = document.getElementById(canvasID2);
    var image2 = document.getElementById(imgID2);
    var ctx2 = canvas2.getContext('2d');
    var result2 = document.getElementById(result2ID);

    canvas2.height = result2.offsetHeight;
    canvas2.width = result2.offsetWidth;  

    var imgCanvas2 = new Image();
    imgCanvas2.src = image2.src;

    let cameraZoom2 = 1

    

    if(image2.naturalWidth < canvas2.offsetWidth){
        cameraZoom2 = (canvas2.offsetWidth*1.5)/image2.naturalWidth
    }

    if(image2.naturalHeight < canvas2.offsetHeight){
        if (cameraZoom2 < (canvas2.offsetHeight*1.5)/image2.naturalHeight){
            cameraZoom2 = (canvas2.offsetHeight*1.5)/image2.naturalHeight
        }
    }

    let maxZoom2 = 30
    let minZoom2 = 0.01
    let scrollSensitivity2 = 0.0005

    let isDragging2 = false
    let dragStart2 = { x: 0, y: 0 }
    let lastZoom2 = cameraZoom2
    var cameraOffset2 = {x: image2.naturalWidth/2, y: image2.naturalHeight/2};


    lens2 = document.createElement("DIV");
    lens2.id = "mylens2";
    lens2.setAttribute("frozen", false)
    lens2.frozen = false
    lens2.setAttribute("class", "img-zoom-lens");
    image2.parentElement.insertBefore(lens2, image2);


    var posX2 = - cameraOffset2.x*cameraZoom2 + canvas2.width/2;
    var posY2 = - cameraOffset2.y*cameraZoom2 + canvas2.height/2;

///////////////////////////////////////      SHARED ATTRIBUTES       //////////////////////////////////////////////////////////

    var areShared = false
    

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Draw canvas modification on the first result

    function draw(){

        canvas.height = result.offsetHeight;
        canvas.width = result.offsetWidth;  
        
        posX = - cameraOffset.x*cameraZoom + canvas.width/2;
        posY = - cameraOffset.y*cameraZoom + canvas.height/2;

        ctx.drawImage(imgCanvas, posX, posY, image.naturalWidth*cameraZoom, image.naturalHeight*cameraZoom);
        
        lens.style.width = (canvas.width*image.width)/(image.naturalWidth*cameraZoom) + "px";
        lens.style.height = (canvas.height*image.height)/(image.naturalHeight*cameraZoom) + "px";

        lens.style.left = -(posX*image.width)/(image.naturalWidth*cameraZoom) + "px";
        lens.style.top = -(posY*image.height)/(image.naturalHeight*cameraZoom) + "px";
    }

    imgCanvas.onload = draw()  

    // Draw canvas modification on the second result

    function draw2(){
        
        canvas2.height = result2.offsetHeight;
        canvas2.width = result2.offsetWidth; 

        posX2 = - cameraOffset2.x*cameraZoom2 + canvas2.width/2;
        posY2 = - cameraOffset2.y*cameraZoom2 + canvas2.height/2;

        ctx2.drawImage(imgCanvas2, posX2, posY2, image2.naturalWidth*cameraZoom2, image2.naturalHeight*cameraZoom2);
        
        lens2.style.width = (canvas2.width*image2.width)/(image2.naturalWidth*cameraZoom2) + "px";
        lens2.style.height = (canvas2.height*image2.height)/(image2.naturalHeight*cameraZoom2) + "px";

        lens2.style.left = -(posX2*image2.width)/(image2.naturalWidth*cameraZoom2) + "px";
        lens2.style.top = -(posY2*image2.height)/(image2.naturalHeight*cameraZoom2) + "px";
    }
    imgCanvas2.onload = draw2()    


    // Get position of the user cursor
    function getEventLocation(e)
    {
        return { x: e.clientX, y: e.clientY }        
    }

    // Toogle frozen attribute
    function freezeUnfreeze(e){
        e.target.frozen = !e.target.frozen
        e.target.setAttribute("frozen", e.target.frozen)
    }

    // 
    function onPointerDown(e)
    {
        isDragging = true
        dragStart.x = getEventLocation(e).x
        dragStart.y = getEventLocation(e).y

    }

    function onPointerDown2(e)
    {
        isDragging2 = true
        dragStart2.x = getEventLocation(e).x
        dragStart2.y = getEventLocation(e).y

    }

    function onPointerUp(e)
    {
        isDragging = false
        
    }

    function onPointerUp2(e)
    {
        isDragging2 = false
        
    }

    function onPointerMove(e)
    {
        // If both results move separatly
        if (!areShared){
            // If we are dragging the first result
            if (isDragging)
            {
                // If the result is not frozen
                if (!lens.frozen){

                // We add every single call the dragged distance to the result scaled with the cameraZoom
                cameraOffset.x +=  -(getEventLocation(e).x - dragStart.x)/cameraZoom
                cameraOffset.y +=  -(getEventLocation(e).y - dragStart.y)/cameraZoom
                
                // Reset the dragging starting point for the next dragging callback
                dragStart.x = getEventLocation(e).x
                dragStart.y = getEventLocation(e).y


                // Check for boundaries
                if (cameraOffset.x*cameraZoom - canvas.width/2 < 0){
                    cameraOffset.x = canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom - canvas.height/2 < 0){
                    cameraOffset.y = canvas.height/(2*cameraZoom)
                }

                if (cameraOffset.x*cameraZoom + canvas.width/2 > image.naturalWidth*cameraZoom){
                    cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom + canvas.height/2 > image.naturalHeight*cameraZoom){
                    cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoom)
                }
                
                // Draw only in the first result canvas
                draw()
                }
            }
        }

        // If we want both the results to move together
        else{
            if (isDragging)
            {
                if (!lens.frozen)
                {

                cameraOffset.x +=  -(getEventLocation(e).x - dragStart.x)/cameraZoom
                cameraOffset.y +=  -(getEventLocation(e).y - dragStart.y)/cameraZoom


                if (cameraOffset.x*cameraZoom - canvas.width/2 < 0){
                    cameraOffset.x = canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom - canvas.height/2 < 0){
                    cameraOffset.y = canvas.height/(2*cameraZoom)
                }

                if (cameraOffset.x*cameraZoom + canvas.width/2 > image.naturalWidth*cameraZoom){
                    cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom + canvas.height/2 > image.naturalHeight*cameraZoom){
                    cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoom)
                }
                
                draw()

                }

                if(!lens2.frozen){

                // We add the dragging distance made in the first result div
                cameraOffset2.x +=  -(getEventLocation(e).x - dragStart.x)/cameraZoom2
                cameraOffset2.y +=  -(getEventLocation(e).y - dragStart.y)/cameraZoom2
                
                // We reset the starting position after both divs are done
                dragStart.x = getEventLocation(e).x
                dragStart.y = getEventLocation(e).y



                if (cameraOffset2.x*cameraZoom2 - canvas2.width/2 < 0){
                    cameraOffset2.x = canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 - canvas2.height/2 < 0){
                    cameraOffset2.y = canvas2.height/(2*cameraZoom2)
                }

                if (cameraOffset2.x*cameraZoom2 + canvas2.width/2 > image2.naturalWidth*cameraZoom2){
                    cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 + canvas2.height/2 > image2.naturalHeight*cameraZoom2){
                    cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoom2)
                }

                draw2()
                }
                else
                {
                    // If the other div is frozen, we had to reset the starting position regardless
                    dragStart.x = getEventLocation(e).x
                    dragStart.y = getEventLocation(e).y
                }
            }

        }
    }

    function onPointerMove2(e)
    {
        if (!areShared){

            if (isDragging2)
            {
                if(!lens2.frozen){

                cameraOffset2.x +=  -(getEventLocation(e).x - dragStart2.x)/cameraZoom2
                cameraOffset2.y +=  -(getEventLocation(e).y - dragStart2.y)/cameraZoom2
                
                dragStart2.x = getEventLocation(e).x
                dragStart2.y = getEventLocation(e).y

                if (cameraOffset2.x*cameraZoom2 - canvas2.width/2 < 0){
                    cameraOffset2.x = canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 - canvas2.height/2 < 0){
                    cameraOffset2.y = canvas2.height/(2*cameraZoom2)
                }

                if (cameraOffset2.x*cameraZoom2 + canvas2.width/2 > image2.naturalWidth*cameraZoom2){
                    cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 + canvas2.height/2 > image2.naturalHeight*cameraZoom2){
                    cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoom2)
                }

                draw2()
                }
            }
        }
        else{
            
            if (isDragging2)
            {
                if(!lens2.frozen){

                cameraOffset2.x +=  -(getEventLocation(e).x - dragStart2.x)/cameraZoom2
                cameraOffset2.y +=  -(getEventLocation(e).y - dragStart2.y)/cameraZoom2


                if (cameraOffset2.x*cameraZoom2 - canvas2.width/2 < 0){
                    cameraOffset2.x = canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 - canvas2.height/2 < 0){
                    cameraOffset2.y = canvas2.height/(2*cameraZoom2)
                }

                if (cameraOffset2.x*cameraZoom2 + canvas2.width/2 > image2.naturalWidth*cameraZoom2){
                    cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoom2)
                }

                if (cameraOffset2.y*cameraZoom2 + canvas2.height/2 > image2.naturalHeight*cameraZoom2){
                    cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoom2)
                }

                draw2()
                }

                // If the result is not frozen
                if (!lens.frozen){

                // We add every single call the dragged distance to the result scaled with the cameraZoom
                cameraOffset.x +=  -(getEventLocation(e).x - dragStart2.x)/cameraZoom
                cameraOffset.y +=  -(getEventLocation(e).y - dragStart2.y)/cameraZoom
                
                // Reset the dragging starting point for the next dragging callback
                
                dragStart2.x = getEventLocation(e).x
                dragStart2.y = getEventLocation(e).y


                // Check for boundaries
                if (cameraOffset.x*cameraZoom - canvas.width/2 < 0){
                    cameraOffset.x = canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom - canvas.height/2 < 0){
                    cameraOffset.y = canvas.height/(2*cameraZoom)
                }

                if (cameraOffset.x*cameraZoom + canvas.width/2 > image.naturalWidth*cameraZoom){
                    cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoom)
                }

                if (cameraOffset.y*cameraZoom + canvas.height/2 > image.naturalHeight*cameraZoom){
                    cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoom)
                }
                
                // Draw only in the first result canvas
                draw()
                }
                else{
                    dragStart2.x = getEventLocation(e).x
                    dragStart2.y = getEventLocation(e).y
                }
            }

        }
    }

    function adjustZoom(e,zoomAmount)
    {
        e.preventDefault();
        if (!isDragging & !lens.frozen)
        {
            lastZoom = cameraZoom

            cameraZoom += zoomAmount * cameraZoom/2
            
            cameraZoom = Math.min( cameraZoom, maxZoom )
            cameraZoom = Math.max( cameraZoom, minZoom )

            if (lens.offsetWidth/(1+zoomAmount)> image.width){
                cameraZoom = lastZoom
            }

            if (lens.offsetHeight/(1+zoomAmount) > image.height){
                cameraZoom = lastZoom
            }

            if (cameraOffset.x*cameraZoom - canvas.width/2 < 0){
                cameraOffset.x = canvas.width/(2*cameraZoom)
            }

            if (cameraOffset.y*cameraZoom - canvas.height/2 < 0){
                cameraOffset.y = canvas.height/(2*cameraZoom)
            }

            if (cameraOffset.x*cameraZoom + canvas.width/2 > image.naturalWidth*cameraZoom){
                cameraOffset.x = image.naturalWidth - canvas.width/(2*cameraZoom)
            }

            if (cameraOffset.y*cameraZoom + canvas.height/2 > image.naturalHeight*cameraZoom){
                cameraOffset.y = image.naturalHeight - canvas.height/(2*cameraZoom)
            }

            draw()

        }
    }

    function adjustZoom2(e,zoomAmount)
    {
        e.preventDefault();
        if (!isDragging2 & !lens2.frozen)
        {
            lastZoom2 = cameraZoom2

            cameraZoom2 += zoomAmount * cameraZoom2/2
            
            cameraZoom2 = Math.min( cameraZoom2, maxZoom2 )
            cameraZoom2 = Math.max( cameraZoom2, minZoom2 )

            if (lens2.offsetWidth/(1+zoomAmount)> image2.width){
                cameraZoom2 = lastZoom2
            }

            if (lens2.offsetHeight/(1+zoomAmount) > image2.height){
                cameraZoom2 = lastZoom2
            }

            if (cameraOffset2.x*cameraZoom2 - canvas2.width/2 < 0){
                cameraOffset2.x = canvas2.width/(2*cameraZoom2)
            }

            if (cameraOffset2.y*cameraZoom2 - canvas2.height/2 < 0){
                cameraOffset2.y = canvas2.height/(2*cameraZoom2)
            }

            if (cameraOffset2.x*cameraZoom2 + canvas2.width/2 > image2.naturalWidth*cameraZoom2){
                cameraOffset2.x = image2.naturalWidth - canvas2.width/(2*cameraZoom2)
            }

            if (cameraOffset2.y*cameraZoom2 + canvas2.height/2 > image2.naturalHeight*cameraZoom2){
                cameraOffset2.y = image2.naturalHeight - canvas2.height/(2*cameraZoom2)
            }

            draw2()

        }
    }

    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener( 'wheel', (e) => adjustZoom(e,zoomAmount=e.deltaY*scrollSensitivity))
    canvas.addEventListener( 'mouseleave', (e)=> isDragging = false)
    lens.addEventListener('mousedown',freezeUnfreeze)

    canvas2.addEventListener('mousedown', onPointerDown2)
    canvas2.addEventListener('mouseup', onPointerUp2)
    canvas2.addEventListener('mousemove', onPointerMove2)
    canvas2.addEventListener( 'wheel', (e) => adjustZoom2(e,zoomAmount=e.deltaY*scrollSensitivity2))
    canvas2.addEventListener( 'mouseleave', (e)=> isDragging2 = false)
    lens2.addEventListener('mousedown',freezeUnfreeze)

    var swapbtn = document.getElementById("swapbtn")
    swapbtn.addEventListener("click", function(){
    areShared = !areShared
    if (areShared) {swapbtn.innerText = "Sync"}
    else {swapbtn.innerText = "Async"}
})

}

function downloadCanv(){
    html2canvas(document.getElementById('myresult1'),{ letterRendering: 1, allowTaint : true}).then(canvas => {
      var link = document.createElement('a');
      link.download = 'leftImg.png';
      link.setAttribute('crossOrigin', 'anonymous');
      try{
        link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      }
      catch(e){
        console.log(e)
        alert("DataURL security error")
      }
      link.click();
    });
  
    html2canvas(document.getElementById('myresult2'),{ letterRendering: 1, allowTaint : true}).then(canvas => {
      var link = document.createElement('a');
      link.download = 'rightImg.png';
      link.setAttribute('crossOrigin', 'anonymous');
      try{
        link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      }
      catch(e){
        console.log(e)
        alert("DataURL security error")
  
      }
      link.click();
    });
}
  
function createUiCanv(imgID, resultID, canvasID, imgID2, resultID2,canvasID2, posID ){

var btnPlace = null;


if (document.getElementById(posID) != null){
    btnPlace = document.getElementById(posID);
}
else{
    btnPlace = document.body;
}

const async = document.createElement("button")
const sync = document.createElement("button")
const downlo = document.createElement("button")

async.className = "btnUi"
sync.className = "btnUi"
downlo.className = "btnUi"

async.style.position = "absolute"
sync.style.position = "absolute"
downlo.style.position = "absolute"

async.style.right = "100%"
async.style.top = "33px"

sync.style.right = "100%"

downlo.style.right = "100%"
downlo.style.top = "65px"

async.innerHTML = "Async"
sync.innerHTML = "Sync"
downlo.innerHTML = "Download"

btnPlace.insertBefore(async, btnPlace.firstChild)
btnPlace.insertBefore(sync, btnPlace.firstChild)
btnPlace.insertBefore(downlo, btnPlace.firstChild)

async.onclick =function(){
    if (document.contains(document.getElementById("mylens"))){
    document.getElementById("mylens").remove()
    document.getElementById("mylens2").remove()
    }
    panZoomCanvasAsync(imgID, resultID, canvasID, imgID2, resultID2, canvasID2);
};

sync.onclick =function(){
    if (document.contains(document.getElementById("mylens"))){
    document.getElementById("mylens").remove()
    document.getElementById("mylens2").remove()
    }
    panZoomCanvasSync(imgID, resultID, canvasID, imgID2, resultID2, canvasID2);
};

downlo.onclick = downloadCanv

}

function createUiCanvSwitch(imgID, resultID, canvasID, imgID2, resultID2,canvasID2, posID ){

    var btnPlace = null;    
    
    if (document.getElementById(posID) != null){
        btnPlace = document.getElementById(posID);
    }
    else{
        btnPlace = document.body;
    }
    

    const sync = document.createElement("button")
    sync.id = "swapbtn"
    const downlo = document.createElement("button")
    
    sync.className = "btnUi"
    downlo.className = "btnUi"
    
    sync.style.position = "absolute"
    downlo.style.position = "absolute"
    
    sync.style.left = "1%"
    sync.style.top = "2px"
    
    downlo.style.left = "1%"
    downlo.style.top = "31px"

    sync.innerHTML = "Async"
    downlo.innerHTML = "Download"
    

    btnPlace.insertBefore(sync, btnPlace.firstChild)
    btnPlace.insertBefore(downlo, btnPlace.firstChild)
    

    panZoomCanvasSwitch(imgID, resultID, canvasID, imgID2, resultID2, canvasID2);
    
    downlo.onclick = downloadCanv
    
}
    


