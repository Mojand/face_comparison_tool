var lang = null

fetch("static/lang.json")
.then(response => response.json())
.then(function(json){
    
    document.getElementById("PageTitle").innerText =json["PageTitle"]
    document.getElementById("BannerTitle").innerText =json["BannerTitle"]
    document.getElementById("FormTitle").innerText =json["FormTitle"]
    document.getElementById("SelectFunctionality").innerText =json["SelectFunctionality"]
    document.getElementById("ImageModification").innerText =json["ImageModification"]
    document.getElementById("ImageComparison").innerText =json["ImageComparison"]
    document.getElementById("Drop1").innerText =json["Drop1"]
    document.getElementById("Path1").innerText =json["Path1"]
    document.getElementById("Zoom1").innerText =json["Zoom1"]
    document.getElementById("ChooseAmongAll").innerText =json["ChooseAmongAll"]
    document.getElementById("NormalizeFormat").innerText =json["NormalizeFormat"]
    document.getElementById("Drop2").innerText =json["Drop2"]
    document.getElementById("Drop3").innerText =json["Drop3"]
    document.getElementById("Path2").innerText =json["Path2"]
    document.getElementById("Path3").innerText =json["Path3"]
    document.getElementById("File").innerText = json["File1"] 
    document.getElementById("File2").innerText = json["File2"] 
    document.getElementById("File3").innerText = json["File3"] 

    }
)
 