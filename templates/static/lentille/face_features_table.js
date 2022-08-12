function addLineInTable(table,feature){
    var tr = document.createElement("tr");

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
}

// var table = document.getElementById("Table1");
// addLineInTable(table,"Nose");
// addLineInTable(table,"Eyes");
// addLineInTable(table,"Mouth");
// addLineInTable(table,"Cheek");

// var divTable = document.getElementById("table");
// var slideBtn = document.createElement("button");
// slideBtn.innerHTML = "►";
// divTable.appendChild(slideBtn);

// $(slideBtn).click(function(){
//     $("#tableSolo").slideToggle(500);
// });

