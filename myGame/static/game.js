import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

// Scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let isGameOver = false; // Track game over
let isPaused = false; // Track pause

// Adjust camera and UI
function adjustCameraAndUI() {
    if (window.innerWidth < 768) {
        camera.fov = 75;
        camera.position.set(0, 2, 8);
    } else {
        camera.fov = 100;
        camera.position.set(0, 2, 5);
    }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Adjust game over screen
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (gameOverOverlay) {
        gameOverOverlay.style.fontSize = window.innerWidth < 480 ? '3vw' : window.innerWidth < 768 ? '2.5vw' : '1.5rem';
        gameOverOverlay.style.padding = window.innerWidth < 480 ? '10px' : window.innerWidth < 768 ? '20px' : '30px';

        const buttons = gameOverOverlay.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.fontSize = window.innerWidth < 480 ? '0.8rem' : window.innerWidth < 768 ? '1rem' : '1.2rem';
            button.style.padding = window.innerWidth < 480 ? '8px 16px' : window.innerWidth < 768 ? '10px 20px' : '12px 24px';
        });
    }

    // UI adjustments
    const healthElement = document.getElementById('healthDisplay');
    const scoreElement = document.getElementById('Score');
    const pauseMenu = document.getElementById('pauseMenu');

    if (healthElement) {
        healthElement.style.fontSize = window.innerWidth < 480 ? '5vw' : window.innerWidth < 768 ? '4vw' : '20px';
    }
    if (scoreElement) {
        scoreElement.style.fontSize = window.innerWidth < 480 ? '5vw' : window.innerWidth < 768 ? '4vw' : '20px';
    }
    if (pauseMenu) {
        pauseMenu.style.fontSize = window.innerWidth < 480 ? '1.2rem' : window.innerWidth < 768 ? '1.5rem' : '2rem';
        pauseMenu.style.padding = window.innerWidth < 480 ? '10px' : window.innerWidth < 768 ? '15px' : '20px';

        const buttons = pauseMenu.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.fontSize = window.innerWidth < 480 ? '0.8rem' : window.innerWidth < 768 ? '0.9rem' : '1rem';
            button.style.padding = window.innerWidth < 480 ? '6px 12px' : window.innerWidth < 768 ? '8px 16px' : '10px 20px';
        });
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', adjustCameraAndUI);
adjustCameraAndUI();

// Audio Listener to camera
const listener = new THREE.AudioListener();
camera.add(listener);

// Load Audio Files
const audioLoader = new THREE.AudioLoader();

const sounds = {
    backgroundMusic1: new THREE.Audio(listener),
    backgroundMusic2: new THREE.Audio(listener),
    gameOverSound: new THREE.Audio(listener),
    nomSound: new THREE.Audio(listener),
    oughSound: new THREE.Audio(listener),
};

// Load and play sound
audioLoader.load("/Assets/Sound/Music.mp3", (buffer) => {
    sounds.backgroundMusic1.setBuffer(buffer);
    sounds.backgroundMusic1.setLoop(true);
    sounds.backgroundMusic1.setVolume(0.5);
    sounds.backgroundMusic1.play();
});

audioLoader.load("/Assets/Sound/Music2.mp3", (buffer) => {
    sounds.backgroundMusic2.setBuffer(buffer);
    sounds.backgroundMusic2.setLoop(true);
    sounds.backgroundMusic2.setVolume(0.5);
    sounds.backgroundMusic2.play();
});

audioLoader.load("/Assets/Sound/GameOver.mp3", (buffer) => {
    sounds.gameOverSound.setBuffer(buffer);
    sounds.gameOverSound.setVolume(1.0);
});

audioLoader.load("/Assets/Sound/Nom.mp3", (buffer) => {
    sounds.nomSound.setBuffer(buffer);
    sounds.nomSound.setVolume(1.0);
});

audioLoader.load("/Assets/Sound/Ough.mp3", (buffer) => {
    sounds.oughSound.setBuffer(buffer);
    sounds.oughSound.setVolume(1.0);
});

// Event listener to start audio after user interaction
document.body.addEventListener("click", () => {
    if (!sounds.backgroundMusic1.isPlaying) {
        sounds.backgroundMusic1.play();
    }
    if (!sounds.backgroundMusic2.isPlaying) {
        sounds.backgroundMusic2.play();
    }
}, { once: true });

// Generate particles
function createParticles(position, color) {
    const particleCount = 85;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = position.x + Math.random() - 0.5; // x
        positions[i * 3 + 1] = position.y + Math.random() - 0.5; // y
        positions[i * 3 + 2] = position.z + Math.random() - 0.5; // z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: color,
        size: 0.2,
        transparent: true,
        opacity: 0.5,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animate particles
    let duration = 1.5;
    let elapsed = 0;

    function animateParticles(deltaTime) {
        elapsed += deltaTime;
        if (elapsed > duration) {
            scene.remove(particles);
            return;
        }
        material.opacity = Math.max(0, material.opacity - deltaTime / duration);
        requestAnimationFrame(() => animateParticles(0.016));
    }
    animateParticles(0.016);
}

// HTML Elements
const scoreElement = document.getElementById('Score');
const healthElement = document.getElementById('healthDisplay');
const pauseMenu = document.getElementById('pauseMenu');

let score = 0;
let health = 100;
let isJumping = false;
let velocityY = 0;
const gravity = -1.5;
const jumpForce = 0.2;
const groundLevel = 1;

// Terrain and spawnables
let moveSpeed = 2;
const minSpawnInterval = 0.5;
let itemSpeed = 2;

const terrainModels = [];
const items = [];

