import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import { ObstacleManager } from "./obstacles.js";

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adjust camera for different screen sizes
function adjustCamera() {
    if (window.innerWidth < 768) { // For mobile view
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

// Skybox
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

// GLTFLoader initialization
const loader = new GLTFLoader().setPath("Assets/3D objects/");
let runningModel, jumpingModel, mixer, jumpMixer, runAction, jumpAction;
const playerCenterDistance = 1;

// Load running animation
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
});

// Load jumping animation
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

// Health and score
let health = 100;
const healthDisplay = document.getElementById("healthDisplay");
const scoreDisplay = document.getElementById("Score");

// Doesn't work yet cu player doesnt have hitbox :)
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

// Initialize Obstacle Manager
const obstacleManager = new ObstacleManager(scene, runningModel, updateHealth);

// Can use ammo.js and reright
// Gravity, jump variables, and player movement
const gravity = -0.008;
const jumpForce = 0.2;
let velocityY = 0;
let isJumping = false;
let jumpStartTime = 0;
const groundLevel = 1;

// Game pause state
let gamePaused = false;

// Input event listener for jump
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

// Check landing function
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

// Pause menu handling
function togglePauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    if (gamePaused) {
        pauseMenu.style.display = 'block';
    } else {
        pauseMenu.style.display = 'none';
        animate();
    }
}

let lastScoreUpdateTime = performance.now();
let score = 0;

// Animate function / Game loop
function animate() {
    if (gamePaused) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastScoreUpdateTime) / 1000;
    score += deltaTime * 5;
    lastScoreUpdateTime = currentTime;
    scoreDisplay.innerText = `Score: ${Math.floor(score)}`;
    

    if (mixer) mixer.update(0.006);
    if (jumpMixer) jumpMixer.update(0.006);

    if (isJumping) {
        const elapsedTime = performance.now() - jumpStartTime;
        velocityY = elapsedTime < 200 ? velocityY + gravity : gravity;
        jumpingModel.position.y += velocityY;

        if (jumpingModel.position.y <= groundLevel) checkLanding();
    }

    // Update obstacles
    obstacleManager.update();
    
    renderer.render(scene, camera);
}

// Resize handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustCamera();
    adjustUITextSize();
});

// Adjust UI text size
function adjustUITextSize() {
    const baseFontSize = window.innerWidth < 768 ? 5 : 2;
    healthDisplay.style.fontSize = `${baseFontSize}vw`;
    scoreDisplay.style.fontSize = `${baseFontSize}vw`;
}

// Initialize UI and start game
adjustUITextSize();
animate();