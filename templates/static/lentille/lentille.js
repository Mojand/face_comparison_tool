

function imageZoomAsync(imgID, resultID, imgID2, resultID2) {
  /*
  Creates a lens on each image, and moves it around when the cursor is moved over the image. The content of the lens is zoomed and displayed in the result DIV.
  Both lenses are not linked, so they can be used separately.
  :param imgID: the ID of the image
  :param resultID: the ID of the result DIV
  :param imgID2: the ID of the second image
  :param resultID2: the ID of the second result DIV
  */

  // img, lens, result, img2, lens2, result2 : DOM elements
  // cx, cy : zoom ratio between the result DIV and the lens
  var img, lens, result, img2, lens2, result2, cx, cy;

  img = document.getElementById(imgID);
  result = document.getElementById(resultID);
  img2 = document.getElementById(imgID2);
  result2 = document.getElementById(resultID2);

  // Lens creation and set up
  lens = document.createElement("DIV");
  
  //Scale factor for the lens, 1 is the original size, larger scale means larger lens thus less aggressive zoom
  lens.scale = 1
  lens.id = "mylens";
  lens2 = document.createElement("DIV");
  lens2.id = "mylens2";
  lens2.scale = 1
  
  // Class for styling purposes
  lens.setAttribute("class", "img-zoom-lens");
  lens2.setAttribute("class", "img-zoom-lens");

  // Insert the lens into the DOM
  img.parentElement.insertBefore(lens, img);
  img2.parentElement.insertBefore(lens2, img2);
  
  // Calculate the ratio between the result DIV and the lens
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  
  // Zoom principle: the background of the result DIV is set to the image source, and the background size is set to the image size times the zoom ratio
  // When the lens moves, the background position is set the correct amount of pixels to match the movement of the lens
  result.style.backgroundImage = "url('" + img.src + "')";
  result.style.backgroundSize = img.width * cx + "px " + img.height * cy + "px";
  result2.style.backgroundImage = "url('" + img2.src + "')"; 
  result2.style.backgroundSize = img2.width * cx + "px " + img2.height * cy + "px"


  // offsetZoomXlens, offsetZoomXlens2 : offset to be added to the background position to match the movement of the lens on the X a
  var offsetZoomXlens = 0 ;
  var offsetZoomXlens2 = 0 ;
  var offsetZoomYlens = 0 ;
  var offsetZoomYlens2 = 0 ;


  // Parameters are passed as an attribute so they can be used in callbacks functions
  lens.param = {
    "image" :img,
    "resultat" :result,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomXlens": offsetZoomXlens,
    "offsetZoomYlens": offsetZoomYlens,
  }

  lens2.param = {
    "image" :img2,
    "resultat" :result2,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomXlens": offsetZoomXlens2,
    "offsetZoomYlens": offsetZoomYlens2,
  }

  // Callback functions
  lens.addEventListener("mousemove", moveLens);
  lens2.addEventListener("mousemove", moveLens);

  // When you create a lens, it is frozen by default. If frozen, the lens won't move nor scale up or down 
  lens.setAttribute("frozen", true)
  lens.frozen = true;
  lens2.setAttribute("frozen", true)
  lens2.frozen = true;


  // Toggle freeze by clicking on the lens
  lens.addEventListener('click', (e)=>{
    lens.frozen = !lens.frozen;
    lens.setAttribute("frozen", lens.frozen)
  });
  lens2.addEventListener('click', (e)=>{
    lens2.frozen = !lens2.frozen;
    lens2.setAttribute("frozen", lens2.frozen)
  });


}

