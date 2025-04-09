const canvas = document.getElementById('signalCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size with higher resolution
function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;
    ctx.scale(scale, scale);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Wave parameters
const waves = [
    { color: '#0ff', amplitude: 30, frequency: 0.02, speed: 0.03, phase: 0 },
    { color: '#f0f', amplitude: 25, frequency: 0.025, speed: 0.035, phase: 2 },
    { color: '#ff0', amplitude: 20, frequency: 0.03, speed: 0.04, phase: 4 }
];

// Noise parameters
let noiseIntensity = 0;
let isNoisy = false;
let noiseTimeout;
const noisePoints = new Array(100).fill(0).map(() => Math.random() * 2 - 1);

function generateNoise() {
    for (let i = 0; i < noisePoints.length; i++) {
        noisePoints[i] = Math.random() * 2 - 1;
    }
}

function getNoise(x, time) {
    const index = Math.floor((x / canvas.width) * (noisePoints.length - 1));
    const nextIndex = (index + 1) % noisePoints.length;
    const fraction = (x / canvas.width) * (noisePoints.length - 1) - index;
    
    // Interpolate between noise points
    return noisePoints[index] * (1 - fraction) + noisePoints[nextIndex] * fraction;
}

function startNoiseSequence() {
    if (!isNoisy) {
        isNoisy = true;
        noiseIntensity = 1;
        generateNoise();
        
        // Random duration for noise
        const noiseDuration = 100 + Math.random() * 200;
        
        noiseTimeout = setTimeout(() => {
            isNoisy = false;
            // Random delay before next noise sequence
            setTimeout(startNoiseSequence, 500 + Math.random() * 1000);
        }, noiseDuration);
    }
}

function drawWave(wave, time) {
    const { color, amplitude, frequency, speed, phase } = wave;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;

    for (let x = 0; x < canvas.width; x++) {
        // Base wave
        const baseY = Math.sin(x * frequency + time * speed + phase) * amplitude;
        
        // Add noise when active
        let y = baseY;
        if (isNoisy) {
            const noise = getNoise(x, time) * amplitude * 2 * noiseIntensity;
            y += noise;
            
            // Random horizontal displacement during noise
            const xOffset = (Math.random() * 2 - 1) * noiseIntensity * 4;
            x += xOffset;
        }

        if (x === 0) {
            ctx.moveTo(x, canvas.height / 2 + y);
        } else {
            ctx.lineTo(x, canvas.height / 2 + y);
        }
    }
    
    ctx.stroke();
}

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fade noise in/out
    if (isNoisy && noiseIntensity < 1) {
        noiseIntensity = Math.min(1, noiseIntensity + 0.2);
    } else if (!isNoisy && noiseIntensity > 0) {
        noiseIntensity = Math.max(0, noiseIntensity - 0.1);
    }

    // Draw each wave
    waves.forEach(wave => drawWave(wave, timestamp * 0.001));
    
    requestAnimationFrame(animate);
}

// Start animation and noise sequence
requestAnimationFrame(animate);
startNoiseSequence();

//When the DISTORTED SIGNAL text is clicked, the page will load the game.html file
document.querySelector('.text').addEventListener('click', () => {
    window.location.href = 'home.html';
});