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
    tdComment.innerHTML = '<input type="text" id ="'+feature+'CommentId" class = "tickClass" >';
    tdComment.className = "commentClass";
    tr.appendChild(tdComment);

    table.appendChild(tr);
}

var table = document.getElementById("Table1");
addLineInTable(table,"Nose");
addLineInTable(table,"Eyes");
addLineInTable(table,"Mouth");
addLineInTable(table,"Cheek");