function imageZoomSync(imgID, resultID, imgID2, resultID2) {
  /*
  Creates a lens on each image, and moves it around when the cursor is moved over the image. The content of the lens is zoomed and displayed in the result DIV.
  Both lenses are linked, so they move and change scale together.
  :param imgID: the ID of the image
  :param resultID: the ID of the result DIV
  :param imgID2: the ID of the second image
  :param resultID2: the ID of the second result DIV
  */

  var img, lens, result, img2, lens2, result2, cx, cy;

  var offsetZoomXlens = 0 ;
  var offsetZoomXlens2 = 0 ;
  var offsetZoomYlens = 0 ;
  var offsetZoomYlens2 = 0 ;


  img = document.getElementById(imgID);
  result = document.getElementById(resultID);

  img2 = document.getElementById(imgID2);
  result2 = document.getElementById(resultID2);


  lens = document.createElement("DIV");
  lens.scale = 1
  lens.id = "mylens";
  lens2 = document.createElement("DIV");
  lens2.id = "mylens2";
  lens2.scale = 1

  lens.setAttribute("class", "img-zoom-lens");
  lens2.setAttribute("class", "img-zoom-lens");


  img.parentElement.insertBefore(lens, img);
  img2.parentElement.insertBefore(lens2, img2);

  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;


  result2.style.backgroundImage = "url('" + img2.src + "')"; 
  result2.style.backgroundSize = img2.width * cx + "px " + img2.height * cy + "px"

  result.style.backgroundImage = "url('" + img.src + "')";
  result.style.backgroundSize = img.width * cx + "px " + img.height * cy + "px";

  // Parameters are passed as an attribute so they can be used in callbacks functions, the master lens gets parameters from the slave lens to control its movement
  lens.param = {
    "image" :img,
    "resultat" :result,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomXlens": offsetZoomXlens,
    "offsetZoomYlens": offsetZoomYlens,
  
    "imageSlave" :img2,
    "resultatSlave" :result2,
    "offsetZoomXSlave": offsetZoomXlens2,
    "offsetZoomYSlave": offsetZoomYlens2,
    "lensSlave":lens2,
  }

  lens.addEventListener("mousemove", moveLenSync);

  lens.setAttribute("frozen", true)
  lens.frozen = true;
  lens2.setAttribute("frozen", true)
  lens2.frozen = true;

  lens.addEventListener('click', (e)=>{
    lens.frozen = !lens.frozen;
    lens2.frozen = !lens2.frozen;
    lens.setAttribute("frozen", lens.frozen)
    lens2.setAttribute("frozen", lens2.frozen)
  });

  lens2.addEventListener('click', (e)=>{
    lens2.frozen = !lens2.frozen;
    lens.frozen = !lens.frozen;
    lens.setAttribute("frozen", lens.frozen)
    lens2.setAttribute("frozen", lens2.frozen)
  });

}
  
function zoomWheel(e){
  /*
  Change the scale of the lens by using the mouse wheel. The scale is limited to a minimum of 0.125 and a maximum of 4.
  */

  if (!e.target.frozen){

    // The page won't scroll when the lens is being rescaled
    e.preventDefault();

    // Parameters are taken from the lens attribute
    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]

    // The scale is changed according to the wheel movement
    scale += e.deltaY * -0.0005;
    
    // The scale is limited to a minimum of 0.125 and a maximum of 4
    scale = Math.min(Math.max(.125,scale),4);
    // The cale transform is applied to the lens
    this.style.transform = `scale(${scale})`;
    // The scale attribute is updated
    this.scale = scale
    // The background size is updated accordingly
    result.style.backgroundSize = img.width * (cx/scale) + "px " + img.height * (cy/scale) + "px";
    
    // The offset is updated according to the lens position 
    e.target.param["offsetZoomXlens"] = -(lens.offsetWidth-(lens.offsetWidth*(scale)))/2
    e.target.param["offsetZoomYlens"] = -(lens.offsetHeight-(lens.offsetHeight*(scale)))/2

    // The background of the result DIV is updated accordingly when using the wheel
    moveLens(e)

  }
}

function zoomWheelSync(e){

  /*
  Change the scale of both of the lenses by using the mouse wheel. The scale is limited to a minimum of 0.125 and a maximum of 4.
  */

  if (!e.target.frozen){
    
    e.preventDefault();

    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]

    // We also need the slave lens parameters
    img2 = e.target.param["imageSlave"]
    result2 = e.target.param["resultatSlave"]
    offsetZoomXlens2 = e.target.param["offsetZoomXSlave"]
    offsetZoomYlens2 = e.target.param["offsetZoomYSlave"] 
    lens2 = e.target.param["lensSlave"]
    scale2 = lens2.scale


    scale += e.deltaY * -0.0005;
    scale2 += e.deltaY * -0.0005;
    
    scale = Math.min(Math.max(.125,scale),4);
    this.style.transform = `scale(${scale})`;
    this.scale = scale
    result.style.backgroundSize = img.width * (cx/scale) + "px " + img.height * (cy/scale) + "px";

    scale2 = Math.min(Math.max(.125,scale),4);
    lens2.style.transform = `scale(${scale2})`;
    lens2.scale = scale2
    result2.style.backgroundSize = img2.width * (cx/scale2) + "px " + img2.height * (cy/scale2) + "px";
    

    e.target.param["offsetZoomXlens"] = -(lens.offsetWidth-(lens.offsetWidth*(scale)))/2
    e.target.param["offsetZoomYlens"] = -(lens.offsetHeight-(lens.offsetHeight*(scale)))/2

    e.target.param["offsetZoomXSlave"] = -(lens2.offsetWidth-(lens2.offsetWidth*(scale2)))/2
    e.target.param["offsetZoomYSlave"] = -(lens2.offsetHeight-(lens2.offsetHeight*(scale2)))/2

    moveLenSync(e)
  }
}

