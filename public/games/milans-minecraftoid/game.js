const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const menuOverlay = document.getElementById('menu-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game State
let gameRunning = false;
let score = 0;
let lives = 3;
let animationId;

// Assets
const bgImage = new Image();
bgImage.src = 'assets/background.png';

const paddleImage = new Image();
paddleImage.src = 'assets/paddle.png';

const ballImage = new Image();
ballImage.src = 'assets/ball.png';

const brickImages = {
    dirt: new Image(),
    stone: new Image(),
    gold: new Image(),
    diamond: new Image()
};
brickImages.dirt.src = 'assets/dirt.png';
brickImages.stone.src = 'assets/stone.png';
brickImages.gold.src = 'assets/gold_ore.png';
brickImages.diamond.src = 'assets/diamond_ore.png';

// Game Objects
const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 30,
    width: 120,
    height: 20,
    speed: 8,
    dx: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 10,
    speed: 5,
    dx: 5,
    dy: -5
};

const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 30;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 25;

let bricks = [];

// Input Handling
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// Initialization
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            let type = 'dirt';
            let points = 10;
            if (r === 0) { type = 'diamond'; points = 50; }
            else if (r === 1) { type = 'gold'; points = 30; }
            else if (r === 2) { type = 'stone'; points = 20; }
            
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                type: type,
                points: points
            };
        }
    }
}

function drawBackground() {
    if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawPaddle() {
    if (paddleImage.complete) {
        ctx.drawImage(paddleImage, paddle.x, paddle.y, paddle.width, paddle.height);
    } else {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }
}

function drawBall() {
    if (ballImage.complete) {
        ctx.drawImage(ballImage, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00FF00';
        ctx.fill();
        ctx.closePath();
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                const b = bricks[c][r];
                let img = brickImages[b.type];
                
                if (img && img.complete) {
                    ctx.drawImage(img, brickX, brickY, brickWidth, brickHeight);
                } else {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                }
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += b.points;
                    scoreElement.innerText = score;
                    
                    // Check win condition
                    if (score === (brickRowCount * brickColumnCount * 10)) { // Simplified win check
                       // In a real game, you'd track active bricks
                    }
                }
            }
        }
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
             // Simple reflection based on where it hits the paddle could be added here
             // For now, just reverse Y
             ball.dy = -ball.dy;
             
             // Speed up slightly on paddle hit
             if (Math.abs(ball.dx) < 10) {
                 ball.dx *= 1.05;
                 ball.dy *= 1.05;
             }
        } else {
            // Game Over / Life Lost
            lives--;
            livesElement.innerText = lives;
            if (!lives) {
                gameOver();
            } else {
                resetBall();
            }
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -5;
    paddle.x = (canvas.width - paddle.width) / 2;
}

function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawBricks();
    drawPaddle();
    drawBall();
    
    collisionDetection();
    movePaddle();
    moveBall();

    animationId = requestAnimationFrame(draw);
}

function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    scoreElement.innerText = score;
    livesElement.innerText = lives;
    menuOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    initBricks();
    resetBall();
    draw();
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreElement.innerText = score;
    gameOverOverlay.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initial draw to show background
bgImage.onload = function() {
    drawBackground();
};
