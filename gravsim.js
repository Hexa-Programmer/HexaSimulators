// gravsim.js
const statTime = document.getElementById('stat-time');
const statHeight = document.getElementById('stat-height');
const statVelocity = document.getElementById('stat-velocity');
const statAcceleration = document.getElementById('stat-acceleration');
const statPe = document.getElementById('stat-pe');
const statKe = document.getElementById('stat-ke');

const inputDrag = document.getElementById('input-drag');
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
let acceleration = 0;
let mass = 0;
let gravity = 0;
let pixelsPerMeter = 1;
let lastTimestamp = 0;
let animationId = null;
let objectHalfSize = 60; 
let groundHeight = 40;

btnRun.addEventListener('click', runSimulation);
btnPause.addEventListener('click', pauseSimulation);
btnReset.addEventListener('click', resetSimulation);
window.addEventListener('resize', render);

inputDrag.addEventListener('change', (e) => {
    inputMass.disabled = !e.target.checked;
    resetSimulation();
});
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
    acceleration = -gravity;
    
    // Scale visual components dynamically based on altitude (100m = base 1.0 scale)
    const visualScale = height > 0 ? Math.max(0.1, Math.min(4, 100 / height)) : 1;
    document.documentElement.style.setProperty('--scale-factor', visualScale);
    
    groundHeight = Math.max(8, 40 * visualScale);
    document.querySelector('.ground-plane').style.height = groundHeight + 'px';
    
    const availableHeight = canvasArea.clientHeight - groundHeight - (objectHalfSize * 2 * visualScale) - 40;
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
    acceleration = -gravity;

    if (inputDrag.checked && mass > 0) {
        const dragConstant = 0.2; 
        const dragForce = dragConstant * velocity * velocity;
        const dragAcceleration = dragForce / mass;
        acceleration += dragAcceleration;
        
        if (acceleration > 0 && velocity < 0) {
            acceleration = 0;
        }
    }
    
    velocity += acceleration * dt;
    height += velocity * dt;
    
    if (height <= 0) {
        height = 0;
        velocity = 0;
        acceleration = 0;
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
    statAcceleration.textContent = (height > 0 ? acceleration : 0).toFixed(2) + ' m/s²';
    
    const activeMass = inputDrag.checked ? mass : (mass || 10);
    const pe = activeMass * gravity * height;
    const ke = 0.5 * activeMass * velocity * velocity;
    
    statPe.textContent = pe.toFixed(2) + ' J';
    statKe.textContent = ke.toFixed(2) + ' J';
}

function render() {
    const bottomPosition = groundHeight + (height * pixelsPerMeter);
    simObject.style.bottom = bottomPosition + 'px';
}

inputMass.disabled = !inputDrag.checked;
resetSimulation();