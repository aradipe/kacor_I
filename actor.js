'use strict';
class Actor{
    constructor(name, width, height, x, y){
        this.height = height;
        this.width = width;
        this.x = x;
        this.y = y;
        this.dx = 0.0;
        this.dy = 0.0;

		this.name = name;
		this.noOfFrames = 3;
		this.imgFrames = loadMoveAnim(name, 3);
		this.animFrame = 0;
		this.animFrameDelta = 1;
		this.animFrameDiff = 0;
		this.state='idle';
		this.frameLength = 5;
		this.friction = 0.80;
        this.no_keys=0; // keys for doors
        this.isPressed={};  // keep track of which buttons are pressed
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

    draw(ctx){
        // this controls the speed of the run / idle animations
		var fdelta = Math.abs(this.dx) > 0.8 ? 2: this.state=='idle' ? 0.1 : 1.6;
		this.animFrameDiff+=fdelta;
		if(this.animFrameDiff >= this.frameLength){
			this.animFrameDiff = 0;
			this.animFrame+=this.animFrameDelta;
		}

		var flip = false;
		if(this.dx <0){ flip = true;}
        ctx.save();
        ctx.shadowColor = "rgba(100,100,100,0.5)";
        ctx.shadowOffsetX  = flip ? 8 : -8;
		drawImage(ctx, this.imgFrames[this.state][this.animFrame], this.x, this.y, this.width, this.height, 0, flip, false, true);
		ctx.restore();
		this.animFrame == this.noOfFrames-1? this.animFrameDelta = -1 : (this.animFrame == 0 ? this.animFrameDelta =1 : ()=>{});
    }

    update(xMax, yMax){
        var xModifier = 0.4;
        var yModifier = 0.4;
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
        if(this.x<20 && this.dx<0|| this.x>=xMax && this.dx>0) {
            this.dx=0;
        }
        if(this.y<20 && this.dy<0|| this.y>=yMax && this.dy>0){
            this.dy=0;
        }

        // interact with level objects, walls
        // get cell and position inside cell
        //let cellIdx = this.y/L1.cell
        //L1.interact(this.x, this)

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
