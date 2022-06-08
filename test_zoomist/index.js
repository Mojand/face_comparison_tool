const parent = document.getElementById("parent")
const element = document.getElementById("child")

// let canvas = document.createElement("canvas")
// let ctx = canvas.getContext("2d")
// var image_ = new Image()
// image_.src = '../src/cropped.jpg'

// image_.onload = function () {
//     canvas.width = image_.width;
//     canvas.height = image_.height;
//     ctx.drawImage(image_, 0, 0, image_.width, image_.height);
//   };

//   element.setAttribute("data-zoom-src",'/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/cropped.jpg')
//   parent.setAttribute("data-zoom-src",'/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/cropped.jpg')
//   canvas.setAttribute("data-zoom-src",'/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/src/cropped.jpg')


// //element.appendChild(canvas)

// new Zoomist("#my-zoomst",{
//     slider: true,
//     zoomer: true,
//     bounds: false
// })

var instance = Panzoom(element,{});

btnIn = document.getElementById("zoomIn")
btnOut = document.getElementById("zoomOut")

btnIn.addEventListener("click",instance.zoomIn)
btnOut.addEventListener("click",instance.zoomOut)
parent.addEventListener('wheel', instance.zoomWithWheel)


// parent.addEventListener('wheel', function(event) {
//     if (!event.shiftKey) return
//     instance.zoomWithWheel(event)
//   })

// instance.on('panstart', function(e) {
//   console.log('Fired when pan is just started ', e);
//   // Note: e === instance.
// });

// instance.on('pan', function(e) {
//   console.log('Fired when the scene is being panned', e);
// });

// instance.on('panend', function(e) {
//   console.log('Fired when pan ended', e);
// });

// instance.on('zoom', function(e) {
//   console.log('Fired when scene is zoomed', e);
// });

// instance.on('transform', function(e) {
//   // This event will be called along with events above.
//   console.log('Fired when any transformation has happened', e);
// });


// let canvas = document.getElementById("canvas")
// let ctx = canvas.getContext('2d')


// //Context and image setting up

// var image_ = new Image();
// image_.src = "../src/img1.jpg";

// //Drawing of the canvas content
// image_.onload = function () {
//   canvas.width = image_.width;
//   canvas.height = image_.height;
//   ctx.drawImage(image_, 0, 0, image_.width, image_.height);
// };

// let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
// let cameraZoom = 1
// let MAX_ZOOM = 5
// let MIN_ZOOM = 0.1
// let SCROLL_SENSITIVITY = 0.0005

// function draw()
// {
//     canvas.width = window.innerWidth
//     canvas.height = window.innerHeight
    
//     // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
//     ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
//     ctx.scale(cameraZoom, cameraZoom)
//     ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
//     ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
//     ctx.fillStyle = "#991111"
//     drawRect(-50,-50,100,100)
    

    
//     requestAnimationFrame( draw )
// }

// // Gets the relevant location from a mouse or single touch event
// function getEventLocation(e)
// {
//     if (e.touches && e.touches.length == 1)
//     {
//         return { x:e.touches[0].clientX, y: e.touches[0].clientY }
//     }
//     else if (e.clientX && e.clientY)
//     {
//         return { x: e.clientX, y: e.clientY }        
//     }
// }

// function drawRect(x, y, width, height)
// {
//     ctx.fillRect( x, y, width, height )
// }

// function drawText(text, x, y, size, font)
// {
//     ctx.font = `${size}px ${font}`
//     ctx.fillText(text, x, y)
// }

// let isDragging = false
// let dragStart = { x: 0, y: 0 }

// function onPointerDown(e)
// {
//     isDragging = true
//     dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
//     dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
// }

// function onPointerUp(e)
// {
//     isDragging = false
//     initialPinchDistance = null
//     lastZoom = cameraZoom
// }

// function onPointerMove(e)
// {
//     if (isDragging)
//     {
//         cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
//         cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
//     }
// }

// function handleTouch(e, singleTouchHandler)
// {
//     if ( e.touches.length == 1 )
//     {
//         singleTouchHandler(e)
//     }
//     else if (e.type == "touchmove" && e.touches.length == 2)
//     {
//         isDragging = false
//         handlePinch(e)
//     }
// }

// let initialPinchDistance = null
// let lastZoom = cameraZoom

// function handlePinch(e)
// {
//     e.preventDefault()
    
//     let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
//     let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
//     // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
//     let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
//     if (initialPinchDistance == null)
//     {
//         initialPinchDistance = currentDistance
//     }
//     else
//     {
//         adjustZoom( null, currentDistance/initialPinchDistance )
//     }
// }

// function adjustZoom(zoomAmount, zoomFactor)
// {
//     if (!isDragging)
//     {
//         if (zoomAmount)
//         {
//             cameraZoom += zoomAmount
//         }
//         else if (zoomFactor)
//         {
//             console.log(zoomFactor)
//             cameraZoom = zoomFactor*lastZoom
//         }
        
//         cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
//         cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
//         console.log(zoomAmount)
//     }
// }

// canvas.addEventListener('mousedown', onPointerDown)
// canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
// canvas.addEventListener('mouseup', onPointerUp)
// canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
// canvas.addEventListener('mousemove', onPointerMove)
// canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
// canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

// // Ready, set, go
// draw()