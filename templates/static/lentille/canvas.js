const canvas = document.getElementById('mycanvas2');
const image = document.getElementById('myimage2');
const ctx = canvas.getContext('2d');

var img = new Image();
img.src = '../../../src/img1.jpg';

let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0005

var cameraOffset = {x: image.naturalWidth/2, y: image.naturalHeight/2};


function draw(){
    
    canvas.height = 500;
    canvas.width = 500;

    ctx.drawImage(img, - cameraOffset.x + 250, - cameraOffset.y + 250, image.naturalWidth*cameraZoom, image.naturalHeight*cameraZoom);


}

img.onload = draw()    

let isDragging = false
let dragStart = { x: 0, y: 0 }

let initialPinchDistance = null
let lastZoom = cameraZoom

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    return { x: e.clientX, y: e.clientY }        
}

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x
    dragStart.y = getEventLocation(e).y
    // console.log(isDragging)
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
    // console.log(isDragging)
}

function onPointerMove(e)
{
    if (isDragging)
    {
        //console.log(cameraOffset.x - (getEventLocation(e).x/cameraZoom - dragStart.x))
        console.log(getEventLocation(e).x - dragStart.x)

        cameraOffset.x +=  -(getEventLocation(e).x - dragStart.x)
        cameraOffset.y +=  -(getEventLocation(e).y - dragStart.y)
        
        dragStart.x = getEventLocation(e).x
        dragStart.y = getEventLocation(e).y


        draw()
    }
}

function adjustZoom(e,zoomAmount, zoomFactor)
{

    e.preventDefault();
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            cameraZoom = zoomFactor*lastZoom
        } 
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        //ctx.translate(500*(lastZoom-cameraZoom),(lastZoom-cameraZoom))
        
        ctx.translate(-50,-50)

        draw()
    }
}



canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener( 'wheel', (e) => adjustZoom(e,zoomAmount=e.deltaY*SCROLL_SENSITIVITY))
canvas.addEventListener( 'mouseleave', (e)=> isDragging = false)