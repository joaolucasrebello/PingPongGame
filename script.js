// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 6;

// Player paddle
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5,
    maxSpeed: 8
};

// Game state
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;
let gameOver = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Game functions
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameOver = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
        ball.dy = (Math.random() - 0.5) * 5;
        gameLoop();
    }
}

function resetGame() {
    gameRunning = false;
    gameOver = false;
    playerScore = 0;
    computerScore = 0;
    updateScore();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    draw();
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;

    if (playerScore >= 11) {
        gameRunning = false;
        gameOver = true;
        alert('You win! Player: ' + playerScore + ' - Computer: ' + computerScore);
    } else if (computerScore >= 11) {
        gameRunning = false;
        gameOver = true;
        alert('Game Over! Computer wins! Player: ' + playerScore + ' - Computer: ' + computerScore);
    }
}

function update() {
    if (!gameRunning) return;

    // Player paddle control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Player paddle control with mouse
    const mouseControlSpeed = 8;
    if (Math.abs(mouseY - (player.y + player.height / 2)) > 5) {
        if (mouseY < player.y + player.height / 2) {
            player.y = Math.max(0, player.y - mouseControlSpeed);
        } else {
            player.y = Math.min(canvas.height - player.height, player.y + mouseControlSpeed);
        }
    }

    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const difficulty = 0.8; // Higher = harder

    if (ballCenter < computerCenter - 35) {
        computer.y = Math.max(0, computer.y - computer.speed * difficulty);
    } else if (ballCenter > computerCenter + 35) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed * difficulty);
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;

        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy = hitPos * ball.speed;

        // Increase ball speed slightly
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
    }

    if (
        ball.x + ball.size >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;

        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy = hitPos * ball.speed;

        // Increase ball speed slightly
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
    }

    // Ball out of bounds (left side - computer scores)
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScore();
        if (gameRunning) {
            resetBall();
        }
    }

    // Ball out of bounds (right side - player scores)
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScore();
        if (gameRunning) {
            resetBall();
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

function draw() {
    // Clear canvas with gradient
    ctx.fillStyle = 'rgba(26, 26, 26, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#667eea';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw computer paddle
    ctx.fillStyle = '#f093fb';
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw game status
    if (!gameRunning && !gameOver) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click START GAME to begin', canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();

    if (gameRunning && !gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();
