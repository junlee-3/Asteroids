const FPS = 30; //How many frames per second the game runs in
const airResistance = 0.7; //Air Resistance or "Friction" or space. 0 = none 1= lots (i know there is no air resistance in space)
const playerLives = 3; // starting number of lives
const laserDistance = 0.6; // max distance laser can travel as fraction of screen width
const laserExplodeDuration = 0.1; //Amount of seconds of the ships explosion
const maxLasers = 10; //Max numbers of lasers on the screen
const laserSpeed = 500; // speed of lasers in pixels per second
const asteroidsJagged = 0.4; // Jaggedness of the asteroids (= none 1 = lots)
const ptsLgAsteroid = 20; // points scored for a large asteroid
const ptsMedAsteroid = 50; // points scored for a medium asteroid
const ptsSmlAsteroid = 100; // points scored for a small asteroid
const asteroidsNumber = 3; //Starting number of asteroids
const asteroidSize = 100; // starting size of asteroids in pixels
const asteroidSpeed = 50; // max starting speed of asteroids in pixels per second
const asteroidVert = 10; //Average number of vertices on each asteroid.
const SAVE_KEY_SCORE = "highscore"; // save key for local storage of high score
const shipBlinkDuration = 0.1; // duration in seconds of a single blink during ship's invisibility
const shipExplodeDuration = 0.3; // duration of the ship's explosion in seconds
const shipInvincibilityDuration = 3; //Amount of seconds of spawn protection the player receives
const shipSize = 30; //Size of the ship
const shipThrust = 5; //Acceleration in pixels per second
const shipTurnSpeed = 360; //degrees per second
const showHitboxes = false; //Boolean that will determine if we want to show the hitboxes for debugging
const SHOW_CENTRE_DOT = false; // show or hide ship's centre dot
const textFadeTime = 2.5; // text fade time in seconds
const textSize = 40; // text font height in pixels

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// set up the game parameters
let level, lives, asteroids, score, scoreHigh, ship, text, textAlpha;
newGame();

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    asteroids = [];
    let x, y;
    for (let i = 0; i < asteroidsNumber + level; i++) {
        // random asteroid location (not touching spaceship)
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < asteroidSize * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 2)));
    }
}

function destroyAsteroid(index) {
    let x = asteroids[index].x;
    let y = asteroids[index].y;
    let r = asteroids[index].r;

    // split the asteroid in two if necessary
    if (r === Math.ceil(asteroidSize / 2)) { // large asteroid
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 4)));
        score += ptsLgAsteroid;
    } else if (r === Math.ceil(asteroidSize / 4)) { // medium asteroid
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 8)));
        score += ptsMedAsteroid;
    } else {
        score += ptsSmlAsteroid;
    }

    // check high score
    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    // destroy the asteroid
    asteroids.splice(index, 1);

    // new level when no more asteroids
    if (asteroids.length === 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, colour = "white") {
    ctx.strokeStyle = colour;
    ctx.lineWidth = shipSize / 20;
    ctx.beginPath();
    ctx.moveTo( // nose of the ship
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
        );
    ctx.lineTo( // rear left
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
        );
    ctx.lineTo( // rear right
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
        );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(shipExplodeDuration * FPS);
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}

function keyDown(/** @type {KeyboardEvent} */ ev) {

    if (ship.dead) {
        return;
    }

    switch(ev.keyCode) {
        case 32: // space
        shootLaser();
        break;
        case 37: // left
        ship.rot = shipTurnSpeed / 180 * Math.PI / FPS;
        break;
        case 38: // up
        ship.thrusting = true;
        break;
        case 39: // right
        ship.rot = -shipTurnSpeed / 180 * Math.PI / FPS;
        break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {

    if (ship.dead) {
        return;
    }

    switch(ev.keyCode) {
        case 32: // space
        ship.canShoot = true;
        break;
        case 37: // left
        ship.rot = 0;
        break;
        case 38: // up
        ship.thrusting = false;
        break;
        case 39: // right
        ship.rot = 0;
        break;
    }
}

function newAsteroid(x, y, r) {
    let lvlMulti = 1 + 0.1 * level;
    let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * asteroidSpeed * lvlMulti / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * asteroidSpeed * lvlMulti / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2, // in radians
        r: r,
        offs: [],
        vert: Math.floor(Math.random() * (asteroidVert + 1) + asteroidVert / 2)
    };

    // populate the offsets array
    for (let i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push(Math.random() * asteroidsJagged * 2 + 1 - asteroidsJagged);
    }

    return asteroid;
}

function newGame() {
    level = 0;
    lives = playerLives;
    score = 0;
    ship = newShip();

    // get the high score from local storage
    let scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr);
    }

    newLevel();
}

