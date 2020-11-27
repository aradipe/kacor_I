
let l1Layout = `\
-----------------IwIIwIII-----\
-IIIIIIIIgIIIIIIII     lIIIII-\
-IIIIIIII IIIIIIII IIIIIIIIII-\
-IIIIIIII      III IIIIIIIIII-\
-IIIIIIII IIII III IIIIIIIIII-\
-IIIIIIII II   k  hIIIIIIIIII-\
-IIIIIIII IIIIIIIIIIIIIIIIIII-\
-IIIIIIII IIIIIIIIIIIIIIIIIII-\
-0  s  d  IIIIIIIIIIIIIn    E-\
-IIIIIIII IIIIIIIIIIIII  IIII-\
-IIIIIIII IIIII          IIII-\
-IIIIIIII     d  r  II   IIII-\
-IIIIIIIIIIIIIIIIIIIII   IIII-\
-IIIIIIIIIIIIIIIIIIIIIIIIIIII-\
------------------------------\
`;

var L1 = new Level(30, 15, 32, 'l1');

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
