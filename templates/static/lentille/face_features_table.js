var numberFeature = 1;
var chosenCanvas = -1;
var chosenNumber = "-1";
var canvas = null;
var canvas2 = null;

function setUpDropOnFaceCanvas(){

  document.ondragover = function(event){
    event.preventDefault();
    if(event.target.id == 'mycanvas1'){
      chosenCanvas = 1;
    }
    else if(event.target.id == 'mycanvas2'){
      chosenCanvas = 2;
    }
    else{
      chosenCanvas = -1;
    }
  }
}


function addLineInTable(table,feature){
    var tr = document.createElement("tr");

    var tdNumber = document.createElement("td");
    var divNumber =  document.createElement("div");
    divNumber.innerHTML = numberFeature;
    divNumber.className = "numberClass";
    divNumber.draggable = true;
    tdNumber.appendChild(divNumber)
    tr.appendChild(tdNumber);

    var tdFeature = document.createElement("td");
    tdFeature.innerHTML = feature;
    tdFeature.className = "featureClass";
    tr.appendChild(tdFeature);


    var tdPresence = document.createElement("td");
    tdPresence.innerHTML = '<input type="checkbox" id ="'+feature+'PresenceId" class = "tickClass" >';
    tdPresence.className = "presenceClass";
    tr.appendChild(tdPresence);

    var tdAbsence = document.createElement("td");
    tdAbsence.innerHTML = '<input type="checkbox" id ="'+feature+'AbsenceId" class = "tickClass" >';
    tdAbsence.className = "absenceClass";
    tr.appendChild(tdAbsence);

    var tdComment = document.createElement("td");
    tdComment.innerHTML = '<textarea id="'+feature+'CommentId" rows="2" cols="20"></textarea>'
    tdComment.className = "commentClass";
    tr.appendChild(tdComment);

    var tdScreen = document.createElement("td");
    const screenBtn = document.createElement("button");
    screenBtn.innerText = "📷"
    screenBtn.className = "screenBtnClass";
    screenBtn.id = feature + "ScreenId"
    screenBtn.onclick = function(){
      screenBtn.className = "screenBtnClassClicked"
      screenBtn.imgleft = document.getElementById('mycanvas1').toDataURL()
      screenBtn.imgright = document.getElementById('mycanvas2').toDataURL()

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


      if (screenBtn.childElementCount==0){

        screenBtn.appendChild(imgHover2)
        screenBtn.appendChild(imgHover)

      }
      else{

        screenBtn.replaceChildren(imgHover,imgHover2)
        screenBtn.innerHTML = "📷"
        // screenBtn.firstChild.src = screenBtn.imgright
        // screenBtn.firstChild.src = screenBtn.imgleft
      }


      //Show or hide images
      screenBtn.onmousemove = function(){
        imgHover.style.visibility = "visible"
        imgHover2.style.visibility = "visible"
      }
      screenBtn.onmouseleave = function(){
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
    deleteButton.onclick = function(){
      tr.remove();
    }
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDelete);

    table.appendChild(tr);

    $('textarea').each(function () {
        this.setAttribute('style', 'height:' + 30 + 'px;overflow-y:hidden;');
      }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
      });



  numberFeature = numberFeature + 1
  
  divNumber.ondragend = function(event){
    event.preventDefault()

    chosenNumber = event.target.firstChild.nodeValue
    addMinutieToCanvas(event.clientX,event.clientY,chosenCanvas,chosenNumber,1)
  }

  var img = document.createElement("img");
  var size = 45;
  img.src = 'static/image/red-circle.png';
  img.width = size
  var div = document.createElement("div")
  div.appendChild(img)


  divNumber.addEventListener("dragstart", function(event){

      event.dataTransfer.setDragImage(div,size/2,size/2)
  
    },false)
}