function getCursorPos(e) {
  // Get the x and y positions of the cursor
  var a,
    x = 0,
    y = 0;
  e = e || window.event;


  a = e.target.param["image"].getBoundingClientRect();
  

  x = e.pageX - a.left;
  y = e.pageY - a.top;

  x = x - window.pageXOffset;
  y = y - window.pageYOffset;
  return { x: x, y: y };
}

function moveLens(e) {


  if (e.target.className === "img-zoom-lens"){

    // Parameters are taken from the lens attribute
    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]
    offsetZoomXlens = e.target.param["offsetZoomXlens"] 
    offsetZoomYlens = e.target.param["offsetZoomYlens"]

    // Prevent default acton for mousemove event
    e.preventDefault();

    // Get the cursor position
    let pos = getCursorPos(e);
    
    // Set the position of the lens in the image accordingly to the cursor position. We want the cursor to be in the center of the lens.
    // offset(Width/Height) is the width/height of the lens with a scale = 1
    let x = pos.x - (lens.offsetWidth) / 2;
    let y = pos.y - (lens.offsetHeight) / 2;

    // Avoid the lens to go out of the image
    // offsetZoom(X/Y)lens is the added or reduced width/height of the lens with a scale different from 1. When the scale is 1, offsetZoomXlens = 0
    if (x > img.width - lens.offsetWidth  - offsetZoomXlens - 1) {
      x = img.width - lens.offsetWidth - offsetZoomXlens - 1;
    }
    if (x <  offsetZoomXlens + 1) {
      x = offsetZoomXlens + 1;
    }
    if (y > img.height - lens.offsetHeight - offsetZoomYlens - 1) {
      y = img.height - lens.offsetHeight - offsetZoomYlens - 1;
    }
    if (y < offsetZoomYlens + 1) {
      y = 1 + offsetZoomYlens;
    }


    if (!e.target.frozen){

      // Set up the lens position in the image
      lens.style.left = x + "px";
      lens.style.top = y + "px";
      
      //  Enlargement ratio between the lens on the image and the result DIV (Initially, the result div is 3 times the size of the lens i.e cx = cy = 3, if scale == 3, the enlargement ratio == 1)
      const ratio = cx/scale

      //Position imaginaire de la souris dans le referentiel du background
      const mouseX = pos.x*ratio
      const mouseY = pos.y*ratio
      
      //Décalage causé par la demi largeur/longueur de la lentille scalé dans le monde background, === 300/2 
      const pixelRollback = (100*cx)/2


      //taille actuelle de l'image background - décalage 
      const maxMousePositionX = img.width * (cx/scale) - pixelRollback
      const maxMousePositionY = img.height * (cx/scale) - pixelRollback


      result.style.backgroundPosition = `-${Math.min(Math.max(pixelRollback,mouseX), maxMousePositionX+1)-pixelRollback}px -${Math.min(Math.max(pixelRollback,mouseY), maxMousePositionY+1)-pixelRollback}px `
    }
    lens.onwheel = zoomWheel;
  }
  
}

