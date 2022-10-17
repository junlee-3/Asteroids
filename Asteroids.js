const canvas = document.getElementById("canvas");
const FPS = 60;
const shipSize = 30;
const turnRate = 360; //degrees per second
let ctx = canvas.getContext("2d");
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize /2,
    angle: 90 / 180 * Math.PI, //convert to radians
    rot: 0
}

//Event Handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//Game Loop
setInterval(update, 1000/FPS);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: //left arrow
            ship.rot = turnRate / 180 * Math.PI / FPS;
            break;
        case 38: //up arrow
            break;
        case 39: //right arrow
            ship.rot = -turnRate / 180 * Math.PI / FPS;
            break;
        case 40: //down arrow
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: //left arrow
            ship.rot = 0;
            break;
        case 38: //up arrow
            break;
        case 39: //right arrow
            ship.rot = 0;
            break;
        case 40: //down arrow
            break;
    }
}

function update() {
    //Draw Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Draw the Ship/Player
    ctx.strokeStyle = "white";
    ctx.lineWidth = shipSize / 20;
    ctx.beginPath();
    ctx.moveTo( //Nose of the ship
        ship.x + 4/3 * ship.r * Math.cos(ship.angle),
        ship.y - 4/3 * ship.r * Math.sin(ship.angle)
    );
    ctx.lineTo( //Rear leftx
        ship.x - ship.r * (2/3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
        ship.y + ship.r * (2/3 * Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo( //Rear right
        ship.x - ship.r * (2/3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
        ship.y + ship.r * (2/3 * Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath();
    ctx.stroke();

    //Rotate the ship
    ship.angle += ship.rot;
    //Move the ship

    //Center dot
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x-1, ship.y-1, 2, 2)
}