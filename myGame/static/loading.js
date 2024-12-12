// List of game assets to preload
const assets = [
    // More assets here
];

let assetsLoaded = 0;
const totalAssets = assets.length;

// Function to load an image
function loadImage(src) {
    //An object representing the eventual completion or failure of the next operation
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
    loadingText.textContent = "Loading game assets: ${assetsLoaded}/${totalAssets}...";
}

// Load all assets and redirect when done
async function loadGameAssets() {
    // Show initial progress
    updateLoadingProgress();

    // Load each asset and wait for all to complete
    await Promise.all(assets.map(asset => loadImage(asset)));

    // Redirect to the game page once all assets are loaded
    window.location.href = "game.html";
}

// Start loading assets
loadGameAssets().catch(error => {
    console.error("Error loading assets:", error);
});
