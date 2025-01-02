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

let moveSpeed = 2; // Reduced movement speed for terrain
let terrainSpawnInterval = 1; // Initial spawn interval
let terrainSpawnTimer = 0;
const minSpawnInterval = 0.5; // Minimum spawn interval to ensure stability

const terrainModels = [];

// Update score every second
setInterval(() => {
    if (!isPaused) {
        score += 1;
        scoreElement.innerText = `Score: ${score}`;

        // Gradual adjustment to speed and spawn rate
        moveSpeed = Math.min(5, 2 + score * 0.05); // Gradual increase capped at 5
        terrainSpawnInterval = Math.max(minSpawnInterval, 2.5 - score * 0.01); // Decrease spawn interval with a minimum limit
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
        updateHealth(-10);
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

function spawnTerrain(xPosition) {
    loader.load("Ter1.glb", (gltf) => {
        const terrainModel = gltf.scene.clone();
        terrainModel.scale.set(0.1, 0.1, 0.1);
        terrainModel.position.set(xPosition, 1.35, -2);
        scene.add(terrainModel);
        terrainModels.push(terrainModel);
    });
}

// Spawn initial terrain
spawnTerrain(-10);
spawnTerrain(10);

// Move terrain
function updateTerrain(deltaTime) {
    terrainSpawnTimer += deltaTime;

    for (let i = terrainModels.length - 1; i >= 0; i--) {
        const terrain = terrainModels[i];
        terrain.position.x -= moveSpeed * deltaTime;

        // Despawn old terrain
        if (terrain.position.x < -50) {
            scene.remove(terrain);
            terrainModels.splice(i, 1);
        }
    }

    // Spawn new terrain periodically
    if (terrainSpawnTimer >= terrainSpawnInterval) {
        spawnTerrain(20); // Spawn a new terrain at 20 units
        terrainSpawnTimer = 0; // Reset the timer
    }
}

// Load Running.glb for running animation
loader.load("Running.glb", (gltf) => {
    runningModel = gltf.scene;
    runningModel.scale.set(120, 120, 120);
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
    jumpingModel.scale.set(120, 120, 120);
    jumpingModel.position.set(0, playerCenterDistance, 0);
    jumpingModel.rotation.y = Math.PI / 2;
    jumpingModel.visible = false;
    scene.add(jumpingModel);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("Assets/Textures/T_PandaW_B.png", () => {
        jumpingModel.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture;
                child.material.needsUpdate = true;
                child.material.map.wrapS = THREE.RepeatWrapping;
                child.material.map.wrapT = THREE.RepeatWrapping;
                child.material.map.repeat.set(1, 1);
            }
        });
    });

    jumpMixer = new THREE.AnimationMixer(jumpingModel);
    if (gltf.animations.length > 0) {
        jumpAction = jumpMixer.clipAction(gltf.animations[0]);
        jumpAction.timeScale = 1.2;
        jumpAction.clampWhenFinished = true;
        jumpAction.loop = THREE.LoopOnce;
    }

    // Input event listener for jump
    window.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !isJumping) {
            isJumping = true;
            jumpAction.reset();
            jumpAction.play();

            runningModel.visible = false;
            jumpingModel.position.copy(runningModel.position);
            jumpingModel.visible = true;

            velocityY = jumpForce;
        }
    });

    // Update jumping mechanics
    function updateJump(deltaTime) {
        if (isJumping) {
            velocityY += gravity * deltaTime;
            jumpingModel.position.y += velocityY;

            if (jumpingModel.position.y <= groundLevel) {
                jumpingModel.position.y = groundLevel;
                isJumping = false;
                velocityY = 0;

                jumpingModel.visible = false;
                runningModel.position.copy(jumpingModel.position);
                runningModel.visible = true;

                runAction.reset();
                runAction.play();
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

            if (mixer) mixer.update(deltaTime);
            if (jumpMixer) jumpMixer.update(deltaTime);

            updateTerrain(deltaTime);
            updateJump(deltaTime);
            renderer.render(scene, camera);
        }
        requestAnimationFrame(animate);
    }

    animate();
});
