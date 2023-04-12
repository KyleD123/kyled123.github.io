const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');



canvas.width = 1024 * 1.5 / 3.5;
canvas.height = 576 * 1.5 / 3.5;

const collisionsMap = [];
for(let i = 0; i < collisions.length; i += 120){
    collisionsMap.push(collisions.slice(i,120 + i));
}

const battleZonesMap = [];
for(let i = 0; i < battleZonesData.length; i += 120){
    battleZonesMap.push(battleZonesData.slice(i,120 + i));
}


const boundaries = [];

const offset = {
    x: -1850,
    y: -1200
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 8013)
            boundaries.push(
                new Boundary({
                    position:{
                    x:j * Boundary.width + offset.x,
                    y:i * Boundary.height + offset.y
                }
            })
        )
    })
})

const battleZones = [];

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 8013)
            battleZones.push(
                new Boundary({
                    position:{
                        x:j * Boundary.width + offset.x,
                        y:i * Boundary.height + offset.y
                    }
                })
            )
    })
})
// console.log(battleZones);

const image = new Image();
image.src = "./img/Map.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/MapForeground.png";

const playerImgDown = new Image();
playerImgDown.src = "./img/KnightDown.png";

const playerImgUp = new Image();
playerImgUp.src = "./img/KnightUp.png";

const playerImgLeft = new Image();
playerImgLeft.src = "./img/KnightLeft.png";

const playerImgRight = new Image();
playerImgRight.src = "./img/KnightRight.png";


const player = new Sprite({
    position:{
        x: canvas.width/2 - 195/4 /2,
        y: canvas.height/2 - 48/2,
    },
    image: playerImgDown,
    frames: {
        max: 4
    },
    sprites:{
        up:playerImgUp,
        down:playerImgDown,
        left:playerImgLeft,
        right:playerImgRight,
    }
})


const background = new Sprite({position:{
        x:offset.x,
        y:offset.y
    },
    image:image
})

const foreground = new Sprite({position:{
        x:offset.x,
        y:offset.y
    },
    image:foregroundImage
})

const keys = {
    ArrowUp:{
        pressed:false
    },
    ArrowDown:{
        pressed: false
    },
    ArrowLeft:{
        pressed:false
    },
    ArrowRight:{
        pressed:false
    }
}

const moveables = [background, ...boundaries, foreground, ...battleZones];

function rectCollision({rect1, rect2}){
    return(rect1.position.x + rect1.width >= rect2.position.x &&
        rect1.position.x <= rect2.position.x + rect2.w &&
        rect1.position.y <= rect2.position.y + rect2.h &&
        rect1.position.y + rect1.height >= rect2.position.y);
}

const battle = {
    initiated:false
}

function animation(){
   const animationId = window.requestAnimationFrame(animation);
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw();

    })
    battleZones.forEach(battleZone => {
      battleZone.draw();
    })
    player.draw();
    foreground.draw();

    let moving = true;
    player.moving = false;

    if(battle.initiated) return

    if(keys.ArrowUp.pressed || keys.ArrowLeft.pressed || keys.ArrowDown.pressed || keys.ArrowDown.pressed){
        for(let i = 0; i < battleZones.length; i++){
            const battleZone = battleZones[i];
            const overlappingArea =
                (Math.min(
                    player.position.x + player.width,
                        battleZone.position.x + battleZone.w
                    ) -
                    Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                    player.position.y + player.height,
                        battleZone.position.y + battleZone.h
                    ) -
                    Math.max(player.position.y, battleZone.position.y));

            if(rectCollision({rect1:player,rect2:battleZone})
                && overlappingArea > (player.width * player.height) /3
                && Math.random() < 0.005
            ){
                console.log("START BATTLE");
                window.cancelAnimationFrame(animationId);
                battle.initiated = true;
                gsap.to('#overlappingDiv',{
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete(){
                        gsap.to('#overlappingDiv',{
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                animateBattle();
                                gsap.to('#overlappingDiv',{
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            }
                        })
                    }
                });
                break;
            }
        }
    }



    if(keys.ArrowUp.pressed && lastKey === "ArrowUp") {
        player.moving = true;
        player.image = player.sprites.up;
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectCollision({
                rect1:player,
                rect2:{...boundary, position:{
                        x:boundary.position.x,
                        y:boundary.position.y + 2
                    }}
            })
            ){
                moving = false;
                break;
            }
        }

        if(moving)
        moveables.forEach((moveables)=>{
            moveables.position.y +=2
        })
    }
    else if(keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
        player.moving = true;
        player.image = player.sprites.left;
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectCollision({
                rect1:player,
                rect2:{...boundary, position:{
                        x:boundary.position.x + 3,
                        y:boundary.position.y
                    }}
            })
            ){
                moving = false;
                break;
            }
        }



        if(moving)
        moveables.forEach((moveables)=>{
            moveables.position.x +=2
        })
    }
    else if(keys.ArrowDown.pressed && lastKey === "ArrowDown") {
        player.moving = true;
        player.image = player.sprites.down;
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectCollision({
                rect1:player,
                rect2:{...boundary, position:{
                        x:boundary.position.x,
                        y:boundary.position.y - 2
                    }}
            })
            ){
                moving = false;
                break;
            }
        }

        if(moving)
        moveables.forEach((moveables)=>{
            moveables.position.y -=2
        })
    }
    else if(keys.ArrowRight.pressed && lastKey === "ArrowRight") {
        player.moving = true;
        player.image = player.sprites.right;
        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectCollision({
                rect1:player,
                rect2:{...boundary, position:{
                        x:boundary.position.x -2,
                        y:boundary.position.y
                    }}
            })
            ){
                moving = false;
                break;
            }
        }

        if(moving)
        moveables.forEach((moveables)=>{
            moveables.position.x -=2
        })
    }

}
animation();

const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./img/battleScene.png";
const battleBackground = new Sprite({
    position:{
        x: 0,
        y: 0
    },
    image:battleBackgroundImage
})
function animateBattle(){
    window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
}

let lastKey = "";
window.addEventListener('keydown', (e) => {
   // console.log(e);
   switch (e.key){
       case 'ArrowUp':
           keys.ArrowUp.pressed = true;
           lastKey = 'ArrowUp';
           break;
       case 'ArrowDown':
           keys.ArrowDown.pressed = true;
           lastKey = 'ArrowDown';
           break;
       case 'ArrowLeft':
           keys.ArrowLeft.pressed = true;
           lastKey = 'ArrowLeft';
           break;
       case 'ArrowRight':
           keys.ArrowRight.pressed = true;
           lastKey = 'ArrowRight';
           break;
   }
   // console.log(keys);
});

window.addEventListener('keyup', (e) => {
    // console.log(e);
    switch (e.key){
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }

});


window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

