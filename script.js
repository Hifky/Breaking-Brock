const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let gameOver = false;

let paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - 75) / 2,
    dx: 7,
    rightPressed: false,
    leftPressed: false
};

function drawPaddle() {
    context.beginPath();
    context.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        paddle.rightPressed = true;
    } else if (event.key === 'ArrowLeft') {
        paddle.leftPressed = true;
    } else if (gameOver && event.key !== '') {
        resetGame();
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowRight') {
        paddle.rightPressed = false;
    } else if (event.key === 'ArrowLeft') {
        paddle.leftPressed = false;
    }
});

function movePaddle() {
    if (paddle.rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (paddle.leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,
    dy: -2,
    radius: 10
};

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            gameOver = true;
        }
    }
}

let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = "#0095DD";
                context.fill();
                context.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                }
            }
        }
    }
}

function drawGameOver() {
    context.font = "48px Arial";
    context.fillStyle = "#0095DD";
    context.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
}

function resetGame() {
    gameOver = false;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = (canvas.width - paddle.width) / 2;

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }

    gameLoop();
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    moveBall();
    movePaddle();
    collisionDetection();
    requestAnimationFrame(gameLoop);
}

gameLoop();
