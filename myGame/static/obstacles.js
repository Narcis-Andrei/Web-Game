import * as THREE from "three";

export class ObstacleManager {
    constructor(scene, player, updateHealthCallback) {
        this.scene = scene;                   // The Three.js scene
        this.player = player;                 // The player model for collision detection
        this.updateHealth = updateHealthCallback; // Callback to update health
        this.obstacles = [];                  // Array to store obstacles
        this.spawnInterval = 2000;            // Time between obstacle spawns
        this.lastSpawnTime = performance.now();
        this.speed = 0.05;                    // Speed of obstacles
    }

    spawnObstacle() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const obstacle = new THREE.Mesh(geometry, material);

        // Set the initial position off screen to the right
        obstacle.position.set(10, 1, 0);
        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }

    update() {
        const currentTime = performance.now();
    
        // Spawn new obstacles at regular intervals
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = currentTime;
            this.speed += 0.001; // Gradually increase speed
        }
    
        // Update all obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.position.x -= this.speed; // Move obstacle toward the player
    
            // Check for collisions with the player
            if (this.checkCollision(obstacle, this.player)) {
                console.log("Collision detected!");
                this.updateHealth(10); // Reduce health by 10
                this.scene.remove(obstacle); // Remove the obstacle
                this.obstacles.splice(index, 1); // Remove from array
            }
    
            // Remove obstacles that move off screen
            if (obstacle.position.x < -10) {
                this.scene.remove(obstacle);
                this.obstacles.splice(index, 1);
            }
        });
    }
    

    checkCollision(obstacle, player) {
        if (!player || !obstacle) return false;
    
        // Create bounding boxes for player and obstacle
        const playerBox = new THREE.Box3().setFromObject(player);
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    
        // Check for intersection
        return playerBox.intersectsBox(obstacleBox);
    }
}