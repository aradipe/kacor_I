'use strict';
let l0Layout = `mE`;

var L0 = new Level(2,1,1,'l0', "assets/img/Buda.jpg", "assets/sounds/harpsichord_short.mp3");

function l0init(){
    L0.setLayout(l0Layout);
    L0.init();
    L0.objects[0].messages=[new Message(1000,3000, "Buda Castle, 1540"),
                            new Message(5200,3000, "A cruel tyrant reigns over the land"),
                            new Message(8500,3000, "Some say he is not even human"),
                            new Message(11800,4000, "His name is Kacor, the first")];

    L0.completed=true;
    L0.objects[1].endAtMs=16000;
}

l0init();
