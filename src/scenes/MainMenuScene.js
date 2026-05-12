// ==========================================
// MAIN MENU SCENE
// Cozy, inviting title screen
// ==========================================

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Background gradient
        const bg = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x667eea
        );
        
        // Create animated background elements
        this.createBackgroundElements();
        
        // Title container
        const titleContainer = this.add.container(
            this.scale.width / 2,
            this.scale.height / 2 - 80
        );
        
        // Main title
        const title = this.add.text(0, 0, 'Fruit Wanderer', {
            fontFamily: 'Segoe UI',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#2C3E50',
            strokeThickness: 8
        });
        title.setOrigin(0.5);
        titleContainer.add(title);
        
        // Subtitle
        const subtitle = this.add.text(0, 60, 'A Cozy Adventure', {
            fontFamily: 'Segoe UI',
            fontSize: '28px',
            color: '#ECF0F1',
            letterSpacing: 4
        });
        subtitle.setOrigin(0.5);
        titleContainer.add(subtitle);
        
        // Animate title
        this.tweens.add({
            targets: title,
            y: -10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Menu buttons container
        const menuContainer = this.add.container(
            this.scale.width / 2,
            this.scale.height / 2 + 100
        );
        
        // New Game button
        this.createMenuButton(
            menuContainer,
            0,
            -40,
            'New Adventure',
            () => this.startNewGame()
        );
        
        // Continue button (if save exists)
        if (window.saveSystem.hasSave()) {
            this.createMenuButton(
                menuContainer,
                0,
                20,
                'Continue Journey',
                () => this.continueGame()
            );
            
            // Show saved progress info
            const saveData = window.saveSystem.getData();
            const progressText = this.add.text(
                0,
                70,
                `Seeds: ${saveData.essenceSeeds} | Time: ${window.saveSystem.getFormattedPlayTime()}`,
                {
                    fontFamily: 'Segoe UI',
                    fontSize: '16px',
                    color: '#BDC3C7'
                }
            );
            progressText.setOrigin(0.5);
            menuContainer.add(progressText);
        }
        
        // Controls hint
        const controlsHint = this.add.text(
            this.scale.width / 2,
            this.scale.height - 60,
            'Arrow Keys / WASD to Move • Shift/Space to Dash • E to Interact',
            {
                fontFamily: 'Segoe UI',
                fontSize: '16px',
                color: '#95A5A6'
            }
        );
        controlsHint.setOrigin(0.5);
        
        // Version/info
        const versionText = this.add.text(
            this.scale.width - 20,
            this.scale.height - 20,
            'v1.0 - A Handcrafted Indie Prototype',
            {
                fontFamily: 'Segoe UI',
                fontSize: '12px',
                color: '#7F8C8D'
            }
        );
        versionText.setOrigin(1);
        
        // Store references for cleanup
        this.menuElements = [bg, titleContainer, menuContainer, controlsHint, versionText];
    }

    /**
     * Create floating background decorations
     */
    createBackgroundElements() {
        // Floating fruit silhouettes
        const fruits = [];
        
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.scale.width;
            const y = Math.random() * this.scale.height;
            const size = randomInt(20, 50);
            const alpha = randomFloat(0.05, 0.15);
            
            const fruit = this.add.circle(x, y, size, 0xFFFFFF, alpha);
            fruits.push(fruit);
            
            // Gentle floating animation
            this.tweens.add({
                targets: fruit,
                y: y - 30,
                duration: randomInt(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: randomInt(0, 2000)
            });
        }
        
        this.backgroundFruits = fruits;
    }

    /**
     * Create a menu button
     */
    createMenuButton(container, x, y, text, callback) {
        const button = this.add.container(x, y);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x2C3E50, 0.8);
        bg.fillRoundedRect(-120, -25, 240, 50, 12);
        bg.lineStyle(2, 0xFFFFFF, 0.5);
        bg.strokeRoundedRect(-120, -25, 240, 50, 12);
        button.add(bg);
        
        // Button text
        const label = this.add.text(0, 0, text, {
            fontFamily: 'Segoe UI',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        });
        label.setOrigin(0.5);
        button.add(label);
        
        // Hover effects
        button.setSize(240, 50);
        button.setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x34495E, 0.9);
            bg.fillRoundedRect(-120, -25, 240, 50, 12);
            bg.lineStyle(2, 0xFFD700, 1);
            bg.strokeRoundedRect(-120, -25, 240, 50, 12);
        });
        
        button.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2C3E50, 0.8);
            bg.fillRoundedRect(-120, -25, 240, 50, 12);
            bg.lineStyle(2, 0xFFFFFF, 0.5);
            bg.strokeRoundedRect(-120, -25, 240, 50, 12);
        });
        
        button.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true
            });
        });
        
        button.on('pointerup', callback);
        
        container.add(button);
    }

    /**
     * Start a new game
     */
    startNewGame() {
        // Reset game data
        window.gameData = {
            essenceSeeds: 0,
            juiceCurrency: 0,
            health: 5,
            maxHealth: 5,
            unlockedAbilities: [],
            defeatedBosses: [],
            collectedSeeds: [],
            currentRegion: 'banana_hills',
            playerPosition: { x: 400, y: 300 }
        };
        
        // Reset ability stats
        window.abilityStats = {
            dashDistance: 100,
            dashCooldown: 500,
            movementSpeed: 200,
            acceleration: 800,
            deceleration: 600,
            maxVelocity: 200
        };
        
        // Clear save and start fresh
        window.saveSystem.reset();
        this.scene.start('BananaHillsScene');
    }

    /**
     * Continue from saved game
     */
    continueGame() {
        const saveData = window.saveSystem.getData();
        
        // Restore game state
        window.gameData.currentRegion = saveData.currentRegion || 'banana_hills';
        window.gameData.playerPosition = saveData.playerPosition || { x: 400, y: 300 };
        
        // Start appropriate scene
        if (window.gameData.currentRegion === 'watermelon_wetlands') {
            this.scene.start('WatermelonWetlandsScene');
        } else {
            this.scene.start('BananaHillsScene');
        }
    }

    /**
     * Cleanup on scene shutdown
     */
    shutdown() {
        if (this.menuElements) {
            this.menuElements.forEach(el => el.destroy());
        }
        if (this.backgroundFruits) {
            this.backgroundFruits.forEach(el => el.destroy());
        }
    }
}

window.MainMenuScene = MainMenuScene;
