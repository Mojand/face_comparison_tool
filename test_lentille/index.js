// Needs image and result divs to be set up beforehand

function imageZoomAsync() {
  var img, lens, result, img2, lens2, result2, cx, cy;

  var offsetZoomXlens = 0 ;
  var offsetZoomXlens2 = 0 ;
  var offsetZoomYlens = 0 ;
  var offsetZoomYlens2 = 0 ;


  img = document.getElementById("myimage");
  result = document.getElementById("myresult");

  img2 = document.getElementById("myimage2");
  result2 = document.getElementById("myresult2");


  /*créez la lentille:*/
  lens = document.createElement("DIV");
  lens.scale = 1
  lens.id = "mylens";
  lens2 = document.createElement("DIV");
  lens2.id = "mylens2";
  lens2.scale = 1

  lens.setAttribute("class", "img-zoom-lens");
  lens2.setAttribute("class", "img-zoom-lens");

  /*mettez la lentille:*/
  img.parentElement.insertBefore(lens, img);
  img2.parentElement.insertBefore(lens2, img2);
  /*calculez le ratio entre le résultat DIV and la lentille:*/
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  /*définissez les propriétés de fond pour le résultat DIV:*/
  result.style.backgroundImage = "url('" + img.src + "')"; //On met l'image source comme background 
  result.style.backgroundSize = img.width * cx + "px " + img.height * cy + "px";//On étire le background pour créer une illusion de zoom

  result2.style.backgroundImage = "url('" + img2.src + "')"; 
  result2.style.backgroundSize = img2.width * cx + "px " + img2.height * cy + "px"

  lens.param = {
    "image" :img,
    "resultat" :result,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomX": offsetZoomXlens,
    "offsetZoomY": offsetZoomYlens,
  }

  lens2.param = {
    "image" :img2,
    "resultat" :result2,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomX": offsetZoomXlens2,
    "offsetZoomY": offsetZoomYlens2,
  }

  //result.style.backgroundSize = img.naturalWidth/scale+'px ' +  img.naturalHeight/scale+'px'
  /*Exécutez une fonction lorsque quelqu’un déplace le curseur sur l’image ou sur la lentille:*/
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mousemove", moveLens);

  lens2.addEventListener("mousemove", moveLens);
  img2.addEventListener("mousemove", moveLens);

  lens.setAttribute("frozen", true)
  lens2.setAttribute("frozen", true)

  lens.addEventListener('click', (e)=>{lens.frozen = !lens.frozen;});
  lens2.addEventListener('click', (e)=>{lens2.frozen = !lens2.frozen;});

}

function imageZoomSync() {
  var img, lens, result, img2, lens2, result2, cx, cy;

  var offsetZoomXlens = 0 ;
  var offsetZoomXlens2 = 0 ;
  var offsetZoomYlens = 0 ;
  var offsetZoomYlens2 = 0 ;


  img = document.getElementById("myimage");
  result = document.getElementById("myresult");

  img2 = document.getElementById("myimage2");
  result2 = document.getElementById("myresult2");

  /*créez la lentille:*/
  lens = document.createElement("DIV");
  lens.scale = 1
  lens.id = "mylens";
  lens2 = document.createElement("DIV");
  lens2.id = "mylens2";
  lens2.scale = 1

  lens.setAttribute("class", "img-zoom-lens");
  lens2.setAttribute("class", "img-zoom-lens");

  /*mettez la lentille:*/
  img.parentElement.insertBefore(lens, img);
  img2.parentElement.insertBefore(lens2, img2);
  /*calculez le ratio entre le résultat DIV and la lentille:*/
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  /*définissez les propriétés de fond pour le résultat DIV:*/

  result2.style.backgroundImage = "url('" + img2.src + "')"; 
  result2.style.backgroundSize = img2.width * cx + "px " + img2.height * cy + "px"

  result.style.backgroundImage = "url('" + img.src + "')"; //On met l'image source comme background 
  result.style.backgroundSize = img.width * cx + "px " + img.height * cy + "px";//On étire le background pour créer une illusion de zoom
 


  lens.param = {
    "image" :img,
    "resultat" :result,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomX": offsetZoomXlens,
    "offsetZoomY": offsetZoomYlens,
  
    "imageSlave" :img2,
    "resultatSlave" :result2,
    "offsetZoomXSlave": offsetZoomXlens2,
    "offsetZoomYSlave": offsetZoomYlens2,
    "lensSlave":lens2,
  }

  lens2.param = {
    "image" :img2,
    "resultat" :result2,
    "cx" :cx,
    "cy" :cy,
    "offsetZoomX": offsetZoomXlens2,
    "offsetZoomY": offsetZoomYlens2,
  }

  //result.style.backgroundSize = img.naturalWidth/scale+'px ' +  img.naturalHeight/scale+'px'
  /*Exécutez une fonction lorsque quelqu’un déplace le curseur sur l’image ou sur la lentille:*/
  lens.addEventListener("mousemove", moveLenSync);
  img.addEventListener("mousemove", moveLenSync);

  // lens2.addEventListener("mousemove", moveLens);
  // img2.addEventListener("mousemove", moveLens);

  lens.setAttribute("frozen", true)
  lens2.setAttribute("frozen", true)

  lens.addEventListener('click', (e)=>{
    lens.frozen = !lens.frozen;
    lens2.frozen = !lens2.frozen;
  });
  lens2.addEventListener('click', (e)=>{
    lens2.frozen = !lens2.frozen;
    lens.frozen = !lens.frozen;
  });

}
  
