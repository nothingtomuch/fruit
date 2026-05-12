// ==========================================
// BOSS ARENA SCENE
// Emotional guardian battles
// ==========================================

class BossArenaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossArenaScene' });
    }

    create(data) {
        this.bossType = data.bossType || 'banana';
        
        // Initialize systems
        this.traversalSystem = new TraversalSystem(this);
        this.dialogue = new DialogueSystem(this).create();
        this.uiManager = new UIManager(this);
        
        // Setup camera
        this.setupCamera();
        
        // Setup input
        this.setupInput();
        
        // Create arena
        this.createSky();
        this.createArena();
        this.createDecorations();
        
        // Create player and boss
        this.createPlayer();
        this.createBoss();
        
        // Start boss encounter
        this.time.delayedCall(1000, () => {
            this.startEncounter();
        });
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, 1024, 768);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        if (this.player) {
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        }
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        this.input.keyboard.on('keydown-E', () => {
            if (this.player && this.player.nearNPC && !this.dialogue.isActive) {
                this.player.startDialogue(this.player.nearNPC);
            }
        });
    }

    createSky() {
        const skyColor = this.bossType === 'banana' 
            ? COLORS.bananaHills.sky 
            : COLORS.watermelonWetlands.sky;
        
        const sky = this.add.rectangle(512, 384, 1024, 768, skyColor);
        sky.setDepth(-10);
    }

    createArena() {
        // Arena floor
        const floor = this.add.graphics();
        
        if (this.bossType === 'banana') {
            // Banana King shrine - elevated circular platform
            floor.fillStyle(COLORS.bananaHills.grass, 1);
            floor.fillCircle(512, 450, 300);
            
            // Stone ring
            floor.lineStyle(20, COLORS.bananaHills.dirt, 1);
            floor.strokeCircle(512, 450, 300);
            
            // Inner decoration
            floor.lineStyle(5, COLORS.bananaHills.banana, 0.5);
            floor.strokeCircle(512, 450, 250);
        } else {
            // Watermelon Guardian pool - water arena
            floor.fillStyle(COLORS.watermelonWetlands.water, 0.8);
            floor.fillEllipse(512, 450, 500, 400);
            
            // Stone border
            floor.lineStyle(25, '#7F8C8D', 1);
            floor.strokeEllipse(512, 450, 500, 400);
            
            // Lily pads as platforms
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const px = 512 + Math.cos(angle) * 150;
                const py = 450 + Math.sin(angle) * 100;
                floor.fillStyle(COLORS.watermelonWetlands.lilyPad, 1);
                floor.fillCircle(px, py, 40);
            }
        }
        
        floor.setDepth(1);
        
        // Arena boundaries
        this.physics.add.existing(floor, false);
        floor.body.setSize(600, 600);
        floor.body.setOffset(212, 150);
        floor.body.setImmovable(true);
    }

    createDecorations() {
        if (this.bossType === 'banana') {
            // Shrine decorations
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = 512 + Math.cos(angle) * 320;
                const y = 450 + Math.sin(angle) * 320;
                
                const pillar = this.add.graphics();
                pillar.fillStyle('#DEB887', 1);
                pillar.fillRect(x - 10, y - 40, 20, 80);
                pillar.setDepth(y);
            }
            
            // Floating petals
            for (let i = 0; i < 20; i++) {
                const petal = this.add.ellipse(
                    randomInt(300, 700),
                    randomInt(300, 600),
                    15, 8,
                    COLORS.bananaHills.banana,
                    0.6
                );
                petal.setDepth(petal.y);
                
                this.tweens.add({
                    targets: petal,
                    y: petal.y - 20,
                    rotation: Math.PI,
                    duration: randomInt(3000, 6000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } else {
            // Mist effects
            for (let i = 0; i < 5; i++) {
                const mist = this.add.graphics();
                mist.fillStyle(COLORS.watermelonWetlands.mist, 0.15);
                mist.fillRect(0, i * 100, 1024, 80);
                mist.setDepth(100 + i);
                
                this.tweens.add({
                    targets: mist,
                    x: 50,
                    duration: 8000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
            
            // Floating lanterns
            for (let i = 0; i < 6; i++) {
                const lantern = this.add.circle(
                    200 + i * 150,
                    200 + Math.sin(i) * 50,
                    8,
                    0xFFD700,
                    0.6
                );
                lantern.setDepth(150);
                
                this.tweens.add({
                    targets: lantern,
                    y: lantern.y - 15,
                    alpha: 0.4,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    createPlayer() {
        this.player = new Player(this, 300, 450, 'player').initialize();
        this.player.currentElevation = ELEVATION.GROUND;
    }

    createBoss() {
        const bossConfig = {
            id: `boss_${this.bossType}`,
            maxHealth: 100,
            attacks: [
                { type: 'projectile', speed: 150, recovery: 1500, color: 0xFFD700 },
                { type: 'projectile', speed: 200, recovery: 1200, color: 0xFFA500 },
                { type: 'area', recovery: 2000 }
            ]
        };
        
        if (this.bossType === 'banana') {
            bossConfig.name = 'The Banana King';
            bossConfig.fruitType = 'banana';
        } else {
            bossConfig.name = 'The Watermelon Guardian';
            bossConfig.fruitType = 'watermelon';
        }
        
        this.boss = new Boss(this, 700, 450, bossConfig);
    }

    startEncounter() {
        // Show boss introduction
        this.uiManager.showNotification(`${this.boss.name} awaits!`, '#E74C3C', 2000);
        
        // Boss pre-fight dialogue
        const dialogue = {
            pages: [
                {
                    speaker: this.boss.name,
                    text: "Another seeker... drawn by the Bowl's empty promise..."
                },
                {
                    speaker: this.boss.name,
                    text: "I have guarded this place for ages. But the darkness... it whispers to me now."
                },
                {
                    speaker: this.boss.name,
                    text: "Prove your worth, wanderer. Show me that hope still exists in this fading world!"
                }
            ]
        };
        
        this.dialogue.start(dialogue, () => {
            this.battleActive = true;
        });
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(time, delta);
        }
        
        if (this.boss) {
            this.boss.update(time, delta);
        }
        
        // Check battle end
        if (this.boss && this.boss.currentState === BOSS_STATES.DEFEATED) {
            this.endBattle();
        }
    }

    endBattle() {
        if (this.battleEnded) return;
        this.battleEnded = true;
        
        // Victory dialogue
        const victoryDialogue = {
            pages: [
                {
                    speaker: this.boss.name,
                    text: "I... I feel it. The weight is lifting. The Bowl's grip... weakening..."
                },
                {
                    speaker: this.boss.name,
                    text: "Thank you, wanderer. You have given me peace. Take this essence - it is yours by right."
                }
            ]
        };
        
        this.time.delayedCall(1000, () => {
            this.dialogue.start(victoryDialogue, () => {
                // Grant reward
                window.gameData.essenceSeeds += 3;
                
                // Return to previous region or show ending
                this.time.delayedCall(2000, () => {
                    if (this.bossType === 'banana') {
                        this.scene.start('WatermelonWetlandsScene');
                    } else {
                        this.showEnding();
                    }
                });
            });
        });
    }

    showEnding() {
        // End game sequence
        const overlay = this.add.container(0, 0);
        overlay.setDepth(10000);
        
        const bg = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.9);
        overlay.add(bg);
        
        const title = this.add.text(512, 280, '🌟 The Balance is Restored 🌟', {
            fontFamily: 'Segoe UI',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFD700',
            align: 'center'
        });
        title.setOrigin(0.5);
        overlay.add(title);
        
        const credits = this.add.text(512, 400, 
`Essence Seeds Collected: ${window.gameData.essenceSeeds}
Guardians Calmed: ${window.gameData.defeatedBosses.length}

"A tiny handcrafted indie adventure"

Thank you for playing!`,
            {
                fontFamily: 'Segoe UI',
                fontSize: '20px',
                color: '#ECF0F1',
                align: 'center',
                lineSpacing: 10
            }
        );
        credits.setOrigin(0.5);
        overlay.add(credits);
        
        const continueText = this.add.text(512, 550, 'Press ENTER to return to menu', {
            fontFamily: 'Segoe UI',
            fontSize: '18px',
            color: '#95A5A6'
        });
        continueText.setOrigin(0.5);
        overlay.add(continueText);
        
        overlay.setAlpha(0);
        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 1000
        });
        
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('MainMenuScene');
        });
    }
}

window.BossArenaScene = BossArenaScene;
