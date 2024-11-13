// Simulate asset loading with a delay
function loadGameAssets() {
    // Replace this timeout with actual asset loading logic as needed
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Game assets loaded."); // Placeholder for loading completion
            resolve(); // Resolve the promise after loading is complete
        }, 3000); // Simulate a 3-second loading delay
    });
}

// After assets are loaded, redirect to game.html
loadGameAssets().then(() => {
    window.location.href = "game.html"; // Redirect to the game page
});
