function panZoomCanvasAsync(imgID, resultID, canvasID, imgID2, result2ID, canvasID2, src1, src2){

    const canvas = document.getElementById(canvasID);
    const image = document.getElementById(imgID);
    const ctx = canvas.getContext('2d');
    const result = document.getElementById(resultID);

    var imgCanvas = new Image();
    imgCanvas.src = src1;

    const canvas2 = document.getElementById(canvasID2);
    const image2 = document.getElementById(imgID2);
    const ctx2 = canvas2.getContext('2d');
    const result2 = document.getElementById(result2ID);

    var imgCanvas2 = new Image();
    imgCanvas2.src = src2;

    let cameraZoom2 = 1
    let maxZoom2 = 5
    let minZoom2 = 0.1
    let scrollSensitivity2 = 0.0005

    let isDragging2 = false
    let dragStart2 = { x: 0, y: 0 }

    let lastZoom2 = cameraZoom2

    var cameraOffset2 = {x: image2.naturalWidth/2, y: image2.naturalHeight/2};


    lens2 = document.createElement("DIV");
    lens2.id = "mylens2";
    lens2.scale = 1
    lens2.setAttribute("class", "img-zoom-lens");
    image2.parentElement.insertBefore(lens2, image2);


    var posX2 = - cameraOffset2.x*cameraZoom2 + canvas2.width/2;
    var posY2 = - cameraOffset2.y*cameraZoom2 + canvas2.height/2;

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
    function getEventLocation2(e)
    {
        return { x: e.clientX, y: e.clientY }        
    }

    function onPointerDown2(e)
    {
        isDragging2 = true
        dragStart2.x = getEventLocation2(e).x
        dragStart2.y = getEventLocation2(e).y

    }

    function onPointerUp2(e)
    {
        isDragging2 = false
        
    }

    function onPointerMove2(e)
    {
        if (isDragging2)
        {

            cameraOffset2.x +=  -(getEventLocation2(e).x - dragStart2.x)/cameraZoom2
            cameraOffset2.y +=  -(getEventLocation2(e).y - dragStart2.y)/cameraZoom2
            
            dragStart2.x = getEventLocation2(e).x
            dragStart2.y = getEventLocation2(e).y

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

    function adjustZoom2(e,zoomAmount)
    {
        e.preventDefault();
        if (!isDragging2)
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

    canvas2.addEventListener('mousedown', onPointerDown2)
    canvas2.addEventListener('mouseup', onPointerUp2)
    canvas2.addEventListener('mousemove', onPointerMove2)
    canvas2.addEventListener( 'wheel', (e) => adjustZoom2(e,zoomAmount=e.deltaY*scrollSensitivity2))
    canvas2.addEventListener( 'mouseleave', (e)=> isDragging2 = false)

}

panZoomCanvasAsync('myimage', 'myresult', 'mycanvas', 'myimage2', 'myresult2', 'mycanvas2','../../../src/img1.jpg', '../../../src/img1.jpg' )