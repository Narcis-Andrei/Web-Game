import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

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
let isJumping = false;
let velocityY = 0;
const gravity = -1.5; // Reduced gravity for smoother jump
const jumpForce = 0.2; // Reduced jump force for smoother physics
const groundLevel = 1;

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

// Load Running.glb for running animation
loader.load("Running.glb", (gltf) => {
    runningModel = gltf.scene;
    runningModel.scale.set(150, 150, 150);
    runningModel.position.set(0, playerCenterDistance, 0);
    runningModel.rotation.y = Math.PI / 2;
    runningModel.visible = true;
    scene.add(runningModel);

    mixer = new THREE.AnimationMixer(runningModel);
    if (gltf.animations.length > 0) {
        runAction = mixer.clipAction(gltf.animations[0]);
        runAction.loop = THREE.LoopRepeat;
        runAction.play();
    }
});

// Load Jump.glb for jumping animation
loader.load("Jump.glb", (gltf) => {
    jumpingModel = gltf.scene;
    jumpingModel.scale.set(150, 150, 150);
    jumpingModel.position.set(0, playerCenterDistance, 0);
    jumpingModel.rotation.y = Math.PI / 2;
    jumpingModel.visible = false;
    scene.add(jumpingModel);

    // Apply texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("Assets/Textures/T_PandaW_B.png", () => {
        jumpingModel.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture;
                child.material.needsUpdate = true;
        
                // Correct UV mapping or texture orientation if needed
                child.material.map.wrapS = THREE.RepeatWrapping;
                child.material.map.wrapT = THREE.RepeatWrapping;
                child.material.map.repeat.set(1, 1);
            }
        });
    });

    jumpMixer = new THREE.AnimationMixer(jumpingModel);
    if (gltf.animations.length > 0) {
        jumpAction = jumpMixer.clipAction(gltf.animations[0]);
        jumpAction.timeScale = 1.2; // Increased animation speed for smoother jump
        jumpAction.clampWhenFinished = true;
        jumpAction.loop = THREE.LoopOnce; // Play animation only once
    } else {
        console.error("No animations found in Jump.glb");
    }
});

// Input event listener for jump
window.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isJumping) {
        isJumping = true; // Prevent multiple jumps

        // Trigger jump animation
        if (jumpAction) {
            jumpAction.reset();
            jumpAction.play();
        }

        // Switch to jumping model
        runningModel.visible = false;
        jumpingModel.position.copy(runningModel.position); // Sync position
        jumpingModel.visible = true;

        // Start jump physics
        velocityY = jumpForce;
    }
});

// Update function to handle jumping mechanics
function updateJump(deltaTime) {
    if (isJumping) {
        velocityY += gravity * deltaTime; // Apply gravity
        jumpingModel.position.y += velocityY; // Update vertical position

        if (jumpingModel.position.y <= groundLevel) {
            jumpingModel.position.y = groundLevel;
            isJumping = false; // Reset jump state
            velocityY = 0;

            // Switch back to running model
            jumpingModel.visible = false;
            runningModel.position.copy(jumpingModel.position); // Synchronize positions
            runningModel.visible = true;

            if (runAction) {
                runAction.reset();
                runAction.play();
            }
        }
    }
}

// Game loop
let lastFrameTime = performance.now();
function animate() {
    if (!isPaused) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;

        // Update mixers
        if (mixer) mixer.update(deltaTime);
        if (jumpMixer) jumpMixer.update(deltaTime);

        // Handle jumping mechanics
        updateJump(deltaTime);

        // Render the scene
        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}

animate();
