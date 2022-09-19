function benchSetUp(bench1, dropRegion1){

  const bench = document.getElementById(bench1)
  const dropRegion = document.getElementById(dropRegion1)

  // open file selector when clicked on the drop region
  var fakeInput = document.createElement("input");
  fakeInput.type = "file";
  fakeInput.accept = "image/*";
  fakeInput.multiple = true;
  dropRegion.addEventListener('click', function(e) {
    if (e.target.className == "bench" )
    fakeInput.click();
  });

  fakeInput.addEventListener("change", function() {
    var files = fakeInput.files;
    handleFiles(files);
  });

  function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
  dropRegion.addEventListener('dragenter', preventDefault, false)
  dropRegion.addEventListener('dragleave', preventDefault, false)
  dropRegion.addEventListener('dragover', preventDefault, false)
  dropRegion.addEventListener('drop', preventDefault, false)

  function handleDrop(e) {
      var dt = e.dataTransfer
      // Get files
      var files = dt.files;
    
      if (files.length) {
        handleFiles(files);
      } 
      else {
        // If another HTML Image Element is dragged in the result div, we get directly the js tag <img src.....>
        var html = dt.getData('text/html')
        // Extract the part after 'src='
        var match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html)
        var url = match && match[1];

        if (url) {
          uploadImageFromURL(url);
          return;
        } 
      }
    
    
      function uploadImageFromURL(url) {
        var img = new Image();
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");
    
        img.onload = function() {
          c.width = this.naturalWidth; // update canvas size to match image
          c.height = this.naturalHeight;
          ctx.drawImage(this, 0, 0); // draw in image
          c.toBlob(function(blob) { // get content as PNG blob
    
            // call our main function
            handleFiles([blob]);
    
          }, "image/png");
        };
        img.onerror = function() {
          alert("Error in uploading");
        }
        img.crossOrigin = ""; // if from different origin
        img.src = url;
      }
    }
    
    dropRegion.addEventListener('drop', handleDrop, false);

    // Checks files and proceeds to preview + upload
    function handleFiles(files) {
      for (var i = 0, len = files.length; i < len; i++) {
        if (validateImage(files[i]))
          previewAnduploadImage(files[i]);
      }
    }

    function validateImage(image) {
      // check the type
      var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (validTypes.indexOf(image.type) === -1) {
        alert("Invalid File Type");
        return false;
      }



    // check the size
    var maxSizeInBytes = 10e6; // 10MB
    if (image.size > maxSizeInBytes) {
      alert("File too large");
      return false;
    }
    return true;
  }

  function previewAnduploadImage(image) {
    // container
    var imgView = document.createElement("div");
    imgView.className = "image-view";
    bench.appendChild(imgView);
    // previewing image
    var img = document.createElement("img");
    imgView.appendChild(img);
    // progress overlay
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    imgView.appendChild(overlay);

    var deleteClick = document.createElement("div")
    deleteClick.className = "deleteClick"
    overlay.appendChild(deleteClick);

    imgView.onclick = function(e){
      if (e.target.className == "deleteClick")
      this.remove()
      else{

        if(this.parentNode.id == "bench"){

          let mycanvas = document.createElement("canvas");
          mycanvas.id = "mycanvas1";
          let mycanvas2 = document.createElement("canvas");
          mycanvas2.id = "mycanvas2";
          document.getElementById("mycanvas1").replaceWith(mycanvas)
          document.getElementById("mycanvas2").replaceWith(mycanvas2)

          var temp = this.children[0].src 
          this.children[0].src = document.getElementById("myimage1").src
          document.getElementById("myimage1").src = temp
          createUiCanvSwitch("myimage1","myresult1","mycanvas1","myimage2", "myresult2","mycanvas2" ,"setId2")
          
        }
        
        if(this.parentNode.id == "bench2"){

          let mycanvas = document.createElement("canvas");
          mycanvas.id = "mycanvas1";
          let mycanvas2 = document.createElement("canvas");
          mycanvas2.id = "mycanvas2";
          document.getElementById("mycanvas1").replaceWith(mycanvas)
          document.getElementById("mycanvas2").replaceWith(mycanvas2)

          var temp = this.children[0].src 
          this.children[0].src = document.getElementById("myimage2").src
          document.getElementById("myimage2").src = temp
          createUiCanvSwitch("myimage1","myresult1","mycanvas1","myimage2", "myresult2","mycanvas2" ,"setId2")
          
        }
  
      }
    }

    // read the image...
    var reader = new FileReader();
    reader.onload = function(e) {
      img.src = e.target.result;
    }
    reader.readAsDataURL(image);

  }
}