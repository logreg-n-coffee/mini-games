// main canvas
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// collision canvas - rectangle that wrap around each raven
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

// frame calculation
let timeToNextRaven = 0;
let ravenInterval = 500;  // milliseconds
let lastTime = 0;

// game over logic
let gameOver = false;
let totalMissedRavens = 0;

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'yellow';
    ctx.fillText(
        `GAME OVER! Your Score is ${score}.`,
        canvas.width / 2 - 5,
        canvas.height / 2 - 5,
    );
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(
      `GAME OVER! Your Score is ${score}.`,
      canvas.width / 2,
      canvas.height / 2,
    );


}

// score 
let score = 0;
ctx.font = '50px Impact';

function drawScore() {
    ctx.fillStyle = 'yellow';
    ctx.fillText(`Score: ${score}`, 50, 75);
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 55, 80);
}

// raven 
let ravens = [];
class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeMultiplier = Math.random() * 0.6 + 0.4;  // random number between 0.4 and 1
        this.width = 271 * this.sizeMultiplier;  // ravens will be different values
        this.height = 194 * this.sizeMultiplier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'src/raven.png';
        this.frame = 0;  // used to store frame in a raven obj
        this.maxFrame = 4;
        this.timeSinceFlap = 0;  // computer consistency  
        this.flapInterval = Math.random() * 50 + 50;  // different flapping interval for different ravens, random number between 50 and 100
        this.hitboxColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];  // raven hit box
        this.color = `rgb(${this.hitboxColor[0]}, ${this.hitboxColor[1]}, ${this.hitboxColor[2]})`;  // randomly generated raven hit box color
    }

    update(deltaTime) {
        // bounce raven back if it tries to fly out of the top and bottom of the screen
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = -this.directionY;
        } 

        // raven movement trace
        this.x -= this.directionX;
        this.y += this.directionY;

        // delete raven after it flies out from the canvas
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true;
        }

        // making flapping speed consistent on slower and faster computers using animation speed
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
          // reset frame in raven
          (this.frame > this.maxFrame) ? (this.frame = 0) : this.frame++;
          // reset timeSinceFlap
          this.timeSinceFlap = 0;
        }

        // game over logic - if 10 ravens fly out of the screen then game over
        if (this.x < 0 - this.width) {
          totalMissedRavens++;
        }

        if (totalMissedRavens > 10) {
          gameOver = true;
        }
    }
        

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
            this.image,
            this.frame * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height,
        );
    }
}

// explosion effect

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'src/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'src/ice-blast.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update (deltaTime) {
        if (this.frame === 0) {
            this.sound.play();
        }
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            // if the sprite sheet has finished its animation frames, remove it from the canvas
            if (this.frame > 5) {
                this.markedForDeletion = true; 
            }
        }
    }
    draw() {
        ctx.drawImage(
            this.image, 
            this.frame * this.spriteWidth, 
            0, 
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y - this.size / 4,  // - this.size / 4 is for allignment 
            this.size,
            this.size,
        );
    }
}


// mouse click event - hitbox collision detection
window.addEventListener('click', e => {
    // scan collision canvas data for colored hitbox 
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
    // compare the clicked color against the raven detection hitbox color (r, g, b)
    const pixelColor = detectPixelColor.data;  // holds a Uint8ClampedArray [r, g, b, alpha], where all values range from 0 to 255
    
    // collision detection
    ravens.forEach((raven) => {
      // if colors match, which means user hit the raven, then delete the raven and increment the score
      if (
        raven.hitboxColor[0] === pixelColor[0] &&
        raven.hitboxColor[1] === pixelColor[1] &&
        raven.hitboxColor[2] === pixelColor[2]
      ) {
        // collision detected
        raven.markedForDeletion = true;
        score++;
        // create a new explosion instance object based on raven's location and size/width
        explosions.push(new Explosion(raven.x, raven.y, raven.width));
      }
    });
});

// keyboard event - cheat feature - destroy all ravens on the screen
window.addEventListener('keydown', e => {
    if (e.key === ' ') {
        console.log('detected keydown');
        // if space bar is pressed then destroy all ravens
        ravens.forEach((raven) => {
            raven.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(raven.x, raven.y, raven.width));
        });
    }
});

// animation loop
function animate(timestamp) {
  // clear raven path
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // clear collision hitbox path
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

  // time
  let deltaTime = timestamp - lastTime; // time difference between current frame and previous frame
  lastTime = timestamp;
  timeToNextRaven += deltaTime;

  // create new ravens
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    // put larger ravens to the front and smaller ravens to the back
    ravens.sort((a, b) => a.width - b.width);
  }

  // draw score
  drawScore();

  // update raven & explosion and draw raven as well explosion
  [...ravens, ...explosions].forEach((obj) => obj.update(deltaTime));
  [...ravens, ...explosions].forEach((obj) => obj.draw());

  // remove leftovers of raven explosion from the canvas / memory
  ravens = ravens.filter((raven) => !raven.markedForDeletion);
  explosions = explosions.filter((explosion) => !explosion.markedForDeletion);

  // only serve the next frame when the gameOver is false - if set to true then game will stop
  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    drawGameOver();
  }
}

animate(0); // pass initiated timestamp 0 to animate()