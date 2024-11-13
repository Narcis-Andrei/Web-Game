import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls for Free Camera Movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);

// GLTFLoader Initialization
const loader = new GLTFLoader().setPath("Assets/3D objects"); // Path to where your .glb files are stored
let panda, runningModel, jumpingModel, mixer;
const playerCenterDistance = 1; // Adjusted distance to ground level

// Load the Panda Model (the character model)
loader.load("Panda.glb", (gltf) => {
    panda = gltf.scene;
    panda.scale.set(2.5, 2.5, 2.5);
    panda.position.set(0, playerCenterDistance, 0);
    scene.add(panda);
}, undefined, (error) => console.error("Error loading Panda model:", error));

// Load the Running Animation
loader.load("Running.glb", (gltf) => {
    runningModel = gltf.scene;
    runningModel.scale.set(2.5, 2.5, 2.5);
    runningModel.position.set(0, playerCenterDistance, 0);
    runningModel.visible = false; // Initially hidden, we only show it when running
    scene.add(runningModel);

    // Running Animation Mixer
    mixer = new THREE.AnimationMixer(runningModel);
    const runAction = mixer.clipAction(gltf.animations[0]);
    runAction.loop = THREE.LoopRepeat;
    runAction.play();
}, undefined, (error) => console.error("Error loading Running animation:", error));

// Load the Jumping Animation
loader.load("Jump.glb", (gltf) => {
    jumpingModel = gltf.scene;
    jumpingModel.scale.set(2.5, 2.5, 2.5);
    jumpingModel.position.set(0, playerCenterDistance, 0);
    jumpingModel.visible = false; // Initially hidden, we only show it when jumping
    scene.add(jumpingModel);

    // Jumping Animation Mixer
    const jumpMixer = new THREE.AnimationMixer(jumpingModel);
    const jumpAction = jumpMixer.clipAction(gltf.animations[0]);
    jumpAction.loop = THREE.LoopOnce;
    jumpAction.clampWhenFinished = true;
    jumpAction.play();
}, undefined, (error) => console.error("Error loading Jumping animation:", error));

// Gravity, Jump Variables, and Player Movement
const gravity = -0.05;
const jumpForce = 1;
let velocityY = 0;
let isJumping = false;
const groundLevel = 1;

// Input Event Listener for Jump
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isJumping) {
        isJumping = true;
        velocityY = jumpForce;

        // Hide Running Model and Show Jumping Model
        runningModel.visible = false;
        jumpingModel.visible = true;

        // Play Jump Animation
        if (mixer) {
            const jumpAction = mixer.clipAction(jumpingModel.animations[0]);
            jumpAction.reset().play();
        }
    }
});

// Check Landing Function
function checkLanding() {
    if (panda.position.y <= groundLevel && isJumping) {
        isJumping = false;
        velocityY = 0;

        // Switch to Running Animation after landing
        jumpingModel.visible = false;
        runningModel.visible = true;
    }
}

// Animate Function - Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the animation mixer to play the animations
    if (mixer) {
        mixer.update(0.016);  // Update at 60 FPS (or adjust as needed)
    }

    // Check if panda is defined before trying to access its position
    if (panda) {
        // Apply gravity and update player position
        if (panda.position.y > groundLevel) {
            velocityY += gravity;
        } else {
            panda.position.y = groundLevel;
            checkLanding(); // Check if player has landed
        }

        panda.position.y += velocityY;

        // Update camera position to follow the panda
        camera.position.x = panda.position.x + 12;
        camera.position.z = panda.position.z + 10;
        camera.position.y = panda.position.y + 2;

        // Render the scene
        renderer.render(scene, camera);
    }
}

// Handle Window Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
});

// Start the Game Loop
animate();
