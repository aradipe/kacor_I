'use strict';
// wall, floor and object are the types a cell can have
// types of wall: uw(upperwall), bw(bottomwall), lw(wall to left), rw(wall to the right)

// Level.cells is a list of pairs of type and instance
// for objects the second member is the obj instance

// all objects should have loadRes(), interact(pos, player, level) and draw(ctx, x, y) defined

// all levels should define handlers for additional objects and add them to level.tileToCell
// tileToCell is a dictionary where the key is the id from the layout and the value is a cb_
// the callback should accept (pos) and set level.cells[pos] to [type, object]

// levels should call setlayout() and init()

class LevelObject {
    constructor(name) {
        this.name=name;
        this.firstUpdateMs;
        this.loadRes();
    }

    loadRes() {
        try{
            this.img = loadImg(`assets/img/${this.name}_obj.png`);
            this.sound = new Audio(`assets/sounds/${this.name}_obj.wav`);
        } catch {
            console.error(`couldn't load all resources for obj ${this.name}`);
        }
    }

    draw(ctx, x, y) {
        try {
        //drawImage(this.ctx, this.imgFrames[this.state][this.animFrame], this.x, this.y, this.width, this.height, 0, flip, false, true);
            ctx.drawImage(this.img, x, y); }
        catch {}
    }

    interact(pos, player, level) { }

    update(timeMs){ }
}

class Door {
    constructor(name) {
        this.isOpen = false;
        this.name = name ? name : "door";
        this.loadRes();
    }

    interact(pos, player, level) {
        if (!this.isOpen){
            player.dx=0;
            player.dy=0;
            if (player.no_keys) {
                player.no_keys -= 1;
                this.isOpen = true;
                if (this.soundOpen) {
                    this.soundOpen.play();
                }
            }
        }
    }

    loadRes() {
        try{
            this.imgOpen = loadImg(`assets/img/${this.name}_open.png`);
            this.imgClosed = loadImg(`assets/img/${this.name}_closed.png`);
            this.soundOpen = new Audio(`assets/sounds/${this.name}_door.wav`);
        } catch {
            console.error(`couldn't load all resources for door ${this.name}`);
        }
    }

    update(timeMs){}

    draw(ctx, x, y){
        ctx.drawImage(this.isOpen ? this.imgOpen : this.imgClosed, x, y);
    };
}

class Message {
    constructor(startMs, durationMs, text){
        this.startMs=startMs;
        this.durationMs=durationMs;
        this.text=text;
        this.isActive=false;
    }
}

class MessageObject {
    constructor(font='48px serif', color='rgb(200,200,200)', bg='', x=100,y=400,msgs=[]){
        this.messages=msgs;
        this.font=font;
        this.color=color;
        this.bg=bg;
        this.activeMsg;
        this.firstUpdate=0;
        this.x=x;
        this.y=y;
    }

    loadRes() {}

    interact(pos, player, level) { }

    update(timeMs){
        if(this.firstUpdate==0) {this.firstUpdate=timeMs;}
        timeMs-=this.firstUpdate;
        for (let m of this.messages) {
            if (m == this.activeMsg && timeMs > m.startMs+m.durationMs) {
                console.log(`message expired at ${timeMs}: ${m.text}`);
                //change state
                this.onExpired(m);
                this.activeMsg=undefined;
            }
            if (!this.activeMsg && timeMs > m.startMs&& timeMs < m.startMs+m.durationMs) {
                console.log(`message activated at ${timeMs}: ${m.text}`);
                this.activeMsg=m;
                this.onShowMsg(m);
            }
        }
    }

    draw(ctx,x,y){
        if (!this.activeMsg) { return; }
        if (!this.x) { this.x=x; } ///@todo not nice
        if (!this.y) { this.y=y; } ///@todo not nice

        ctx.save();
        ctx.font = this.font;

        let textDim=ctx.measureText(this.activeMsg.text);

        ctx.fillStyle = "rgba(20,20,20,0.5)";
        ctx.fillRect(this.x-20, this.y-45, textDim.width+40, 60);
        ctx.fillStyle = this.color;
        ctx.fillText(this.activeMsg.text, this.x, this.y);
        ctx.restore();
    }

    onExpired(m){}
    onShowMsg(m){}
}