// Update score and increase item speed
setInterval(() => {
    if (!isPaused && !isGameOver) {
        score += 1;
        scoreElement.innerText = `Score: ${score}`;

        // Increase in speed
        moveSpeed = Math.min(10, 2 + score * 0.05);
        itemSpeed = Math.min(20, itemSpeed + 0.1);
    }
}, 1000);

// Decrease health
setInterval(() => {
    if (!isPaused && !isGameOver) {
        updateHealth(-5);
    }
}, 2000);

// Pause menu
function togglePause() {
    if (isGameOver) return;

    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? 'block' : 'none';

    // Resize the UI
    adjustCameraAndUI();

    if (!isPaused) {
        lastFrameTime = performance.now();
        animate(); // Resume game loop
    }
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape' && !isGameOver) {
        togglePause();
    }
});

// Health display
function updateHealth(amount) {
    health = Math.max(0, health + amount);
    if (healthElement) {
        healthElement.innerText = `Health: ${health}`;
    }

    // Game Over if health is 0
    if (health === 0 && !isGameOver) {
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        if (gameOverOverlay) {
            gameOverOverlay.style.display = 'flex';
        }
    
        // Resize the UI
        adjustCameraAndUI();
    
        // Send the highest score before freezing the game
        sendHighestScore(score);
    
        isGameOver = true; // Set game over state
        freezeGame();
    }
}

function freezeGame() {
    // Stop everything if game over and pause are true
    isPaused = true;
}

// Send player stats to the backend
async function sendHighestScore(currentScore) {
    const playerId = localStorage.getItem('userId');

    if (!playerId) {
        return;
    }

    try {
        // Get current score
        const response = await fetch(`http://localhost:3000/get-score?id=${playerId}`);
        
        if (!response.ok) {
            console.error("Failed to fetch current score. Status:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response text:", text);
            return;
        }

        const data = await response.json();

        const existingScore = data.score;
        const highestScore = Math.max(existingScore, currentScore);

        // Send high score to database
        const updateResponse = await fetch('http://localhost:3000/update-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: playerId, score: highestScore }),
        });

        if (!updateResponse.ok) {
            console.error("Failed to update the score. Status:", updateResponse.status, updateResponse.statusText);
            const text = await updateResponse.text();
            console.error("Response text:", text);
            return;
        }

    } catch (error) {
        console.error('Error updating score:', error);
    }
}

// Game over logic
function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    
    console.log("Game Over");

    // Play game over sound
    if (!sounds.gameOverSound.isPlaying) {
        sounds.gameOverSound.play();
        console.log("Game Over sound played.");
    } else {
        console.log("Game Over sound is already playing.");
    }

    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (gameOverOverlay) {
        gameOverOverlay.style.display = 'flex';
    }
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

// GLTFLoader
const loader = new GLTFLoader().setPath("Assets/3D_objects/");
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

// Spawn terrain at start
spawnTerrain(-10);
spawnTerrain(10);

function spawnItem() {
    const itemType = Math.random() < 0.6 ? "Bamboo" : "Chocolate";
    const yPosition = 5;
    const zPosition = 0;
    const xPosition = 12;

    loader.load(`${itemType}.glb`, (gltf) => {
        const item = gltf.scene.clone();
        item.scale.set(itemType === "Bamboo" ? 0.25 : 2, itemType === "Bamboo" ? 0.25 : 2, itemType === "Bamboo" ? 0.25 : 2);
        item.position.set(xPosition, yPosition, zPosition);
        item.rotation.set(145, 120, 70)
        item.userData.type = itemType;
        scene.add(item);
        items.push(item);
    });
}

// Hitbox
let playerBoundingBox = new THREE.Box3();
let playerModel = runningModel || jumpingModel;

function updatePlayerBoundingBox() {
    if (playerModel) {
        playerBoundingBox.setFromObject(playerModel);
    }
}

// Collision
function checkCollisions() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const itemBoundingBox = new THREE.Box3().setFromObject(item);
        if (playerBoundingBox.intersectsBox(itemBoundingBox)) {
            const itemPosition = item.position.clone();
            if (item.userData.type === "Bamboo") {
                sounds.nomSound.play();
                updateHealth(10);
                createParticles(itemPosition, 0x00ff00);
            } else if (item.userData.type === "Chocolate") {
                sounds.oughSound.play();
                updateHealth(-60);
                createParticles(itemPosition, 0xff0000);
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
        item.position.x -= itemSpeed * deltaTime;

        checkCollisions();

        if (item.position.x < -40) {
            scene.remove(item);
            items.splice(i, 1);
        }
    }
}

setInterval(() => {
    if (!isPaused && !isGameOver) {
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

    // Spawn new terrain when the previous terrain reaches 0
    if (terrainModels.length > 0) {
        const lastTerrain = terrainModels[terrainModels.length - 1];
        if (lastTerrain.position.x <= 0) {
            spawnTerrain(22);
        }
    } else {
        // If no terrain exists, spawn one
        spawnTerrain(22);
    }
}

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

    updatePlayerBoundingBox();
});

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

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !isJumping) {
            isJumping = true;
            jumpAction.reset();
            jumpAction.play();

            runningModel.visible = false;
            jumpingModel.position.copy(runningModel.position);
            jumpingModel.visible = true;

            velocityY = jumpForce;

            // Update player hitbox for jumping model
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

            // Switch back to running model for hitbox
            playerModel = runningModel;
            updatePlayerBoundingBox();
        }
    }
}

let lastFrameTime = performance.now();
function animate() {
    if (isPaused || isGameOver) {
        renderer.render(scene, camera);
        return;
    }

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
