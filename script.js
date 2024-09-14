const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

//描画する広さの指定
canvas.width = 800;  //描画する範囲の横を指定
canvas.height = 600; //描画する範囲の縦を指定

//ゲームオーバーフラグの初期値の設定
let gameOver = false;
//ゲームクリアフラグの初期値の設定
let gameClear = false;

//パドルの初期設定
let paddle = {
    height: 10, //パドルの厚さ
    width: 80, //パドルの幅
    x: (canvas.width - 80) / 2, //パドルの初期位置を中央に設定
    dx: 5, //1入力でパドルが移動する距離
};

//パドルの描画
function drawPaddle() {
    context.beginPath(); //これから線を描くことを示す
    context.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height); //rect()→矩形を追加
    context.fillStyle = "#0000FF"; //パドルの色
    context.fill(); //矩形内の塗りつぶし
    context.closePath(); //線を描き終わったことを示す
}

//キー入力によるパドル操作の方法の割り当てとゲームオーバー時の指示
//キーを押し下げた時に起こること
document.addEventListener('keydown', function(event) {
    if (event.key === 'j') {
        paddle.rightPressed = true; //"j"を押すと右に動く
    } else if (event.key === 'f') {
        paddle.leftPressed = true; //"f"を押すと左に動く
    } else if ((gameOver || gameClear) && event.key === 'Enter') {
        resetGame(); //ゲームオーバー時にEnterキーを押すとリスタートする
    }
});
//キーを押し下げた後上がるタイミングで起こること
document.addEventListener('keyup', function(event) {
    if (event.key === 'j') {
        paddle.rightPressed = false; //"j"が押された後あと元に戻ると右に動くのを止める
    } else if (event.key === 'f') {
        paddle.leftPressed = false; //"f"が押された後あと元に戻ると右に動くのを止める
    }
});

//パドルの動き方の設定
function movePaddle() {
    if (paddle.rightPressed && paddle.x < canvas.width - paddle.width) { //右に動く入力があった時にパドルがまだ右に行けるかを判定
        paddle.x += paddle.dx; //可能であればdxだけ右に動かす
    } else if (paddle.leftPressed && paddle.x > 0) { //左に動く入力があった時にパドルがまだ左に行けるかを判定
        paddle.x -= paddle.dx; //可能であればdxだけ左に動かす
    }
}

//ボールの初期設定
let ball = {
    x: canvas.width / 2,   //ボールの初期位置のうち横を画面中央に設定
    y: canvas.height - 20, //ボールの初期位置のうち縦をパドルの厚さとボールの半径以上浮かせる
    dx: 4,                 //ボールの横方向の動き
    dy: -4,                //ボールの縦方向の動き
    radius: 10             //ボールの半径
};
//ボールの描画
function drawBall() {
    context.beginPath(); //これから線を描くことを示す
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); //円を描いている、arc()は円を描くメソッド
    context.fillStyle = "#00AA00"; //ボールのカラーリング
    context.fill(); //円の内部を塗りつぶし
    context.closePath(); //線を描き終わったことを示す
}

//ボールの動き方の設定(ブロック衝突時を除く)
function moveBall() {
    ball.x += ball.dx; //ボールの横の動き方
    ball.y += ball.dy; //ボールの縦の動き方

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) { //ボールが横の壁にぶつかる時
        ball.dx = -ball.dx; //ボールを反射させる
    }
    if (ball.y + ball.dy < ball.radius) { //ボールが天井に当たる時
        ball.dy = -ball.dy; //ボールを反射させる
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x - 10 && ball.x < paddle.x + paddle.width + 10) { //ボールがパドルに当たる時(ボールのサイズも考慮)
            ball.dy = -ball.dy //ボールを反射させる
        } else { //ボールが地面につく
            gameOver = true;
        }
    }
}

let brickRowCount = 1;    //列(縦)の数を指定
let brickColumnCount = 1; //行(横)の数を指定
let brickWidth = 700;      //ブロックの幅
let brickHeight = 200;     //ブロックの厚さ
let brickPadding = 20;    //ブロックの間隔
let brickOffsetTop = 20;  //ブロックの一番上の行と天井の間隔
let brickOffsetLeft = 20; //ブロックの一番左の列と壁の間隔
let brickConut = brickRowCount * brickColumnCount; //ブロックの数

//ブロック群の設定
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

//ブロック群の描画
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
                context.fillStyle = "#000000"; //ブロックの色指定
                context.fill();
                context.closePath();
            }
        }
    }
}

//ブロックとボールの衝突判定と衝突時のボールの動き
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) { //
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) { //ブロックが存在することを確認
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy; //ボールの動きは反転させる(反射)
                    b.status = 0; //ブロックは破壊されたのでステータスを0に設定
                    brickConut -= 1;
                    if (brickConut == 0){
                        gameClear = true
                    }
                }
            }
        }
    }
}

//ゲームオーバーを表示
function drawGameOver() {
    context.font = "80px Courier New"; //GAME OVERの表示のサイズとフォントを選択
    context.fillStyle = "#000000"; //GAME OVERの表示の色を選択
    context.fillText("GAME OVER", canvas.width / 2 - 200, canvas.height / 2 + 50); //画面の中央に文字を配置
}

//ゲームクリアを表示
function drawGameClear() {
    context.font = "80px Courier New"; //Congratulations!の表示のサイズとフォントを選択
    context.fillStyle = "#000000"; //Congratulations!の表示の色を選択
    context.fillText("Congratulations!", canvas.width / 2 - 375, canvas.height / 2); //画面の中央に文字を配置
}

//ゲームをリセット
function resetGame() {
    brickConut = brickRowCount * brickColumnCount;
    gameOver = false;
    gameClear = false;
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

//ゲームを流れを定義
function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    if (gameClear) {
        drawGameClear();
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height); //矩形領域を透明に描ける
    drawBricks(); //ブロック群の描画
    drawBall();   //ボールの描画
    drawPaddle(); //パドルの描画
    moveBall();   //ボールの動き方の指定
    movePaddle(); //パドルの動き方を指定
    collisionDetection(); //ブロックとボールの衝突を判定
    requestAnimationFrame(gameLoop);
}

//一連の流れを実行する
gameLoop();