class End extends LevelObject {
    constructor(name) {
        super(name);
        this.endAtMs;
        this.done=false;
    }

    interact(pos, player, level) {
        level.completed = true;
    }

    update(timeMs) {
        if (this.firstUpdate == undefined)
        {
            this.firstUpdate = timeMs;
        }

        if(!this.done && this.endAtMs) {
            if (this.endAtMs+this.firstUpdate < timeMs){
                this.done=true;
                this.onEnd();
            }
        }
    }

    onEnd() {}
}

class Background {
    constructor(bg, style, w, h) {
        this.bg=bg;
        this.style=style;
        this.drawn=false;
        this.img;
        this.w=w;
        this.h=h;
        this.loadRes();
    }

    loadRes() {
        try {
            if (this.bg.startsWith('rgb') == false && this.bg.startsWith('#') == false) {
                this.bg = loadImg(this.bg);
            }
        } catch {
            console.error(`couldn't load bg ${this.bg}`);
        }
    }

    draw(ctx,x,y) {
        if (typeof this.bg=="string")
        {
            ctx.fillStyle = this.bg;
            ctx.fillRect(0,0,ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        } else {
            //ctx.drawImage(this.bg, 0, 0,ctx.canvas.clientWidth, ctx.canvas.clientHeight);
            ctx.drawImage(this.bg, 0, 0, this.w, this.h);
        }
        this.drawn=true;
    }
}

class Level {
    constructor(widthTiles, heightTiles, cellsize, name, background, bg_music) {
        this.w=widthTiles;
        this.h=heightTiles;
        this.cellsize_px=cellsize;
        this.name=name;

        this.background=background;
        this.bg_music=bg_music;
        this.gctx;

        this.layout="";
        this.hero=undefined;
        this.cells=[];
        this.objects=[];
        this.guards=[];
        this.start=0;
        this.tileToCell={};
        this.wallImgs={};
        this.floorImgs=[];
        this.floorCnt=0;

        this.completed=false;
    }

    // level instances should add additional objects to tileToCell and call this
    init() {
        this.tileToCell['-']=()=>{}; //noop
        this.tileToCell['I']=this.parseWall.bind(this);
        this.tileToCell[' ']=this.parseFloor.bind(this);
        this.tileToCell['d']=this.parseDoor.bind(this);
        this.tileToCell['m']=this.parseMessage.bind(this);
        this.tileToCell['E']=this.parseEnd.bind(this);
        this.tileToCell['s']=this.setStart.bind(this);
        this.initWalls(this.name);
        this.initFloor(this.name);
        this.parseLayout();
        this.background=new Background(this.background);
        this.bg_music=new Audio(this.bg_music);
    }

    onEnd() {
        this.ended(this);
    }

    //overwrite this from gamectx
    ended() {
    }

    initWalls(name) {
        // there are 4 types of walls
        try{
            this.wallImgs['lw'] = loadImg(`assets/img/${this.name}_lw.png`);
            this.wallImgs['rw'] = loadImg(`assets/img/${this.name}_rw.png`);
            this.wallImgs['uw'] = loadImg(`assets/img/${this.name}_uw.png`);
            this.wallImgs['bw'] = loadImg(`assets/img/${this.name}_bw.png`);
        } catch {
            console.error(`couldn't load all resources for walls of ${this.name}`);
        }
    }

    initFloor(name) {
        // there
        try{
            this.floorImgs.push(loadImg(`assets/img/${this.name}_floor.png`));
            this.floorImgs.push(loadImg(`assets/img/${this.name}_floor2.png`));
        } catch {
            console.error(`couldn't load all resources for floors of ${this.name}`);
        }
    }

    drawFloor(ctx, x, y) {
        try {
            ctx.drawImage(this.floorImgs[this.floorCnt], x, y);
            this.floorCnt ^= 1;
        } catch {
            console.error(`couldn't draw floors of ${this.name}`);
        }
    }

    drawWall(ctx, x, y, type) {
        ctx.drawImage(this.wallImgs[type], x, y);
    }

    setStart(pos) {
        this.start = pos;
    }

    setGctx(gctx) {
        this.gctx = gctx;
        this.background.w = gctx.canvas.width;
        this.background.h = gctx.canvas.height;
        this.ended=gctx.onLevelEnded.bind(gctx,this);
    }

