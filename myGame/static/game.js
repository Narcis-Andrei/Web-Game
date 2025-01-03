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
const minSpawnInterval = 0.5; // Minimum spawn interval to ensure stability
let itemSpeed = 2; // Initial speed for Bamboo and Chocolate

const terrainModels = [];
const items = []; // Array to store Bamboo and Chocolate items

// Update score every second and increase item speed gradually
setInterval(() => {
    if (!isPaused) {
        score += 1;
        scoreElement.innerText = `Score: ${score}`;

        // Gradual adjustment to speed
        moveSpeed = Math.min(5, 2 + score * 0.05); // Gradual increase capped at 5
        itemSpeed = Math.min(10, itemSpeed + 0.1); // Gradually increase item speed capped at 10
    }
}, 1000);

// Gradual health reduction
setInterval(() => {
    if (!isPaused) {
        updateHealth(-5); // Decrease health by 5
    }
}, 2000);

// Pause menu toggle
function togglePause() {
    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? 'block' : 'none';

    if (!isPaused) {
        lastFrameTime = performance.now(); // Reset frame time to resume smoothly
        animate(); // Resume the game loop
    }
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

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
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
        terrainModel.position.set(xPosition, 1.35, -1.7);
        scene.add(terrainModel);
        terrainModels.push(terrainModel);
    });
}

// Spawn initial terrain
spawnTerrain(-10);
spawnTerrain(10);

function spawnItem() {
    const itemType = Math.random() < 0.7 ? "Bamboo" : "Chocolate"; // Higher chance for Bamboo
    const yPosition = 5; // Spawn items at a height of 5
    const zPosition = 0; // Align items to player's z-axis
    const xPosition = 12; // Fixed x position for spawning

    loader.load(`${itemType}.glb`, (gltf) => {
        const item = gltf.scene.clone();
        item.scale.set(itemType === "Bamboo" ? 0.25 : 2, itemType === "Bamboo" ? 0.25 : 2, itemType === "Bamboo" ? 0.25 : 2);
        item.position.set(xPosition, yPosition, zPosition);
        item.userData.type = itemType;
        scene.add(item);
        items.push(item);
    });
}

let playerBoundingBox = new THREE.Box3();
let playerModel = runningModel || jumpingModel;

function updatePlayerBoundingBox() {
    if (playerModel) {
        playerBoundingBox.setFromObject(playerModel);
    }
}

function checkCollisions() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const itemBoundingBox = new THREE.Box3().setFromObject(item);
        if (playerBoundingBox.intersectsBox(itemBoundingBox)) {
            if (item.userData.type === "Bamboo") {
                updateHealth(20); // Gain 20 health
            } else if (item.userData.type === "Chocolate") {
                updateHealth(-40); // Lose 40 health
            }
            scene.remove(item);
            items.splice(i, 1);
        }
    }
}

function updateItems(deltaTime) {
    updatePlayerBoundingBox();
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.position.x -= itemSpeed * deltaTime; // Gradually increasing item speed

        checkCollisions();

        if (item.position.x < -40) {
            scene.remove(item);
            items.splice(i, 1);
        }
    }
}

setInterval(() => {
    if (!isPaused) {
        spawnItem();
    }
}, Math.random() * 2000 + 1000);

function updateTerrain(deltaTime) {
    for (let i = terrainModels.length - 1; i >= 0; i--) {
        const terrain = terrainModels[i];
        terrain.position.x -= moveSpeed * deltaTime;

        // Despawn old terrain
        if (terrain.position.x < -50) {
            scene.remove(terrain);
            terrainModels.splice(i, 1);
        }
    }

    // Spawn new terrain when the last terrain reaches x=0
    if (terrainModels.length > 0) {
        const lastTerrain = terrainModels[terrainModels.length - 1];
        if (lastTerrain.position.x <= 0) {
            spawnTerrain(22);
        }
    } else {
        // If no terrain exists, spawn one at the initial position
        spawnTerrain(22);
    }
}

loader.load("Running.glb", (gltf) => {
    runningModel = gltf.scene;
    runningModel.scale.set(120, 120, 120);
    runningModel.position.set(0, playerCenterDistance, 0); // Align with items on z-axis
    runningModel.rotation.y = Math.PI / 2;
    runningModel.visible = true;
    scene.add(runningModel);

    mixer = new THREE.AnimationMixer(runningModel);
    if (gltf.animations.length > 0) {
        runAction = mixer.clipAction(gltf.animations[0]);
        runAction.loop = THREE.LoopRepeat;
        runAction.play();
    }

    // Add hitbox for running model
    updatePlayerBoundingBox();
});

loader.load("Jump.glb", (gltf) => {
    jumpingModel = gltf.scene;
    jumpingModel.scale.set(120, 120, 120);
    jumpingModel.position.set(0, playerCenterDistance, 0); // Align with items on z-axis
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

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !isJumping) {
            isJumping = true;
            jumpAction.reset();
            jumpAction.play();

            runningModel.visible = false;
            jumpingModel.position.copy(runningModel.position);
            jumpingModel.visible = true;

            velocityY = jumpForce;

            // Update player box helper for jumping model
            playerModel = jumpingModel;
            updatePlayerBoundingBox();
        }
    });
});

function updateJump(deltaTime) {
    if (isJumping) {
        velocityY += gravity * deltaTime;
        jumpingModel.position.y += velocityY;

        if (jumpingModel.position.y <= groundLevel) {
            jumpingModel.position.y = groundLevel;
            isJumping = false;
            runningModel.visible = true;
            jumpingModel.visible = false;

            // Switch back to running model for box helper
            playerModel = runningModel;
            updatePlayerBoundingBox();
        }
    }
}

let lastFrameTime = performance.now();
function animate() {
    if (isPaused) return; // Completely stop the game if paused

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    if (mixer) mixer.update(deltaTime);
    if (jumpMixer) jumpMixer.update(deltaTime);
    updatePlayerBoundingBox();
    updateTerrain(deltaTime);
    updateItems(deltaTime);
    updateJump(deltaTime);
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();
