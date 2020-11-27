'use strict';

var lastTime = 0;
var fps = 60;
var frametimeMs = 1000 / fps;

var actors = [];
var a;

var context;

class Actor{
    constructor(name, width, height, x, y){
        this.height = height;
        this.width = width;
        this.x = x;
        this.y = y;
        this.dx = 0.0;
        this.dy = 0.0;
        var canvas = document.getElementById("gamearea");
        var ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.ctx = ctx;
		this.name = name;
		this.noOfFrames = 3;
		this.imgFrames = loadMoveAnim(name, 3);
		this.animFrame = 0;
		this.animFrameDelta = 1;
		this.animFrameDiff = 0;
		this.state='idle';
		this.frameLength = 5;
		this.friction = 0.92;
        this.no_keys=0;
        this.isPressed={};

		//this.img = loadImg("../../assets/img/pavement_test.png");
    }

	pressed(keyCode){
		console.log(keyCode);
        this.isPressed[keyCode]=true;
		//this.dx=clampMe(this.dx,step,modifier*3);
	}
    released(keyCode){
        this.isPressed[keyCode]=false;
		//this.dx=clampMe(this.dx,step,modifier*3);
	}

    draw(){
        // this controls the speed of the run / idle animations
		var fdelta = Math.abs(this.dx) > 0.8 ? 2: this.state=='idle' ? 0.1 : 1.6;
		this.animFrameDiff+=fdelta;
		if(this.animFrameDiff >= this.frameLength){
			this.animFrameDiff = 0;
			this.animFrame+=this.animFrameDelta;
		}

		var flip = false;
		if(this.dx <0){ flip = true;}
        this.ctx.save();
        this.ctx.shadowColor = "rgba(100,100,100,0.5)";
        this.ctx.shadowOffsetX  = flip ? 8 : -8;
		drawImage(this.ctx, this.imgFrames[this.state][this.animFrame], this.x, this.y, this.width, this.height, 0, flip, false, true);
		this.ctx.restore();
		this.animFrame == this.noOfFrames-1? this.animFrameDelta = -1 : (this.animFrame == 0 ? this.animFrameDelta =1 : ()=>{});
    }

    update(){
        var xModifier = 0.3;
        var yModifier = 0.5;
        if (this.isPressed[37]) {
            this.dx-=xModifier;
        }
        if (this.isPressed[39]) {
            this.dx+=xModifier;
        }
        if (this.isPressed[38]) {
            this.dy-=yModifier;
        }
        if (this.isPressed[40]) {
            this.dy+=yModifier;
        }

        // stop around edge of canvas
        if(this.x<20 && this.dx<0|| this.x>=this.canvas.width-20 && this.dx>0) {
            this.dx=0;
        }
        if(this.y<20 && this.dy<0|| this.y>=this.canvas.height-20 && this.dy>0){
            this.dy=0;
        }

        this.dx*=this.friction;
        this.dy*=this.friction;

        this.x+=this.dx;
        this.y+=this.dy;
        if(this.dx>0.3 || this.dx <-0.3 ||
           this.dy>0.3 || this.dy <-0.3){
            this.state='running';
        } else {this.state='idle';}
    }
}

var onLoad = function (){
    let canvas = document.getElementById("gamearea");
    context = canvas.getContext('2d');
    mobileFullscreen();
    let x=L1.startPosPx()[0];
    let y=L1.startPosPx()[1];
    a = new Actor('guy', 20, 40, x, y);
    actors.push(a);
    window.addEventListener("keydown", keydown, true);
    window.addEventListener("keyup", keyup, true);
    window.requestAnimationFrame(gameLoop);
}


function keydown(key)
{
	a.pressed(key.keyCode);
}
function keyup(key)
{
    a.released(key.keyCode);
}

L1.init();

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  onLoad();
} else {
  //document.addEventListener("DOMContentLoaded", onLoad);
  window.addEventListener("load", onLoad);
}

function render()
{
    L1.draw(context);
    for (var actor of actors)   {  actor.draw();  }
}

function update(delta)
{
    for (var actor of actors)
    {
        actor.update();
    }
}

function gameLoop(currentTime) {

    let delta = currentTime - lastTime;

	clearCanvas();

    render();

	update(delta);
//	overlays();

    lastTime = currentTime;
	//frameCnt++;
    window.requestAnimationFrame(gameLoop);
}
