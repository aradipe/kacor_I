'use strict';

var gFps = 60;
var gLevels=[L0,L1];

class GameCtx {
    constructor(){
        this.player;
        this.canvas = document.getElementById("gamearea");
        this.ctx = this.canvas.getContext('2d');

        this.levels;
        this.activeLevel;
        this.levelIdx; // set this to the same level for restart

        this.actors=[];
        this.frameCnt = 0;
        this.onEnded=function(l){};
        this.fadeout=0;
        this.fadeoutOpacity=0.2;
        this.noMusic=true;
        this.doUpdate=false;
    }


    reset() {
        this.frameCnt=0;
        this.fadeout=0;
        this.fadeoutOpacity=0.2;
        this.activeLevel=undefined;
        this.noMusic=true;
        this.actors=[];
        this.canvas.removeEventListener("click", this.setDoUpdate.bind(this, true));
        if (this.player) {

        }
    }

    setDoUpdate(val) {
        this.doUpdate=val;
    }

    keyDown( key ) {
        if (this.doUpdate==false) {
            setDoUpdate(true);
        }
        if (this.player) {
            this.player.pressed(key.keyCode);
        }
    }

    keyUp( key ) {
        if (this.player) {
            this.player.released(key.keyCode);
        }
    }

    // returns when level ended
    startLevel(i){
        this.levelIdx=i;
        let l=this.levels[i];
        this.activeLevel=l;
//        this.ctx.fillStyle = "rgba(255,255,255,255)";
        l.ended=this.onLevelEnded.bind(this,l);
        l.setGctx(this);
//        l.ended();
        let ctx=this.ctx;
        let canvas=this.canvas;
        let frameCnt=this.frameCnt;
        let doUpdate=false;
        let fadeout=this.fadeout;

        canvas.addEventListener("click", this.setDoUpdate.bind(this, true));

        console.log("starting level");

        let fadeoutOpacity=0.2;
        let fadeOutComplete=this.fadeOutComplete.bind(this);

        if(l.hero) {
            this.player=l.hero;
            window.addEventListener("keydown", this.keyDown.bind(this), true);
            window.addEventListener("keyup", this.keyUp.bind(this), true);
        }
        // the main game loop
        // responsible for update and render
        /*
        function gameLoop(currentTime){
            if (frameCnt < 60) {
                let opacity=frameCnt%60;
                ctx.fillStyle=`rgba(255,255,255,${opacity})`;
                ctx.fillRect(0,0,canvas.width, canvas.height);
            }

            //if (!this.activeLevel) { return; } // level ended
            if(doUpdate){
                console.log("updating level");
                l.update(currentTime);
            }
            //console.log("rendering level");
            l.draw(ctx, true);

            if (fadeout)
            {
                ctx.fillStyle=`rgba(255,255,255,${fadeoutOpacity})`;
                ctx.fillRect(0,0,canvas.width, canvas.height);
                fadeoutOpacity*=1.2;
                if(l.bg_music) {
                    l.bg_music.volume*=0.85;
                }
                if(fadeoutOpacity >= 1) {
                    if(l.bg_music && l.bg_music >=0.2) { }
                    else {
                        fadeOutComplete();
                        return;
                    }
                }
            }

            frameCnt++;
            window.requestAnimationFrame(gameLoop);
        }*/
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    // the main game loop
    // responsible for update and render
    gameLoop(currentTime){
        if (this.frameCnt < 60) {
            let opacity=this.frameCnt%60;
            this.ctx.fillStyle=`rgba(255,255,255,${opacity})`;
            this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        }

        //if (!this.activeLevel) { return; } // level ended
        if(this.doUpdate){
            console.log("updating level");
            if(this.noMusic) {
                if(this.activeLevel.bg_music){
                        this.activeLevel.bg_music.play();
                }
                //@todo check .loop works! this.noMusic=false;
            }
            this.activeLevel.update(currentTime);
            if (this.player) {
            this.player.update(currentTime);
            }
        }
        //console.log("rendering level");
        this.activeLevel.draw(this.ctx, true);
        if (this.player) { this.player.draw(this.ctx);}

        if (this.fadeout)
        {
            this.ctx.fillStyle=`rgba(255,255,255,${this.fadeoutOpacity})`;
            //this.ctx.fillStyle="rgba(255,255,255,0.2)";
            this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
            this.fadeoutOpacity*=1.2;
            if(this.activeLevel.bg_music) {
                this.activeLevel.bg_music.volume*=0.80;
            }
            if(this.fadeoutOpacity >= 1) {
                if(this.activeLevel.bg_music) {
                    if (this.activeLevel.bg_music.volume >=0.2) { }
                    else {this.activeLevel.bg_music.pause();}
                    }
                }
                else {
                    this.fadeOutComplete();
                    return;
                }
        }

        this.frameCnt++;
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }



    // called by level
    onLevelEnded(l) {
        console.log("level ended");
        this.fadeout=1; // call requestAnimationFrame in a loop until dark
    }

    fadeOutComplete() {
        let i = this.levelIdx;
        if(this.activeLevel.completed) {
            i++;
        } // else we restart the same level
        this.reset();
        this.startLevel(i);
    }

    timeSec() { //@todo don't think I need this
        return round(this.frameCnt / gFps, 5);
    }
}

var onLoad = function (){
    console.log("game loaded");
    mobileFullscreen();
    let gameCtx = new GameCtx();
    gameCtx.levels=gLevels;
    gameCtx.startLevel(0);


//    let x=L1.startPosPx()[0];
//    let y=L1.startPosPx()[1];

//    window.addEventListener("keydown", keydown, true);
//    window.addEventListener("keyup", keyup, true);
//    window.requestAnimationFrame(gameLoop);
}


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

function loop(currentTime) {

    let delta = currentTime - lastTime;

	clearCanvas("rgb(20,20,0)");

    render();

	update(delta);
//	overlays();

    lastTime = currentTime;
	//frameCnt++;
    window.requestAnimationFrame(loop);
}