function zoomWheel(e){
  
  e.preventDefault();

  if (!e.target.frozen){
      
    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]

    scale += e.deltaY * -0.0005;
    
    scale = Math.min(Math.max(.125,scale),4);
    this.style.transform = `scale(${scale})`;
    this.scale = scale
    result.style.backgroundSize = img.width * (cx/scale) + "px " + img.height * (cy/scale) + "px";
    

    e.target.param["offsetZoomX"] = -(lens.offsetWidth-(lens.offsetWidth*(scale)))/2
    e.target.param["offsetZoomY"] = -(lens.offsetHeight-(lens.offsetHeight*(scale)))/2

    // offsetZoomXlens = -(lens.offsetWidth-(lens.offsetWidth*(scale)))/2
    // offsetZoomYlens = -(lens.offsetHeight-(lens.offsetHeight*(scale)))/2
    moveLens(e)
    //console.log(offsetZoomX)
  }
}

function zoomWheelSync(e){

  e.preventDefault();

  if (!e.target.frozen){
      
    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]

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
    

    e.target.param["offsetZoomX"] = -(lens.offsetWidth-(lens.offsetWidth*(scale)))/2
    e.target.param["offsetZoomY"] = -(lens.offsetHeight-(lens.offsetHeight*(scale)))/2

    e.target.param["offsetZoomXSlave"] = -(lens2.offsetWidth-(lens2.offsetWidth*(scale2)))/2
    e.target.param["offsetZoomYSlave"] = -(lens2.offsetHeight-(lens2.offsetHeight*(scale2)))/2

    // offsetZoomXlens = -(lens.offsetWidth-(lens.offsetWidth*(scale)))/2
    // offsetZoomYlens = -(lens.offsetHeight-(lens.offsetHeight*(scale)))/2
    moveLenSync(e)
    
    //console.log(offsetZoomX)
  }
}

function getCursorPos(e) {
  var a,
    x = 0,
    y = 0;
  e = e || window.event;
  /*obtenez les positions x et y de l’image:*/
  
  a = e.target.param["image"].getBoundingClientRect();
  
  /*calculez les coordonnées x et y du curseur par rapport à l’image:*/
  x = e.pageX - a.left;
  y = e.pageY - a.top;
  /*considérez tout défilement de page:*/
  x = x - window.pageXOffset;
  y = y - window.pageYOffset;
  return { x: x, y: y };
}

function moveLenSync(e){
  if (e.target.className === "img-zoom-lens"){

    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]
    offsetZoomXlens = e.target.param["offsetZoomX"] 
    offsetZoomYlens = e.target.param["offsetZoomY"]

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

function moveLens(e) {

  if (e.target.className === "img-zoom-lens"){

    scale = e.target.scale
    result = e.target.param["resultat"]
    cx = e.target.param["cx"]
    cy = e.target.param["cy"]
    lens = e.target
    img = e.target.param["image"]
    offsetZoomXlens = e.target.param["offsetZoomX"] 
    offsetZoomYlens = e.target.param["offsetZoomY"]

    /*empêchez toute autre action pouvant se produire pendant le déplacement sur l’image:*/
    e.preventDefault();

    /*obtenez les positions x et y du curseur:*/
    let pos = getCursorPos(e);
    /*calculez la position de la lentille :*/
    let x = pos.x - (lens.offsetWidth) / 2;
    let y = pos.y - (lens.offsetHeight) / 2;

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


    if (!e.target.frozen){

      /*mettez la position de la lentille:*/
      lens.style.left = x + "px";
      lens.style.top = y + "px";
      /*affichez ce que la lentille “voit”":*/
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



// imageZoomSync("myimage", "myresult","myimage2","myresult2");

const async = document.createElement("button")
const sync = document.createElement("button")
const DL = document.createElement("button")

async.innerHTML = "Async"
sync.innerHTML = "Sync"
DL.innerHTML = "Download"

document.body.appendChild(async)
document.body.appendChild(sync)
document.body.appendChild(DL)

async.onclick =function(){
  if (document.contains(document.getElementById("mylens"))){
  document.getElementById("mylens").remove()
  document.getElementById("mylens2").remove()
  }
  imageZoomAsync()
};

sync.onclick =function(){
  if (document.contains(document.getElementById("mylens"))){
  document.getElementById("mylens").remove()
  document.getElementById("mylens2").remove()
  }
  imageZoomSync()
};

function dl(){
  html2canvas(document.getElementById("myresult"),{ letterRendering: 1, allowTaint : true}).then(canvas => {
    document.getElementById("container-container").appendChild(canvas)
    canvas.id = "canvasDL"
  });
  var image = document.getElementById("canvasDL").toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href=image;
};

// function dl(){
//   html2canvas(document.getElementById("myresult"), {
//     onrendered: function (canvas) {
//     document.getElementById("myresult").appendChild(canvas);
//     var data = canvas.toDataURL('image/png');
//     //display 64bit imag
//     var imagey = new Image();
//     imagey.src = data;
//     document.getElementById("myresult").appendChild(imagey);
//     }
//   }
//   )
// };

// let canv = null;

// function dl(){
//   html2canvas(document.getElementById("myresult"),{ letterRendering: 1, allowTaint : true}).then(canvas =>{
//     canv = canvas
//   })
//   var image = canv.toDataURL("image/png").replace("image/png", "image/octet-stream");
//   window.location.href=image;
// };





DL.onclick = dl
