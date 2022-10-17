const canvas = document.getElementById("canvas");
const FPS = 60;
const shipSize = 30;
const turnRate = 360; //degrees per second
const shipThrust = 5; //Acceleration in pixels per second
const airResistance = 0.7; //Air Resistance or "Friction" or space. 0 = none 1= lots
let ctx = canvas.getContext("2d");
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize /2,
    angle: 90 / 180 * Math.PI, //convert to radians
    rotation: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

//Event Handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//Game Loop
setInterval(update, 1000/FPS);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: //left arrow
            ship.rotation = turnRate / 180 * Math.PI / FPS;
            break;
        case 38: //up arrow
            ship.thrusting = true;
            break;
        case 39: //right arrow
            ship.rotation = -turnRate / 180 * Math.PI / FPS;
            break;
        case 40: //down arrow
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: //left arrow
            ship.rotation = 0;
            break;
        case 38: //up arrow
            ship.thrusting = false;
            break;
        case 39: //right arrow
            ship.rotation = 0;
            break;
        case 40: //down arrow
            break;
    }
}

function update() {
    //Draw Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Thrust the ship
    if(ship.thrusting) {
        ship.thrust.x += shipThrust * Math.cos(ship.angle) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.angle) / FPS;

        //Draw the booster
        ctx.fillStyle = "red";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = shipSize / 10;
        ctx.beginPath();
        ctx.moveTo( //Rear Left
            ship.x - ship.r * (2/3 * Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)),
            ship.y + ship.r * (2/3 * Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle))
        );
        ctx.lineTo( //Rear Center behind the ship
            ship.x - ship.r * 6/3 * Math.cos(ship.angle),
            ship.y + ship.r * 6/3 * Math.sin(ship.angle)
        );
        ctx.lineTo( //Rear right
            ship.x - ship.r * (2/3 * Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)),
            ship.y + ship.r * (2/3 * Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        ship.thrust.x -= airResistance * ship.thrust.x / FPS;
        ship.thrust.y -= airResistance * ship.thrust.y / FPS;
    }

    //Draw the Ship/Player
    ctx.strokeStyle = "white";
    ctx.lineWidth = shipSize / 20;
    ctx.beginPath();
    ctx.moveTo( //Nose of the ship
        ship.x + 4/3 * ship.r * Math.cos(ship.angle),
        ship.y - 4/3 * ship.r * Math.sin(ship.angle)
    );
    ctx.lineTo( //Rear left
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
    ship.angle += ship.rotation;

    //Move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    //Handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    }

    //Center dot
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x-1, ship.y-1, 2, 2)
}