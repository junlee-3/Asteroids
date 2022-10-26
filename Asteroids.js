const canvas = document.getElementById("canvas");
const FPS = 60; //How many frames per second the game runs in
const shipSize = 30; //Size of the ship
const turnRate = 360; //degrees per second
const shipThrust = 5; //Acceleration in pixels per second
const airResistance = 0.7; //Air Resistance or "Friction" or space. 0 = none 1= lots
const asteroidsNumber = 3; //Starting number of asteroids
const asteroidsSpeed = 50; //max start speed of asteroids in pixels per second
const asteroidSize = 100; //Maximum starting size of asteroids in pixels
const asteroidsVert = 10; //Average number of vertices on each asteroid.
let ctx = canvas.getContext("2d");
const ship = { //Create ship object
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
let asteroids = []; //Create asteroids array
createAsteroidsBelt();

//Event Handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//Game Loop
setInterval(update, 1000/FPS);

function createAsteroidsBelt() {
    asteroids = [];
    let x, y;
    for (let i = 0; i < asteroidsNumber; i++) {
        x = Math.floor(Math.random() * canvas.width);
        y = Math.floor(Math.random() * canvas.height);
        asteroids.push(newAsteroid(x, y));
    }
}

//Key Down Event to move the player
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

//Key up events to stop the player
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

function newAsteroid(x, y) {
    let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * asteroidsSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        xy: Math.random() * asteroidsSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: asteroidSize / 2,
        a: Math.random() * Math.PI * 2, //In radians
        vert: Math.floor(Math.random() * (asteroidsVert + 1) + asteroidsVert / 2)
    }
    return asteroid;
}

function update() {
    //Draw Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Thrust the ship/Move it forward
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

    //Draw the asteroids
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = shipSize / 20;
    let x, y, r, a, vert;
    for (let i = 0; i < asteroids.length; i++) {
        //Get the properties
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;

        //Draw the path
        ctx.beginPath();
        ctx.moveTo(
            x + r * Math.cos(a),
            y + r * Math.sin(a)
        );

        //Draw the polygon
        for (let j = 0; j < vert; j++) {
            ctx.lineTo(
                x + r * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        //Move the asteroid

        //Handle edge
    }

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