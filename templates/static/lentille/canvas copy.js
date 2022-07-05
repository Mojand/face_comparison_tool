function panZoomCanvasAsync(imgID, resultID, canvasID, imgID2, result2ID, canvasID2, src1, src2){

    const canvas = document.getElementById(canvasID);
    const image = document.getElementById(imgID);
    const ctx = canvas.getContext('2d');
    const result = document.getElementById(resultID);
    
    const canvas2 = document.getElementById(canvasID2);
    const image2 = document.getElementById(imgID2);
    const ctx2 = canvas2.getContext('2d');
    const result2 = document.getElementById(result2ID);

    let imgCanvas = new Image();
    imgCanvas.src = src1;

    let imgCanvas2 = new Image();
    imgCanvas2.src = src2;

    let cameraZoom = 1;
    let maxZoom = 1.5;
    let minZoom = 0.5;
    let scrollSensitivity = 0.0005;

    let cameraZoom2 = 1;
    let maxZoom2 = 5;
    let minZoom2 = 0.1;
    let scrollSensitivity2 = 0.0005;

    let cameraOffset = { x: image.naturalWidth/2, y: image.naturalHeight/2 };
    let cameraOffset2 = { x: image2.naturalWidth/2, y: image2.naturalHeight/2 };

    lens = document.createElement("DIV");
    lens.id = "mylens";
    lens.scale = 1
    lens.setAttribute("class", "img-zoom-lens");
    image.parentElement.insertBefore(lens, image);

    lens2 = document.createElement("DIV");
    lens2.id = "mylens2";
    lens2.scale = 1
    lens2.setAttribute("class", "img-zoom-lens");
    image2.parentElement.insertBefore(lens2, image2);

    let posX = - cameraOffset.x*cameraZoom + canvas.width/2;
    let posY = - cameraOffset.y*cameraZoom + canvas.height/2;
    let posX2 = - cameraOffset2.x*cameraZoom2 + canvas2.width/2;
    let posY2 = - cameraOffset2.y*cameraZoom2 + canvas2.height/2;

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let initialPinchDistance = null;
    let lastZoom = cameraZoom;

    let isDragging2 = false;
    let dragStart2 = { x: 0, y: 0 };
    let initialPinchDistance2 = null;
    let lastZoom2 = cameraZoom2;

    imgCanvas.onload = draw(canvas,ctx, posX, posY, lens, cameraZoom, cameraOffset,result,image,imgCanvas);    
    imgCanvas2.onload = draw(canvas2,ctx2, posX2, posY2, lens2, cameraZoom2, cameraOffset2,result2,image2,imgCanvas2);    

    canvas2.addEventListener('mousedown', (e) => onPointerDown(e, isDragging2, dragStart2));
    canvas2.addEventListener('mouseup', (e) => onPointerUp(e, isDragging2, initialPinchDistance2));
    canvas2.addEventListener('mousemove', (e) => onPointerMove(e, isDragging2, dragStart2, cameraZoom2, cameraOffset2,canvas2, ctx2, lens2,posX2,posY2,image2,result2,imgCanvas2))
    canvas2.addEventListener( 'wheel', (e) => adjustZoom(e,zoomAmount=e.deltaY*scrollSensitivity2, canvas2, ctx2, posX2,posY2,lens2,cameraZoom2,cameraOffset2,maxZoom2,minZoom2, result2,image2,imgCanvas2, lastZoom2,isDragging2));
    canvas2.addEventListener( 'mouseleave', (e)=> isDragging2 = false)

}







function draw(canvas, ctx, posX, posY, lens, cameraZoom, cameraOffset, result, image, imageCanvas){
    
    canvas.height = result.offsetHeight;
    canvas.width = result.offsetWidth;    

    posX = - cameraOffset.x*cameraZoom + canvas.width/2;
    posY = - cameraOffset.y*cameraZoom + canvas.height/2;

    ctx.drawImage(imageCanvas, posX, posY, image.naturalWidth*cameraZoom, image.naturalHeight*cameraZoom);
    
    lens.style.width = (canvas.width*image.width)/(image.naturalWidth*cameraZoom) + "px";
    lens.style.height = (canvas.height*image.height)/(image.naturalHeight*cameraZoom) + "px";
    
    lens.style.left = -(posX*image.width)/(image.naturalWidth*cameraZoom) + "px";
    lens.style.top = -(posY*image.height)/(image.naturalHeight*cameraZoom) + "px";
    

} 


// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    return { x: e.clientX, y: e.clientY }        
}

function onPointerDown(e, isDragging, dragStart)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x
    dragStart.y = getEventLocation(e).y

}

function onPointerUp(e, isDragging, initialPinchDistance)  
{
    isDragging = false
    initialPinchDistance = null
    
}

function onPointerMove(e, isDragging, dragStart, cameraZoom, cameraOffset, canvas, ctx, lens, posX, posY, image,result,imageCanvas)
{
    console.log(isDragging)
    if (isDragging)
    {

        cameraOffset.x +=  -(getEventLocation(e).x - dragStart.x)
        cameraOffset.y +=  -(getEventLocation(e).y - dragStart.y)
        
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

        draw(canvas, ctx, posX, posY, lens, cameraZoom, cameraOffset,result,image,imageCanvas)
    }
}

function adjustZoom(e,zoomAmount, canvas, ctx, posX, posY, lens, cameraZoom, cameraOffset, maxZoom,minZoom,result, image, imageCanvas,lastZoom, isDragging)
{
    e.preventDefault();
    if (!isDragging)
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

        draw(canvas, ctx, posX, posY, lens, cameraZoom, cameraOffset,result, image, imageCanvas)

    }
}



panZoomCanvasAsync("myimage", "myresult", "mycanvas", "myimage2", "myresult2", "mycanvas2","/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/img1.jpg", "/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/img1.jpg")