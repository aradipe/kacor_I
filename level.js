
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
        //drawImage(this.ctx, this.imgFrames[this.state][this.animFrame], this.x, this.y, this.width, this.height, 0, flip, false, true);
        ctx.drawImage(this.img, x, y);
    }

    interact(pos, player, level) {

    }
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

    draw(ctx, x, y){
        ctx.drawImage(this.isOpen ? this.imgOpen : this.imgClosed, x, y);
    };
}

class Level {
    constructor(widthTiles, heightTiles, cellsize, name) {
        this.w=widthTiles;
        this.h=heightTiles;
        this.cellsize_px=cellsize;
        this.name=name;

        this.layout="";
        this.cells=[];
        this.objects=[];
        this.guards=[];
        this.start=0;
        this.tileToCell={};
        this.wallImgs={};
        this.floorImgs=[];
        this.floorCnt=0;
    }

    // level instances should add additional objects to tileToCell and call this
    init() {
        this.tileToCell['-']=()=>{}; //noop
        this.tileToCell['I']=this.parseWall.bind(this);
        this.tileToCell[' ']=this.parseFloor.bind(this);
        this.tileToCell['d']=this.parseDoor.bind(this);
        this.tileToCell['s']=this.setStart.bind(this);
        this.initWalls(this.name);
        this.initFloor(this.name);
        this.parseLayout();
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
        ctx.drawImage(this.floorImgs[this.floorCnt], x, y);
        this.floorCnt ^= 1;
    }

    drawWall(ctx, x, y, type) {
        ctx.drawImage(this.wallImgs[type], x, y);
    }

    setStart(pos) {
        this.start = pos;
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
            try{
                this.tileToCell[cell](i);
            } catch {
                console.error(`unknown cell type ${cell} at ${i}. adding anyway`);
                this.cells[i] = [cell,undefined];
            }
            ++i;
        }
    }

    draw(ctx) {
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
    objects() {
        return this.objects;
    }
    guards() {
        return this.guards;
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
