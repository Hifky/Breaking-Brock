const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 50,
    height: 50,
    dx: 0
};

function drawPlayer() {
    context.fillStyle = 'green';
    context.fillRect(player.x, player.y, player.width, player.height);
}

function update() {
    player.x += player.dx;

    if (player.x + player.width > canvas.width || player.x < 0) {
        player.dx = 0;
    }
}

function gameLoop() {
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


document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        player.dx = 5;
    } else if (event.key === 'ArrowLeft') {
        player.dx = -5;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        player.dx = 0;
    }
});

gameLoop();

// パドルの設定
let paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - 75) / 2,
    dx: 7
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

// ボールの設定
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

    // 壁との衝突判定
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // パドルとの衝突判定
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        } else {
            // ゲームオーバー
            document.location.reload();
        }
    }
}

// ブロックの設定
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