function newLevel() {
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        a: 90 / 180 * Math.PI, // convert to radians
        r: shipSize / 2,
        blinkNum: Math.ceil(shipInvincibilityDuration / shipBlinkDuration),
        blinkTime: Math.ceil(shipBlinkDuration * FPS),
        canShoot: true,
        dead: false,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    // create the laser object
    if (ship.canShoot && ship.lasers.length < maxLasers) {
        ship.lasers.push({ // from the nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laserSpeed * Math.cos(ship.a) / FPS,
            yv: -laserSpeed * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }

    // prevent further shooting
    ship.canShoot = false;
}

function update() {
    let blinkOn = ship.blinkNum % 2 === 0;
    let exploding = ship.explodeTime > 0;

    // draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw the asteroids
    let a, r, x, y, offs, vert;
    for (let i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = shipSize / 20;

        // get the asteroid properties
        a = asteroids[i].a;
        r = asteroids[i].r;
        x = asteroids[i].x;
        y = asteroids[i].y;
        offs = asteroids[i].offs;
        vert = asteroids[i].vert;

        // draw the path
        ctx.beginPath();
        ctx.moveTo(
                x + r * offs[0] * Math.cos(a),
                y + r * offs[0] * Math.sin(a)
                );

        // draw the polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                    x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                    y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
                    );
        }
        ctx.closePath();
        ctx.stroke();

        // show asteroid's collision circle
        if (showHitboxes) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    // thrust the ship
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;

        // draw the thruster
        if (!exploding && blinkOn) {
            ctx.fillStyle = "red";
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = shipSize / 10;
            ctx.beginPath();
            ctx.moveTo( // rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
                );
            ctx.lineTo( // rear centre (behind the ship)
                ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
                );
            ctx.lineTo( // rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
                );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        // apply friction (slow the ship down when not thrusting)
        ship.thrust.x -= airResistance * ship.thrust.x / FPS;
        ship.thrust.y -= airResistance * ship.thrust.y / FPS;
    }

    // draw the triangular ship
    if (!exploding) {
        if (blinkOn && !ship.dead) {
            drawShip(ship.x, ship.y, ship.a);
        }

        // handle blinking
        if (ship.blinkNum > 0) {

            // reduce the blink time
            ship.blinkTime--;

            // reduce the blink num
            if (ship.blinkTime === 0) {
                ship.blinkTime = Math.ceil(shipBlinkDuration * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        // draw the explosion (concentric circles of different colours)
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // show ship's collision circle
    if (showHitboxes) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // show ship's centre dot
    if (SHOW_CENTRE_DOT) {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    // draw the lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime === 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // draw the eplosion
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // draw the game text
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + textSize + "px dejavu sans mono";
        ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
        textAlpha -= (1.0 / textFadeTime / FPS);
    } else if (ship.dead) {
        // after "game over" fades, start a new game
        newGame();
    }

    // draw the lives
    let lifeColour;
    for (let i = 0; i < lives; i++) {
        lifeColour = exploding && i === lives - 1 ? "red" : "white";
        drawShip(shipSize + i * shipSize * 1.2, shipSize, 0.5 * Math.PI, lifeColour);
    }

    // draw the score
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = textSize + "px dejavu sans mono";
    ctx.fillText(score, canvas.width - shipSize / 2, shipSize);

    // draw the high score
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = (textSize * 0.75) + "px dejavu sans mono";
    ctx.fillText("BEST " + scoreHigh, canvas.width / 2, shipSize);

    // detect laser hits on asteroids
    let ax, ay, ar, lx, ly;
    for (let i = asteroids.length - 1; i >= 0; i--) {

        // grab the asteroid properties
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;

        // loop over the lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {

            // grab the laser properties
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // detect hits
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                // destroy the asteroid and activate the laser explosion
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(laserExplodeDuration * FPS);
                break;
            }
        }
    }

    // check for asteroid collisions (when not exploding)
    if (!exploding) {

        // only check when not blinking
        if (ship.blinkNum === 0 && !ship.dead) {
            for (let i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }

        // rotate the ship
        ship.a += ship.rot;

        // move the ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        // reduce the explode time
        ship.explodeTime--;

        // reset the ship after the explosion has finished
        if (ship.explodeTime === 0) {
            lives--;
            if (lives === 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

    // handle edge of screen
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

    // move the lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) {

        // check distance travelled
        if (ship.lasers[i].dist > laserDistance * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // handle the explosion
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // destroy the laser after the duration is up
            if (ship.lasers[i].explodeTime === 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            // move the laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            // calculate the distance travelled
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        // handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        } else if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
    }

    // move the asteroids
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;

        // handle asteroid edge of screen
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if (asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r
        }
        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        } else if (asteroids[i].y > canvas.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r
        }
    }
}
