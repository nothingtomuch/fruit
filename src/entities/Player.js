// ==========================================
// PLAYER ENTITY
// Smooth, cozy movement-focused character
// ==========================================

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.setOrigin(0.5, 0.5);
        this.setDepth(100);
        
        // Movement state
        this.currentState = PLAYER_STATES.IDLE;
        this.currentElevation = ELEVATION.GROUND;
        this.facing = 'down';
        
        // Movement physics
        this.velocity = { x: 0, y: 0 };
        this.acceleration = window.abilityStats.acceleration;
        this.deceleration = window.abilityStats.deceleration;
        this.maxVelocity = window.abilityStats.maxVelocity;
        this.friction = 0.92;
        
        // Dash mechanics
        this.canDash = true;
        this.isDashing = false;
        this.dashCooldown = window.abilityStats.dashCooldown;
        this.dashDistance = window.abilityStats.dashDistance;
        this.dashSpeed = 600;
        this.lastDashTime = 0;
        
        // Visual components
        this.shadow = null;
        this.trailEmitter = null;
        this.idleTimer = 0;
        this.bobOffset = 0;
        
        // Interaction
        this.nearNPC = null;
        this.nearSeed = null;
        this.nearTransition = null;
        
        // Animation
        this.animFrame = 0;
        this.animSpeed = 0.2;
    }

    /**
     * Initialize player with all visual elements
     */
    initialize() {
        this.createShadow();
        this.createTrailEmitter();
        this.setupAnimations();
        
        this.scene.physics.add.existing(this);
        this.body.setSize(32, 32);
        this.body.setOffset(-8, -8);
        this.body.setCollideWorldBounds(true);
        
        return this;
    }

    /**
     * Create soft blob shadow
     */
    createShadow() {
        this.shadow = this.scene.add.image(this.x, this.y + 16, '');
        this.shadow.setDisplaySize(40, 20);
        this.shadow.setAlpha(0.3);
        this.shadow.setDepth(this.depth - 1);
    }

    /**
     * Create dash trail particle emitter
     */
    createTrailEmitter() {
        const particles = this.scene.make.graphics({ x: 0, y: 0, add: false });
        particles.fillStyle(COLORS.bananaHills.banana, 0.6);
        particles.fillCircle(8, 8, 8);
        particles.generateTexture('player_trail_particle', 16, 16);
        particles.destroy();

        this.trailEmitter = this.scene.add.particles(0, 0, 'player_trail_particle', {
            speed: 50,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            quantity: 2,
            blendMode: 'ADD',
            followOffset: { x: 0, y: 0 },
            emitting: false
        });
        this.trailEmitter.setDepth(this.depth - 1);
    }

    /**
     * Setup idle and movement animations
     */
    setupAnimations() {
        // Idle bob animation handled in update
        // Movement wobble handled procedurally
    }

    /**
     * Update player state and physics
     */
    update(time, delta) {
        if (this.scene.dialogue && this.scene.dialogue.isActive) {
            this.handleDialogueInput();
            return;
        }

        this.updateMovement(time, delta);
        this.updateVisuals(time, delta);
        this.updateInteractions();
        this.updateShadow();
    }

    /**
     * Handle movement input and physics
     */
    updateMovement(time, delta) {
        const cursors = this.scene.cursors;
        const wasd = this.scene.wasd;
        
        if (this.isDashing || this.currentState === PLAYER_STATES.INTERACTING) {
            return;
        }

        // Get input direction
        let inputX = 0;
        let inputY = 0;

        if (cursors.left.isDown || wasd.left.isDown) inputX -= 1;
        if (cursors.right.isDown || wasd.right.isDown) inputX += 1;
        if (cursors.up.isDown || wasd.up.isDown) inputY -= 1;
        if (cursors.down.isDown || wasd.down.isDown) inputY += 1;

        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
            const length = Math.sqrt(inputX * inputX + inputY * inputY);
            inputX /= length;
            inputY /= length;
        }

        // Apply acceleration
        if (inputX !== 0 || inputY !== 0) {
            this.velocity.x += inputX * this.acceleration * (delta / 1000);
            this.velocity.y += inputY * this.acceleration * (delta / 1000);
            
            this.currentState = PLAYER_STATES.WALKING;
            
            // Update facing direction
            if (Math.abs(inputX) > Math.abs(inputY)) {
                this.facing = inputX > 0 ? 'right' : 'left';
            } else {
                this.facing = inputY > 0 ? 'down' : 'up';
            }
        } else {
            // Apply deceleration
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            
            if (Math.abs(this.velocity.x) < 5) this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 5) this.velocity.y = 0;
            
            if (this.velocity.x === 0 && this.velocity.y === 0) {
                this.currentState = PLAYER_STATES.IDLE;
            }
        }

        // Apply surface modifiers from traversal system
        if (this.scene.traversalSystem) {
            const modified = this.scene.traversalSystem.applySurfaceEffects(
                this.velocity,
                this.x,
                this.y,
                window.abilityStats
            );
            this.velocity.x = modified.x;
            this.velocity.y = modified.y;
        }

        // Clamp velocity
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxVelocity) {
            this.velocity.x = (this.velocity.x / speed) * this.maxVelocity;
            this.velocity.y = (this.velocity.y / speed) * this.maxVelocity;
        }

        // Apply velocity to body
        this.body.setVelocity(this.velocity.x, this.velocity.y);

        // Check for dash input
        if (this.scene.input.keyboard.addKey('Shift').isDown || 
            this.scene.input.keyboard.addKey('SPACE').isDown) {
            this.tryDash();
        }
    }

    /**
     * Perform a dash
     */
    tryDash() {
        const now = Date.now();
        if (!this.canDash || now - this.lastDashTime < this.dashCooldown) {
            return;
        }

        // Need movement direction to dash
        if (this.velocity.x === 0 && this.velocity.y === 0) {
            return;
        }

        this.isDashing = true;
        this.canDash = false;
        this.lastDashTime = now;

        // Calculate dash direction
        const dashAngle = Math.atan2(this.velocity.y, this.velocity.x);
        const dashVelX = Math.cos(dashAngle) * this.dashSpeed;
        const dashVelY = Math.sin(dashAngle) * this.dashSpeed;

        this.body.setVelocity(dashVelX, dashVelY);
        this.trailEmitter.startFollow(this);
        this.trailEmitter.emit = true;

        // Play dash sound/effect here

        // End dash after duration
        this.scene.time.delayedCall(150, () => {
            this.isDashing = false;
            this.trailEmitter.emit = false;
            
            // Cooldown recovery
            this.scene.time.delayedCall(this.dashCooldown - 150, () => {
                this.canDash = true;
            });
        });
    }

    /**
     * Update visual elements
     */
    updateVisuals(time, delta) {
        // Idle bobbing
        if (this.currentState === PLAYER_STATES.IDLE) {
            this.idleTimer += delta * 0.003;
            this.y += Math.sin(this.idleTimer) * 0.1;
            this.setScale(1 + Math.sin(this.idleTimer * 2) * 0.02);
        }

        // Walking wobble
        if (this.currentState === PLAYER_STATES.WALKING) {
            this.animFrame += this.animSpeed;
            const wobble = Math.sin(this.animFrame) * 0.05;
            this.setRotation(wobble * (this.facing === 'left' ? -1 : 1));
            this.setScale(1 + Math.abs(Math.sin(this.animFrame)) * 0.03);
        }

        // Reset rotation when stopping
        if (this.currentState === PLAYER_STATES.IDLE) {
            this.setRotation(Phaser.Math.Linear(this.rotation, 0, 0.1));
        }
    }

    /**
     * Update shadow position
     */
    updateShadow() {
        if (this.shadow) {
            this.shadow.x = this.x;
            this.shadow.y = this.y + 16;
            this.shadow.setDepth(this.depth - 1);
            
            // Shadow scales with elevation
            const elevationScale = 1 - (this.currentElevation * 0.1);
            this.shadow.setScale(elevationScale * 0.8, elevationScale * 0.4);
        }
    }

    /**
     * Check for nearby interactables
     */
    updateInteractions() {
        // Check NPCs
        if (this.scene.npcs) {
            let nearestNPC = null;
            let nearestDist = 60;

            for (const npc of this.scene.npcs) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, npc.x, npc.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestNPC = npc;
                }
            }

            this.nearNPC = nearestNPC;
        }

        // Check seeds
        if (this.scene.seeds) {
            for (const seed of this.scene.seeds) {
                if (!seed.collected) {
                    const dist = Phaser.Math.Distance.Between(this.x, this.y, seed.x, seed.y);
                    if (dist < 40) {
                        this.collectSeed(seed);
                        break;
                    }
                }
            }
        }

        // Show interaction prompt
        if (this.nearNPC) {
            this.showInteractionPrompt('E');
        }
    }

    /**
     * Show interaction prompt
     */
    showInteractionPrompt(key) {
        if (!this.interactionPrompt) {
            this.interactionPrompt = this.scene.add.container(this.x, this.y - 40);
            this.interactionPrompt.setDepth(1000);
            
            const bg = this.scene.add.graphics();
            bg.fillStyle(0xFFFFFF, 0.9);
            bg.fillCircle(0, 0, 16);
            bg.lineStyle(2, 0x2C3E50, 1);
            bg.strokeCircle(0, 0, 16);
            
            const text = this.scene.add.text(0, 0, key, {
                fontFamily: 'Segoe UI',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#2C3E50'
            });
            text.setOrigin(0.5);
            
            this.interactionPrompt.add(bg);
            this.interactionPrompt.add(text);
        }
        
        this.interactionPrompt.setPosition(this.x, this.y - 40);
        this.interactionPrompt.setVisible(true);
    }

    /**
     * Hide interaction prompt
     */
    hideInteractionPrompt() {
        if (this.interactionPrompt) {
            this.interactionPrompt.setVisible(false);
        }
    }

    /**
     * Collect an essence seed
     */
    collectSeed(seed) {
        seed.collect();
        
        // Update game data
        window.gameData.essenceSeeds++;
        window.saveSystem.addToArrayField('collectedSeeds', seed.id);
        
        // Upgrade abilities every few seeds
        if (window.gameData.essenceSeeds % 3 === 0) {
            this.upgradeAbilities();
        }
        
        // Save game
        this.saveProgress();
    }

    /**
     * Upgrade movement abilities
     */
    upgradeAbilities() {
        window.abilityStats.dashDistance += 20;
        window.abilityStats.movementSpeed += 10;
        window.abilityStats.maxVelocity += 15;
        
        this.dashDistance = window.abilityStats.dashDistance;
        this.maxVelocity = window.abilityStats.maxVelocity;
        
        // Show upgrade notification
        this.scene.uiManager?.showUpgradeNotification();
    }

    /**
     * Handle dialogue input
     */
    handleDialogueInput() {
        if (this.scene.input.keyboard.addKey('E').isDown) {
            this.scene.dialogue.advance();
        }
    }

    /**
     * Start dialogue with NPC
     */
    startDialogue(npc) {
        this.currentState = PLAYER_STATES.INTERACTING;
        this.body.setVelocity(0, 0);
        
        if (npc && npc.dialogue) {
            this.scene.dialogue.start(npc.dialogue, () => {
                this.currentState = PLAYER_STATES.IDLE;
            });
        }
    }

    /**
     * Save progress
     */
    saveProgress() {
        window.saveSystem.save({
            essenceSeeds: window.gameData.essenceSeeds,
            juiceCurrency: window.gameData.juiceCurrency,
            collectedSeeds: window.gameData.collectedSeeds,
            currentRegion: window.gameData.currentRegion,
            playerPosition: { x: this.x, y: this.y },
            defeatedBosses: window.gameData.defeatedBosses,
            unlockedAbilities: window.gameData.unlockedAbilities
        });
    }

    /**
     * Transition to new elevation
     */
    transitionElevation(newElevation, x, y) {
        this.currentElevation = newElevation;
        this.setPosition(x, y);
        
        // Landing effect
        this.createLandingParticles();
    }

    /**
     * Create landing particles
     */
    createLandingParticles() {
        const particles = this.scene.add.particles(this.x, this.y, 'player_trail_particle', {
            speed: 30,
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 200,
            quantity: 5,
            emitting: false
        });
        
        particles.explode(5, this.x, this.y);
        
        this.scene.time.delayedCall(200, () => {
            particles.destroy();
        });
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        window.gameData.health = Math.max(0, window.gameData.health - amount);
        this.scene.uiManager?.updateHealth();
        
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3
        });

        if (window.gameData.health <= 0) {
            this.onDeath();
        }
    }

    /**
     * Handle player death
     */
    onDeath() {
        // Respawn at last checkpoint
        this.scene.time.delayedCall(1000, () => {
            window.gameData.health = window.gameData.maxHealth;
            this.setPosition(400, 300);
            this.body.setVelocity(0, 0);
            this.scene.uiManager?.updateHealth();
        });
    }

    /**
     * Destroy player
     */
    destroy() {
        if (this.shadow) this.shadow.destroy();
        if (this.trailEmitter) this.trailEmitter.destroy();
        if (this.interactionPrompt) this.interactionPrompt.destroy();
        super.destroy();
    }
}

window.Player = Player;
