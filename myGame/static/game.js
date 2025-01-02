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
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Resize health and score display
    const healthElement = document.getElementById('healthDisplay');
    const scoreElement = document.getElementById('Score');
    if (healthElement) {
        healthElement.style.fontSize = window.innerWidth < 768 ? '14px' : '20px';
    }
    if (scoreElement) {
        scoreElement.style.fontSize = window.innerWidth < 768 ? '14px' : '20px';
    }
}
window.addEventListener('resize', adjustCamera);
adjustCamera();

// HTML Elements
const scoreElement = document.getElementById('Score');
const healthElement = document.getElementById('healthDisplay');
const pauseMenu = document.getElementById('pauseMenu');

let score = 0;
let health = 100;
let isPaused = false;

// Update score every second
setInterval(() => {
    if (!isPaused) {
        score += 1;
        scoreElement.innerText = `Score: ${score}`;
    }
}, 1000);

// Pause menu toggle
function togglePause() {
    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? 'block' : 'none';
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        togglePause();
    }
});

// Health display update
function updateHealth(amount) {
    health = Math.max(0, health + amount);
    healthElement.innerText = `Health: ${health}`;
}

// Example: Decrease health over time
setInterval(() => {
    if (!isPaused) {
        updateHealth(-1);
    }
}, 2000);

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
let jumpCount = 0;
const maxJumps = 3;

// Maximum jump height
const maxJumpHeight = 3;

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
    if (gltf.animations.length > 0) {
        runAction = mixer.clipAction(gltf.animations[0]);
        runAction.loop = THREE.LoopRepeat;
        runAction.play();
    }
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
    jumpMixer.timeScale = 0.8;
    if (gltf.animations.length > 0) {
        jumpAction = jumpMixer.clipAction(gltf.animations[0]);
        jumpAction.loop = THREE.LoopOnce;
        jumpAction.clampWhenFinished = true;
    }
});

// Gravity, jump variables, and player movement
const gravity = -0.02; // Adjusted for smoother jump curve
const jumpForce = 0.3;  // Adjusted upward force for natural curve
let velocityY = 0;
let isJumping = false;
const groundLevel = 1;

// Input event listener for jump
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && jumpCount < maxJumps) {
        isJumping = true;
        velocityY = jumpForce;
        jumpCount++;

        runningModel.visible = false;
        jumpingModel.position.copy(runningModel.position);
        jumpingModel.visible = true;
        if (jumpAction) jumpAction.reset().play();
    }
});

function checkLanding() {
    if (jumpingModel.position.y <= groundLevel && isJumping) {
        isJumping = false;
        velocityY = 0;

        jumpingModel.visible = false;
        runningModel.position.copy(jumpingModel.position);
        runningModel.visible = true;
        if (runAction) runAction.reset().play();

        if (jumpCount >= maxJumps) {
            jumpCount = 0; // Reset jump count on landing if max jumps reached
        }
    }
}

// Update function to handle jumping
function updateJump(deltaTime) {
    if (isJumping) {
        velocityY += gravity * deltaTime; // Apply gravity
        jumpingModel.position.y += velocityY;

        // Clamp to maximum jump height smoothly
        if (jumpingModel.position.y > maxJumpHeight) {
            jumpingModel.position.y = maxJumpHeight;
            velocityY = 0; // Stop upward motion when max height is reached
        }

        if (jumpingModel.position.y <= groundLevel) {
            checkLanding(); // Trigger landing
        }
    }
}

// Integrate into game loop
let lastFrameTime = performance.now();
function animate() {
    if (!isPaused) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;

        // Update animation mixers
        if (mixer) mixer.update(deltaTime);
        if (jumpMixer) jumpMixer.update(deltaTime);

        // Update jump mechanics
        updateJump(deltaTime);

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}

animate();