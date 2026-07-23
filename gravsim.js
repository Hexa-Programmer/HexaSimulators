// gravsim.js
const statTime = document.getElementById('stat-time');
const statHeight = document.getElementById('stat-height');
const statVelocity = document.getElementById('stat-velocity');
const statAcceleration = document.getElementById('stat-acceleration');
const statPe = document.getElementById('stat-pe');
const statKe = document.getElementById('stat-ke');

const inputAltitude = document.getElementById('input-altitude');
const inputMass = document.getElementById('input-mass');
const inputGravity = document.getElementById('input-gravity');

const btnRun = document.getElementById('btn-run');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');

const simObject = document.getElementById('sim-object');
const canvasArea = document.querySelector('.canvas-area');

let isRunning = false;
let time = 0;
let height = 0;
let velocity = 0;
let mass = 0;
let gravity = 0;
let pixelsPerMeter = 1;
let lastTimestamp = 0;
let animationId = null;
let objectRadius = 30;
let groundHeight = 40;

btnRun.addEventListener('click', runSimulation);
btnPause.addEventListener('click', pauseSimulation);
btnReset.addEventListener('click', resetSimulation);
window.addEventListener('resize', render);

inputAltitude.addEventListener('input', resetSimulation);
inputMass.addEventListener('input', resetSimulation);
inputGravity.addEventListener('input', resetSimulation);

function resetSimulation() {
    cancelAnimationFrame(animationId);
    isRunning = false;
    time = 0;
    velocity = 0;
    height = parseFloat(inputAltitude.value) || 0;
    mass = parseFloat(inputMass.value) || 0;
    gravity = parseFloat(inputGravity.value) || 0;
    
    const availableHeight = canvasArea.clientHeight - groundHeight - (objectRadius * 2) - 40;
    pixelsPerMeter = height > 0 ? availableHeight / height : 1;
    
    updateStats();
    render();
}

function runSimulation() {
    if (!isRunning && height > 0) {
        if (time === 0) {
            height = parseFloat(inputAltitude.value) || 0;
            mass = parseFloat(inputMass.value) || 0;
            gravity = parseFloat(inputGravity.value) || 0;
        }
        isRunning = true;
        lastTimestamp = performance.now();
        animationId = requestAnimationFrame(loop);
    }
}

function pauseSimulation() {
    isRunning = false;
    cancelAnimationFrame(animationId);
}

function loop(timestamp) {
    if (!isRunning) return;
    
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;
    
    time += dt;
    velocity -= gravity * dt;
    height += velocity * dt;
    
    if (height <= 0) {
        height = 0;
        velocity = 0;
        isRunning = false;
    }
    
    updateStats();
    render();
    
    if (isRunning) {
        animationId = requestAnimationFrame(loop);
    }
}

function updateStats() {
    statTime.textContent = time.toFixed(2) + ' s';
    statHeight.textContent = height.toFixed(2) + ' m';
    statVelocity.textContent = velocity.toFixed(2) + ' m/s';
    statAcceleration.textContent = (height > 0 ? -gravity : 0).toFixed(2) + ' m/s²';
    
    const pe = mass * gravity * height;
    const ke = 0.5 * mass * velocity * velocity;
    
    statPe.textContent = pe.toFixed(2) + ' J';
    statKe.textContent = ke.toFixed(2) + ' J';
}

function render() {
    const bottomPosition = groundHeight + (height * pixelsPerMeter);
    simObject.style.bottom = bottomPosition + 'px';
}

resetSimulation();  