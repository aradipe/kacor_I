'use strict';
var assetCnt = 0;
var frameCnt = 0;

/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
var EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  easeInCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  easeInQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

function remainderWithPrec(number, decimals) {
    return (number-Math.floor(number)).toFixed(decimals);
}

function clampMe(number, min, max){
	if (max<min)
	{
		min = max + (max=min, 0);
	}
	return number < max ? (number > min ? number : min) : max;
}

function loadImg(path){
	assetCnt++;
	const img = new Image();
	img.onload = ()=> { assetCnt--; console.log(`loaded ${path}`) };
	img.src = path;
	return img;
}

function mobileFullscreen()
{
	var canvas = document.getElementById("gamearea");
    //const isMobileDevice = window.navigator.userAgent.toLowerCase().includes("mobi");
    if (1 )//|| isMobileDevice)
    {
        function launchIntoFullscreen(element) {
        if(element.requestFullscreen) {
              element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
              element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
        canvas.addEventListener("click", function() {
        launchIntoFullscreen(canvas);}
        );
    }
}

function clearCanvas()
{
	var canvas = document.getElementById("gamearea");
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawImage(context, img, x, y, width, height, deg, flip, flop, center) {

    context.save();
    if(typeof width === "undefined") width = img.width;
    if(typeof height === "undefined") height = img.height;
    if(typeof center === "undefined") center = false;

    // Set rotation point to center of image, instead of top/left
    if(center) {
        x -= width/2;
        y -= height/2;
    }

    // Set the origin to the center of the image
    context.translate(x + width/2, y + height/2);

    // Rotate the canvas around the origin
    if (deg) {
        let rad = 2 * Math.PI - deg * Math.PI / 180;
        context.rotate(rad);
    }

    let flipScale = 1, flopScale = 1;

    // Flip/flop the canvas
    if(flip) flipScale = -1;
    if(flop) flopScale = -1;

    if(flipScale == -1 || flopScale == -1) {
        context.scale(flipScale, flopScale);
    }

    // Draw the image
    context.drawImage(img, -width/2, -height/2, width, height);

    context.restore();
}

function loadMoveAnim(name, no_of_frames)
{
		var animFrames = new Object();
		animFrames.running=[];
		animFrames.idle=[];
		//animFrames.idle.push(loadImg(`../../assets/img/${name}.png`));
		for (var i=1; i<no_of_frames+1; i++){
			animFrames.idle.push(loadImg(`assets/img/${name}_s${i}.png`));
		}
		for (var i=1; i<no_of_frames+1; i++){
			animFrames.running.push(loadImg(`assets/img/${name}_m${i}.png`));
		}
		return animFrames;
}