function moveLenSync(e){
  if (e.target.className === "img-zoom-lens"){

    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]
    offsetZoomXlens = e.target.param["offsetZoomXlens"] 
    offsetZoomYlens = e.target.param["offsetZoomYlens"]

    img2 = e.target.param["imageSlave"]
    result2 = e.target.param["resultatSlave"]
    offsetZoomXlens2 = e.target.param["offsetZoomXSlave"]
    offsetZoomYlens2 = e.target.param["offsetZoomYSlave"] 
    lens2 = e.target.param["lensSlave"]


    /*empêchez toute autre action pouvant se produire pendant le déplacement sur l’image:*/
    e.preventDefault();

    /*obtenez les positions x et y du curseur:*/
    let pos = getCursorPos(e);
    /*calculez la position de la lentille :*/
    let x = pos.x - (lens.offsetWidth) / 2;
    let y = pos.y - (lens.offsetHeight) / 2;

    let distDivX = img2.getBoundingClientRect().left - img.getBoundingClientRect().left;
    let distDivY = img2.getBoundingClientRect().top - img.getBoundingClientRect().top;

    let x2 = pos.x  - (lens2.offsetWidth) / 2;
    let y2 = pos.y  - (lens2.offsetHeight) / 2;


    /*empêchez la lentille d’être positionnée à l’extérieur de l’image:*/
    if (x > img.width - lens.offsetWidth  - offsetZoomXlens - 1) {
      x = img.width - lens.offsetWidth - offsetZoomXlens - 1;
    }
    if (x <  offsetZoomXlens + 1) {
      x = offsetZoomXlens + 1;
    }
    if (y > img.height - lens.offsetHeight - offsetZoomYlens - 1) {
      y = img.height - lens.offsetHeight - offsetZoomYlens - 1;
    }
    if (y < offsetZoomYlens + 1) {
      y = 1 + offsetZoomYlens;
    }

    /*empêchez la lentille d’être positionnée à l’extérieur de l’image:*/
    if (x2 > img2.width - lens2.offsetWidth  - offsetZoomXlens2 - 1) {
      x2 = img2.width - lens2.offsetWidth - offsetZoomXlens2 - 1;
    }
    if (x2 <  offsetZoomXlens2 + 1) {
      x2 = offsetZoomXlens2 + 1;
    }
    if (y2 > img2.height - lens2.offsetHeight - offsetZoomYlens2 - 1) {
      y2 = img2.height - lens2.offsetHeight - offsetZoomYlens2 - 1;
    }
    if (y2 < offsetZoomYlens2 + 1) {
      y2 = 1 + offsetZoomYlens2;
    }

    if (!e.target.frozen){

      /*mettez la position de la lentille:*/
      lens.style.left = x + "px";
      lens.style.top = y + "px";
      /*affichez ce que la lentille “voit”":*/

      lens2.style.left = x2 + "px";
      lens2.style.top = y2 + "px";

      const ratio = cx/scale

      //Position imaginaire de la souris dans le referentiel du background
      const mouseX = pos.x*ratio
      const mouseY = pos.y*ratio
      
      //Décalage causé par la demi largeur/longueur de la lentille scalé dans le monde background, === 300/2 
      const pixelRollback = (100*cx)/2

      //taille actuelle de l'image background - décalage 
      const maxMousePositionX = img.width * (cx/scale) - pixelRollback
      const maxMousePositionY = img.height * (cx/scale) - pixelRollback

      result.style.backgroundPosition = `-${Math.min(Math.max(pixelRollback,mouseX), maxMousePositionX+1)-pixelRollback}px -${Math.min(Math.max(pixelRollback,mouseY), maxMousePositionY+1)-pixelRollback}px `

      //Position imaginaire de la souris dans le referentiel du background
      const mouseX2 = (pos.x)*ratio
      const mouseY2 = (pos.y)*ratio
      

      //taille actuelle de l'image background - décalage 
      const maxMousePositionX2 = img2.width * (cx/scale) - pixelRollback
      const maxMousePositionY2 = img2.height * (cx/scale) - pixelRollback

      result2.style.backgroundPosition = `-${Math.min(Math.max(pixelRollback,mouseX2), maxMousePositionX2+1)-pixelRollback}px -${Math.min(Math.max(pixelRollback,mouseY2), maxMousePositionY2+1)-pixelRollback}px `
    }
    lens.onwheel = zoomWheelSync;

  }
  
}

function display(canvasDisplayId){
  const canvasDisplayElement = document.getElementById(canvasDisplayId)
  
  html2canvas(document.getElementById("myresult"),{ letterRendering: 1, allowTaint : true}).then(canvas => {
    canvasDisplayElement.appendChild(canvas)
    canvas.id = "canvasDL"
  });

  html2canvas(document.getElementById("myresult2"),{ letterRendering: 1, allowTaint : true}).then(canvas => {
    canvasDisplayElement.appendChild(canvas)
    canvas.id = "canvasDL2"
  });
};

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
};

function createUi(imgID, resultID, imgID2, resultID2, posID){

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

  // btnPlace.appendChild(async)
  // btnPlace.appendChild(sync)
  // btnPlace.appendChild(downlo)

  btnPlace.insertBefore(async, btnPlace.firstChild)
  btnPlace.insertBefore(sync, btnPlace.firstChild)
  btnPlace.insertBefore(downlo, btnPlace.firstChild)

  async.onclick =function(){
    if (document.contains(document.getElementById("mylens"))){
    document.getElementById("mylens").remove()
    document.getElementById("mylens2").remove()
    }
    imageZoomAsync(imgID, resultID, imgID2, resultID2);
  };

  sync.onclick =function(){
    if (document.contains(document.getElementById("mylens"))){
    document.getElementById("mylens").remove()
    document.getElementById("mylens2").remove()
    }
    imageZoomSync(imgID, resultID, imgID2, resultID2);
  };

  downlo.onclick = downloadCanv

}

