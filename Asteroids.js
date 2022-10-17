const canvas = document.getElementById("canvas");
const FPS = 60;
const shipSize = 30;
let ctx = canvas.getContext("2d");
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize /2,
    angle: 90 / 180 * Math.PI, //convert to radians
}

//Game Loop
setInterval(update, 1000/FPS);

function update() {
    //Draw Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Draw the Ship/Player
    ctx.strokeStyle = "white";
    ctx.lineWidth = shipSize / 20;
    ctx.beginPath();
    ctx.moveTo( //Nose of the ship
        ship.x + ship.r * Math.cos(ship.angle),
        ship.y - ship.r * Math.sin(ship.angle)
    );
    ctx.lineTo( //Rear leftx
        ship.x - ship.r * (Math.cos(ship.angle) + Math.sin(ship.angle)),
        ship.y + ship.r * (Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo( //Rear right
        ship.x - ship.r * (Math.cos(ship.angle) - Math.sin(ship.angle)),
        ship.y + ship.r * (Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath()
    ctx.stroke();

    //Rotate the ship

    //Move the ship
}