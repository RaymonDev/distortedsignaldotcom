let score = 0;
let currentTool = null;
let targetWave = {
    frequency: 0.02,
    amplitude: 30,
    phase: 0
};
let workspaceWave = {
    frequency: 0.03,
    amplitude: 40,
    phase: 2
};

// Canvas setup
const targetCanvas = document.getElementById('target-wave');
const workspaceCanvas = document.getElementById('workspace');
const targetCtx = targetCanvas.getContext('2d');
const workspaceCtx = workspaceCanvas.getContext('2d');

function resizeCanvas() {
    targetCanvas.width = window.innerWidth;
    targetCanvas.height = 200;
    workspaceCanvas.width = window.innerWidth;
    workspaceCanvas.height = window.innerHeight - 200;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.textContent.toLowerCase();
    });
});

// Mouse interaction
let isDragging = false;
let lastY = 0;

workspaceCanvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentTool) return;

    const deltaY = lastY - e.clientY;
    lastY = e.clientY;

    switch (currentTool) {
        case 'frequency':
            workspaceWave.frequency = Math.max(0.01, Math.min(0.05, 
                workspaceWave.frequency + deltaY * 0.0001));
            break;
        case 'amplitude':
            workspaceWave.amplitude = Math.max(10, Math.min(50, 
                workspaceWave.amplitude + deltaY * 0.1));
            break;
        case 'phase':
            workspaceWave.phase += deltaY * 0.01;
            break;
    }

    updateAccuracy();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

function drawWave(ctx, wave, time, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;

    for (let x = 0; x < ctx.canvas.width; x++) {
        const y = Math.sin(x * wave.frequency + time + wave.phase) * wave.amplitude;
        if (x === 0) {
            ctx.moveTo(x, ctx.canvas.height/2 + y);
        } else {
            ctx.lineTo(x, ctx.canvas.height/2 + y);
        }
    }

    ctx.stroke();
}

function updateAccuracy() {
    const freqDiff = Math.abs(targetWave.frequency - workspaceWave.frequency);
    const ampDiff = Math.abs(targetWave.amplitude - workspaceWave.amplitude);
    const phaseDiff = Math.abs(targetWave.phase - workspaceWave.phase) % (Math.PI * 2);

    const accuracy = Math.max(0, 100 - 
        (freqDiff * 2000 + ampDiff * 2 + phaseDiff * 10));

    document.getElementById('accuracy-fill').style.width = accuracy + '%';

    if (accuracy > 90) {
        const pointsEarned = Math.floor(accuracy);
        document.getElementById('points-earned').textContent = pointsEarned;
        
        // Show victory message
        const victoryMessage = document.getElementById('victory-message');
        victoryMessage.classList.add('show');
        
        // Update score when continuing
        document.getElementById('continue-btn').onclick = () => {
            score += pointsEarned;
            document.getElementById('score-value').textContent = score;
            victoryMessage.classList.remove('show');
            generateNewTarget();
        };
    }
}

function generateNewTarget() {
    targetWave = {
        frequency: 0.01 + Math.random() * 0.03,
        amplitude: 20 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2
    };
}

function animate(time) {
    targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    workspaceCtx.clearRect(0, 0, workspaceCanvas.width, workspaceCanvas.height);

    // Draw target wave
    drawWave(targetCtx, targetWave, time * 0.001, '#0ff');

    // Draw workspace wave
    drawWave(workspaceCtx, workspaceWave, time * 0.001, '#f0f');

    requestAnimationFrame(animate);
}

// Initialize game
document.getElementById('start-game-btn').addEventListener('click', () => {
    document.getElementById('tutorial-overlay').style.display = 'none';
    generateNewTarget();
    animate(0);
});

// Make logo clickable to restart
document.getElementById('logo').addEventListener('click', () => {
    location.reload();
});