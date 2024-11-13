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
    runningModel.scale.set(150, 150, 150); // Same scale as the previous Panda model
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
        jumpingModel.position.set(runningModel.position.x, runningModel.position.y, runningModel.position.z);
        jumpingModel.visible = true;

        // Play Jump Animation
        jumpAction.reset().play();
    }
});

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
    }
}

// Animate Function - Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the animation mixer to play the animations
    if (mixer) {
        mixer.update(0.016);  // Update at 60 FPS (or adjust as needed)
    }
    if (jumpMixer) {
        jumpMixer.update(0.016);
    }

    // Apply gravity and update player position
    if (isJumping) {
        if (jumpingModel.position.y > groundLevel) {
            velocityY += gravity;
        } else {
            jumpingModel.position.y = groundLevel;
            checkLanding(); // Check if player has landed
        }

        jumpingModel.position.y += velocityY;
    }

    // Update camera position to follow the player
    if (runningModel.visible) {
        camera.position.x = runningModel.position.x + 12;
        camera.position.z = runningModel.position.z + 10;
        camera.position.y = runningModel.position.y + 2;
    } else if (jumpingModel.visible) {
        camera.position.x = jumpingModel.position.x + 12;
        camera.position.z = jumpingModel.position.z + 10;
        camera.position.y = jumpingModel.position.y + 2;
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
});

// Start the Game Loop
animate();