    parseWall(pos) {
        let type='';
        // neighbor cells
        let un = pos<this.w ? '-' : this.layout[pos-this.w];
        let bn = pos>=this.w*(this.y-1) ? '-' : this.layout[pos+this.w];
        let ln = pos%this.w ? this.layout[pos-1] : '-';
        let rn = pos%this.w == this.w-1 ? '-' : this.layout[pos+1];

        if (bn!='I' && bn!='-') {
            type='uw';
        } else if (un!='I' && un!='-') {
            type='bw';
        } else if (ln!='I' && ln !='-') {
            type='rw';
        } else if (rn!='I' && rn !='-') {
            type='lw';
        } else {
            // not visible don't draw anything
            return;
        }

        this.cells[pos] = [type, undefined];
    }

    parseFloor(pos) {
        this.cells[pos] = ['f', undefined];
    }

    parseDoor(pos) {
        let d = new Door();
        this.cells[pos] = ['d', d];
        this.objects.push(d);
    }

//@todo create End object with default update: activate on hero interaction
    parseEnd(pos) {
        let e = new End(this.name);
        e.onEnd=this.onEnd.bind(this);
        this.cells[pos] = ['E', e];
        this.objects.push(e);
    }

//@todo create message object with default update: activate on hero interaction
//should call ctx showMessage(x,y,message)
// that should disable input while the message is showing
    parseMessage(pos) {
        let m = new MessageObject();
        this.cells[pos] = ['m', m];
        this.objects.push(m);
    }

    setLayout(layout) {
        if (layout.length != this.w*this.h) {
            console.log(layout.slice(0,32));
            console.error(`layout is ${layout.length} tiles not ${this.w}*${this.h}`);
        }
        this.layout = layout;
    }

    parseLayout() {
        let i=0;
        for (let cell of this.layout) {
            try {
                this.tileToCell[cell](i);
            } catch {
                console.error(`unknown cell type ${cell} at ${i}. adding anyway`);
                this.cells[i] = [cell,undefined];
            }
            ++i;
        }
    }

    update(timeMs) {
        for (let o of this.objects) {
            o.update(timeMs);
        }
    }

//todo could handle drawImage in gamectx, only set state dirty if needed
// gamectx could draw:
// 1. all walls and floors
// 2. objects
// 3. then all actors
// 4. overlays
// 5. text
// only draw what changed
// in this case we don't need draw in level.js only update()
    draw(ctx, force) {
        if (!this.background.drawn || force) { this.background.draw(ctx); } // re-draw background
        //iterate over cells and set x, y accordingly
        //x, y is top left of image by default
        this.floorCnt = 0;
        let x=0, y=0;
        for (let cell of this.cells) {
            if (x>=this.w) {
                x=0;
                y+=1;
            }

            let x_px=x * this.cellsize_px, y_px=y * this.cellsize_px;

            if (cell && cell[1]) {
                //it's an object or door etc
                //draw floor first
                this.drawFloor(ctx, x_px, y_px);
                cell[1].draw(ctx, x_px, y_px);
            } else if (cell && cell[0]) {
                switch (cell[0]) {
                    case 'f':
                        this.drawFloor(ctx, x_px, y_px);
                        break;
                    case 'uw':
                    case 'bw':
                    case 'lw':
                    case 'rw':
                        this.drawWall(ctx, x_px, y_px, cell[0]);
                        break;
                }
            }
            x++;
        }
    }

    startPosPx() {
        return [this.start%this.w*this.cellsize_px, Math.floor(this.start/this.w)*this.cellsize_px];
    }
//    getObjects() {
        //return this.objects;
    //}
    guards() {
        return this.guards;
    }
    hero() {
        return this.hero;
    }
    cells() {
        return this.cells;
    }
    cell(i) {
        return this.cells[i];
    }

    // interact with cell
    interact(i, player) {
        if (this.cells[i]){
            switch (this.cells[i][0]) {
                case 'lw':
                case 'rw':
                    player.dx=0;
                    break;
                case 'bw':
                case 'uw':
                    player.dy=0;
                    break;
                default:
                    if (this.cells[i][2]){
                        //we have an object
                        this.cells[i][2].interact(i, player, this);
                    } else {
                        console.error(`no object defined in level.cells for ${this.cells[i]} at cell ${i}`);
                    }
                    break;
            }
        }
    }
}
