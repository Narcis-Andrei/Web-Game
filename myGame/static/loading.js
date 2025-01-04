// List of game assets to preload
const assets = [
    "Assets/3D objects/Bamboo.glb",
    "Assets/3D objects/Chocolate.glb",
    "Assets/3D objects/Jump.glb",
    "Assets/3D objects/Panda.glb",
    "Assets/3D objects/Running.glb",
    "Assets/3D objects/Ter1.glb",
    "Assets/Textures/T_PandaW_B.png"
];

let assetsLoaded = 0;
const totalAssets = assets.length;

// Function to load an image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            assetsLoaded++;
            updateLoadingProgress();
            resolve();
        };
        img.onerror = reject;
    });
}

// Function to update progress
function updateLoadingProgress() {
    const loadingText = document.getElementById("loading-text");
    loadingText.textContent = `Loading game assets: ${assetsLoaded}/${totalAssets}...`;
}

// Load all assets and redirect when done
async function loadGameAssets() {
    // Show initial progress
    updateLoadingProgress();

    try {
        // Load each asset and wait for all to complete
        await Promise.all(assets.map(asset => loadImage(asset)));

        // Redirect to the game page once all assets are loaded
        window.location.href = "game.html";
    } catch (error) {
        console.error("Error loading assets:", error);
        const loadingText = document.getElementById("loading-text");
        loadingText.textContent = "Failed to load assets. Please try again.";
    }
}

// Start loading assets
loadGameAssets();
