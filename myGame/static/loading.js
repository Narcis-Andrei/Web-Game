import * as THREE from 'three';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

// List of game assets
const assets = [
    "Assets/3D_objects/Bamboo.glb",
    "Assets/3D_objects/Chocolate.glb",
    "Assets/3D_objects/Jump.glb",
    "Assets/3D_objects/Panda.glb",
    "Assets/3D_objects/Running.glb",
    "Assets/3D_objects/Ter1.glb",
    "Assets/Textures/T_PandaW_B.png"
];

let assetsLoaded = 0;
const totalAssets = assets.length;

// Load an image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        console.log(`Loading image: ${src}`);
        const img = new Image();
        img.src = src;
        img.onload = () => {
            assetsLoaded++;
            updateLoadingProgress();
            console.log(`Loaded image successfully: ${src}`);
            resolve();
        };
        img.onerror = (error) => {
            console.error(`Failed to load image: ${src}`, error);
            reject(error);
        };
    });
}

// Load GLTF files
function loadGLTF(src) {
    return new Promise((resolve, reject) => {
        console.log(`Loading GLTF: ${src}`);
        const loader = new GLTFLoader();
        loader.load(
            src,
            (gltf) => {
                assetsLoaded++;
                updateLoadingProgress();
                console.log(`Loaded GLTF successfully: ${src}`);
                resolve(gltf);
            },
            undefined,
            (error) => {
                console.error(`Failed to load GLTF: ${src}`, error);
                reject(error);
            }
        );
    });
}

// Load correct files
function loadAsset(src) {
    if (src.endsWith('.glb')) {
        return loadGLTF(src); // GLTFLoader for .glb files
    } else if (src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg')) {
        return loadImage(src); // Image for texture files
    } else {
        return Promise.reject(new Error(`Unsupported asset type: ${src}`));
    }
}

// Update loading progress on screen
function updateLoadingProgress() {
    const loadingText = document.getElementById("loading-text");
    loadingText.textContent = `Loading game assets: ${assetsLoaded}/${totalAssets}...`;
    if (assetsLoaded === totalAssets) {
        loadingText.textContent = "All assets loaded! Starting game...";
    }
}

// Load all game assets and redirect to the game page
async function loadGameAssets() {
    updateLoadingProgress();

    try {
        // Load assets and handle errors
        await Promise.all(
            assets.map((asset) =>
                loadAsset(asset).catch((error) => {
                    console.error(`Error loading asset: ${asset}`, error);
                    throw new Error(`Failed to load asset: ${asset}`);
                })
            )
        );

        // Redirect to the game page after all assets are loaded
        window.location.href = "game.html";
    } catch (error) {
        console.error("Error loading assets:", error);
        const loadingText = document.getElementById("loading-text");
        loadingText.textContent = error.message || "Failed to load assets. Please try again.";
    }
}

// Start loading assets
loadGameAssets();
