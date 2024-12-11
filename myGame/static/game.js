import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import { ObstacleManager } from "./obstacles.js";

// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio); // High DPI Support
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let health = 100;
// Adjust Camera for Different Screen Sizes
function adjustCamera() {
    if (window.innerWidth < 768) { // Mobile view
        camera.fov = 75;
        camera.position.set(0, 2, 8);
    } else {
        camera.fov = 100;
        camera.position.set(0, 2, 5);
    }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
adjustCamera();

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);

// Skybox Setup
const createskybox = () => {
    const loader = new THREE.TextureLoader();
    loader.load("Assets/Images/galaxy.jpg", function (texture) {
        const sphereGeometry = new THREE.SphereGeometry(100, 600, 400);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        const bgMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(bgMesh);
    });
};
createskybox();

const healthDisplay = document.getElementById("healthDisplay");

function updateHealth(amount) {
    health -= amount; // Reduce health
    health = Math.max(health, 0); // Prevent negative health
    healthDisplay.innerText = `Health: ${health}`; // Update the displayed health
    console.log(`Health: ${health}`); // Debugging log

    if (health === 0) {
        alert("Game Over!");
        window.location.reload(); // Reload the page to restart the game
    }
}

// GLTFLoader Initialization
const loader = new GLTFLoader().setPath("Assets/3D objects/");
let runningModel, jumpingModel, mixer, jumpMixer, runAction, jumpAction;
const playerCenterDistance = 1;

// Load Running Animation
loader.load("Running.glb", (gltf) => {
    runningModel = gltf.scene;
    runningModel.scale.set(150, 150, 150);
    runningModel.position.set(0, playerCenterDistance, 0);
    runningModel.rotation.y = Math.PI / 2;
    runningModel.visible = true;
    scene.add(runningModel);

    mixer = new THREE.AnimationMixer(runningModel);
    mixer.timeScale = 0.8;
    runAction = mixer.clipAction(gltf.animations[0]);
    runAction.loop = THREE.LoopRepeat;
    runAction.play();
    // Initialize the ObstacleManager after player is loaded
    obstacleManager = new ObstacleManager(scene, runningModel, updateHealth);
});

// Load Jumping Animation
loader.load("Jump.glb", (gltf) => {
    jumpingModel = gltf.scene;
    jumpingModel.scale.set(150, 150, 150);
    jumpingModel.position.set(0, playerCenterDistance, 0);
    jumpingModel.rotation.y = Math.PI / 2;
    jumpingModel.visible = false;
    scene.add(jumpingModel);

    jumpMixer = new THREE.AnimationMixer(jumpingModel);
    jumpMixer.timeScale = 0.4;
    jumpAction = jumpMixer.clipAction(gltf.animations[0]);
    jumpAction.loop = THREE.LoopOnce;
    jumpAction.clampWhenFinished = true;
});

// Score and Health Display
let score = 0;
let lastScoreUpdateTime = performance.now();
const scoreDisplay = document.getElementById("Score");

// Initialize Obstacle Manager
const obstacleManager = new ObstacleManager(scene, runningModel, updateHealth);

// Gravity, Jump Variables, and Player Movement
const gravity = -0.1;
const jumpForce = 1;
let velocityY = 0;
let isJumping = false;
let jumpStartTime = 0;
const groundLevel = 1;

// Game Pause State
let gamePaused = false;

// Input Event Listener for Jump
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isJumping && !gamePaused) {
        isJumping = true;
        velocityY = jumpForce;
        jumpStartTime = performance.now();
        runningModel.visible = false;

        jumpingModel.position.set(runningModel.position.x, runningModel.position.y, runningModel.position.z);
        jumpingModel.visible = true;
        jumpAction.reset().play();
    }

    if (event.code === 'Escape') {
        gamePaused = !gamePaused;
        togglePauseMenu();
    }
});

// Pause Menu Handling
function togglePauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    if (gamePaused) {
        pauseMenu.style.display = 'block';
    } else {
        pauseMenu.style.display = 'none';
        animate();
    }
}

// Check Landing Function
function checkLanding() {
    if (jumpingModel.position.y <= groundLevel && isJumping) {
        isJumping = false;
        velocityY = 0;

        jumpingModel.visible = false;
        runningModel.position.set(jumpingModel.position.x, playerCenterDistance, jumpingModel.position.z);
        runningModel.visible = true;
        runAction.reset().play();
    }
}

// Animate Function - Game Loop
function animate() {
    if (gamePaused) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastScoreUpdateTime) / 1000;
    score += deltaTime * 0.1;
    scoreDisplay.innerText = `Score: ${Math.floor(score)}`;
    

    if (mixer) mixer.update(0.016);
    if (jumpMixer) jumpMixer.update(0.016);

    if (isJumping) {
        const elapsedTime = performance.now() - jumpStartTime;
        velocityY = elapsedTime < 200 ? velocityY + gravity : gravity;
        jumpingModel.position.y += velocityY;

        if (jumpingModel.position.y <= groundLevel) checkLanding();
    }

    // Update Obstacles
    obstacleManager.update();
    
    renderer.render(scene, camera);
}

// Resize Handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustCamera();
    adjustUITextSize();
});

// Adjust UI Text Size
function adjustUITextSize() {
    const baseFontSize = window.innerWidth < 768 ? 5 : 2;
    healthDisplay.style.fontSize = `${baseFontSize}vw`;
    scoreDisplay.style.fontSize = `${baseFontSize}vw`;
}

// Initialize UI and Start Game
adjustUITextSize();
animate();