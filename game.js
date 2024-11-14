import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);

// GLTFLoader Initialization
const loader = new GLTFLoader().setPath("Assets/3D objects/"); // Path to where your .glb files are stored
let runningModel, jumpingModel, mixer, jumpMixer, runAction, jumpAction;
const playerCenterDistance = 1; // Adjusted distance to ground level

camera.position.z = 5;

const createskybox = () => {
    let bgMesh;

    const loader = new THREE.TextureLoader();
    loader.load("Assets/Images/galaxy.jpg", function (texture) {
        const sphereGeometry = new THREE.SphereGeometry(100, 600, 400);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        bgMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(bgMesh);
    });
};

createskybox();

// Load the Running Animation
loader.load("Running.glb", (gltf) => {
    runningModel = gltf.scene;
    runningModel.scale.set(150, 150, 150); // Same scale as Jumping model
    runningModel.position.set(0, playerCenterDistance, 0);
    runningModel.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
    runningModel.visible = true; // Make sure running model is visible
    scene.add(runningModel);

    // Running Animation Mixer
    mixer = new THREE.AnimationMixer(runningModel);
    mixer.timeScale = 0.4; // Reduce the animation speed
    runAction = mixer.clipAction(gltf.animations[0]);
    runAction.loop = THREE.LoopRepeat;
    runAction.play();
    console.log("Running animation loaded");
}, undefined, (error) => console.error("Error loading Running animation:", error));

// Load the Jumping Animation
loader.load("Jump.glb", (gltf) => {
    jumpingModel = gltf.scene;
    jumpingModel.scale.set(150, 150, 150); // Same scale as running model
    jumpingModel.position.set(0, playerCenterDistance, 0);
    jumpingModel.rotation.y = Math.PI / 2; // Rotate 90 degrees to the right
    jumpingModel.visible = false; // Initially hidden, we only show it when jumping
    scene.add(jumpingModel);

    // Jumping Animation Mixer
    jumpMixer = new THREE.AnimationMixer(jumpingModel);
    jumpMixer.timeScale = 0.4; // Reduce the jumping animation speed
    jumpAction = jumpMixer.clipAction(gltf.animations[0]);
    jumpAction.loop = THREE.LoopOnce;
    jumpAction.clampWhenFinished = true;
    console.log("Jumping animation loaded");
}, undefined, (error) => console.error("Error loading Jumping animation:", error));

// Gravity, Jump Variables, and Player Movement
const gravity = -0.02; // Increased gravity for faster falling
const jumpForce = 0.5 ; // Reduced jump force for lower jumps
let velocityY = 0;
let isJumping = false;
let jumpStartTime = 0; // Time when the jump starts
const groundLevel = 1;

// Pause menue
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

        // Log action
        console.log("Jump action played", jumpAction.isRunning());

        // Log visibility status
        console.log("Running Model Visible:", runningModel.visible);
        console.log("Jumping Model Visible:", jumpingModel.visible);
    }

    if (event.code === 'Escape') {
        gamePaused = !gamePaused;
        togglePauseMenu();
    }
});

// Toggle Pause Menu
function goToHomePage() {
    window.location.href = 'index.html';  // Navigate to index.html
}

// Toggle Pause Menu
function togglePauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    const goToHomePageButton = document.getElementById('goToHomePageButton');
    
    if (gamePaused) {
        pauseMenu.style.display = 'block';  // Show pause menu
    } else {
        pauseMenu.style.display = 'none';  // Hide pause menu
        animate();  // Restart the game loop if resumed
    }
}

// Add an event listener for the Go to Home Page button
document.getElementById('goToHomePageButton').addEventListener('click', goToHomePage);

// Check Landing Function
function checkLanding() {
    if (jumpingModel.position.y <= groundLevel && isJumping) {
        isJumping = false;
        velocityY = 0;

        // Switch to Running Animation after landing
        jumpingModel.visible = false;
        runningModel.position.set(jumpingModel.position.x, playerCenterDistance, jumpingModel.position.z);
        runningModel.visible = true;

        // Play Running Animation
        runAction.reset().play(); // Restart the running animation

        console.log("Landed", runningModel.position.y);
        console.log("Running Model Visible after landing:", runningModel.visible);
        console.log("Jumping Model Visible after landing:", jumpingModel.visible);
    }
}

// Score Variables
let score = 0;
let scoreMultiplier = 0.0001;
let lastScoreUpdateTime = performance.now();
const scoreDisplay = document.getElementById("Score");

// Health Variables
let health = 100;
const healthDisplay = document.getElementById("healthDisplay");

// Animate Function - Game Loop
function animate() {
    if (gamePaused) return;
    requestAnimationFrame(animate);

    // Update the score based on elapsed time
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastScoreUpdateTime) / 1000; // Seconds since last update
    score += deltaTime * scoreMultiplier * 0.2; 
    scoreDisplay.innerText = `Score: ${Math.floor(score)}`; // Update displayed score
    scoreMultiplier = deltaTime * 0.0005;

    // Update the animation mixer to play the animations
    if (mixer) {
        mixer.update(0.016);  // Update at 60 FPS (or adjust as needed)
    }
    if (jumpMixer) {
        jumpMixer.update(0.016);
    }

    // Apply gravity and update player position
    if (isJumping) {
        const elapsedTime = performance.now() - jumpStartTime;

        if (elapsedTime < 200) { // Allow some airtime before applying gravity
            velocityY += gravity;
        } else {
            velocityY = gravity;
        }

        jumpingModel.position.y += velocityY;

        if (jumpingModel.position.y <= groundLevel) {
            checkLanding();
        }

        console.log("Jumping", jumpingModel.position.y);
    }

    // Update camera position to follow the player
    if (runningModel && runningModel.visible) {
        camera.position.x = runningModel.position.x + 12;
        camera.position.z = runningModel.position.z + 10;
        camera.position.y = runningModel.position.y + 2;
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
});

// Adjust font size based on window size
function adjustUITextSize() {
    const baseFontSize = 1; // Base font size in vw (viewport width units)
    const healthDisplay = document.getElementById("healthDisplay");
    const scoreDisplay = document.getElementById("Score");

    // Calculate new font size based on window width
    const newFontSize = baseFontSize * (window.innerWidth / 1000); // Adjust multiplier as needed

    // Set font size for both health and score displays
    healthDisplay.style.fontSize = `${newFontSize}vw`;
    scoreDisplay.style.fontSize = `${newFontSize}vw`;
}

// Call the function initially to set font size
adjustUITextSize();

// Adjust font size whenever the window is resized
window.addEventListener('resize', adjustUITextSize);

// Start the Game Loop
animate();
