const canvas = document.getElementById("draw-region")
const context = canvas.getContext("2d")
const button = document.getElementById("btnArrow")

//[x1, y1, x2, y2, scale, color]

lines = []

function createArrowBody(x1, y1, x2, y2, scale, color, ctx){

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = scale;

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

  var angle = Math.atan((y2-y1)/(x2-x1))
  angle += ((x2 >= x1)?90:-90)*Math.PI/180; 

  createArrowHead(x2, y2, angle, scale, ctx)

}

function createArrowHead(x2, y2, angleRadian, scale, ctx){

  ctx.save();
  ctx.beginPath();
  // Changes the origin of the context temporarily
  ctx.translate(x2,y2);
  ctx.rotate(angleRadian);
  ctx.moveTo(0,-2*scale);
  ctx.lineTo(2*scale,5*scale);
  ctx.lineTo(-2*scale,5*scale);
  ctx.closePath();
  ctx.restore();
  ctx.fill();

}

function loadBothClicks(canvas, scale, color, ctx, arrows){
  var firstClick = null;
  var secondClick = null;

  var done = false;

  function clickTwice(e){
    if (!done){
      if (firstClick === null){
        firstClick = [e.clientX - e.target.getBoundingClientRect().left, e.clientY - e.target.getBoundingClientRect().top]
      }
      else if (secondClick === null){
        secondClick = [e.clientX - e.target.getBoundingClientRect().left, e.clientY - e.target.getBoundingClientRect().top]
        createArrowBody(firstClick[0], firstClick[1], secondClick[0], secondClick[1], scale, color, ctx)
        arrows.push([...firstClick,...secondClick])
        firstClick = null;
        secondClick = null;
        done = true;

      }
    }
  }

  canvas.onclick = function handler(e){
    clickTwice(e);
  }
  button.onclick = function(){ 
    done = false
    console.log(done)
  }

}

loadBothClicks(canvas,5,"blue", context, lines)


