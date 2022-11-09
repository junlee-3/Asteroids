const canvas = document.getElementById("canvas");
const FPS = 60; //How many frames per second the game runs in
const shipSize = 30; //Size of the ship
const turnRate = 360; //degrees per second
const shipThrust = 5; //Acceleration in pixels per second
const airResistance = 0.7; //Air Resistance or "Friction" or space. 0 = none 1= lots
const asteroidsNumber = 3; //Starting number of asteroids
const asteroidsJagged = 0.4; //Jaggedness of the asteroids (= none 1 = lots)
const asteroidsSpeed = 50; //max start speed of asteroids in pixels per second
const asteroidSize = 100; //Maximum starting size of asteroids in pixels
const asteroidsVert = 10; //Average number of vertices on each asteroid.
const showBounding = true; //Collision bounds for debugging
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
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distanceBetweenPoints(ship.x, ship.y, x, y) < asteroidSize * 2 + ship.r);
        asteroids.push(newAsteroid(x, y));
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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
        yv: Math.random() * asteroidsSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: asteroidSize / 2,
        a: Math.random() * Math.PI * 2, //In radians
        vert: Math.floor(Math.random() * (asteroidsVert + 1) + asteroidsVert / 2),
        offsets: []
    }

    //Create the vertex offsets array
    for (let i = 0; i < asteroid.vert; i++) {
        asteroid.offsets.push(Math.random() * asteroidsJagged * 2 + 1 - asteroidsJagged);
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

    if (showBounding) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    };

    //Draw the asteroids
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = shipSize / 20;
    let x, y, r, a, vert, offsets;
    for (let i = 0; i < asteroids.length; i++) {
        //Get the properties
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offsets = asteroids[i].offsets;

        //Draw the path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offsets[0] * Math.cos(a),
            y + r * offsets[0] * Math.sin(a)
        );

        //Draw the polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offsets[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offsets[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        //Move the asteroid
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;

        //Handle edge
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if (asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r;
        }

        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        } else if (asteroids[i].y > canvas.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r;
        }
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