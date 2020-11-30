
let l1Layout = `\
m-------III------IwIIwIII-----\
-IIIIIIIIgIIIIIIII     lIIIII-\
-IIIIIIII IIIIIIII     IIIIII-\
-IIIIIIII      III IIIIIIIIII-\
-IIIIIIII IIII III IIIIIIIIII-\
-IIIIIIII II   k  hIIIIIIIIII-\
-IIIIIIII IIIIIIIIIIIIIIIIIII-\
-0   IIII IIIIIIIIIIIIIIIIIII-\
-0  s  d  IIIIIIIIIIIIIn    E-\
-IIIIIIII IIIIIIIIIIIII  IIII-\
-IIIIIIII IIIII          IIII-\
-IIIIIIII     d  r  II   IIII-\
-IIIIIIIIIIIIIIIIIIIII   IIII-\
-IIIIIIIIIIIIIIIIIIIIIIIIIIII-\
------------------------------\
`;

var L1 = new Level(30, 15, 32, 'l1', "#222222", "assets/sounds/l1_loop.mp3");

function l1init(){
    L1.setLayout(l1Layout);

    function parse0(pos) {
        let o = new LevelObject('0');
        o.interact= function(pos,player,level) {
            player.no_keys+=1;
            //@todo: need message popup
            console.log(`player has ${player.no_keys} key(s)`);
        };
        this.cells[pos] = ['0', o];
        this.objects.push(o);
    }

    L1.tileToCell['0']=parse0.bind(L1);

    L1.init();

    let x=L1.startPosPx()[0];
    let y=L1.startPosPx()[1];
    L1.hero=new Actor('guy', 20, 40, x+15, y+15);

    L1.objects[0].messages=[new Message(1000,3000, "You're in prison for not bowing deep enough"), //@todo put this in l1
                            new Message(4100,3000, "before the king's carriage on the street")];
    L1.bg_music.loop=true;
}

l1init();
//
//s: start
//w: window
//k: key
//0: window with key
//d: door
//l: locked
//g: guard
//h: guard2
//r: rubberchicken
//n: npc

//monolouge_at_steps: [{0, ""}, {1,""}]
