// ==========================================
// BOSS ENTITY
// Emotional guardian battles - restorative, not violent
// ==========================================

class Boss extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.setDepth(200);
        
        this.config = config;
        this.id = config.id || `boss_${Date.now()}`;
        this.name = config.name || 'Guardian';
        this.fruitType = config.fruitType || 'banana';
        
        // Battle state
        this.currentState = BOSS_STATES.IDLE;
        this.phase = 1;
        this.health = config.maxHealth || 100;
        this.maxHealth = config.maxHealth || 100;
        this.isInvulnerable = false;
        
        // Attack patterns
        this.attacks = config.attacks || [];
        this.currentAttack = null;
        this.attackTimer = 0;
        this.attackCooldown = 2000;
        
        // Visual components
        this.body = null;
        this.shadow = null;
        this.eyes = null;
        this.aura = null;
        this.healthBar = null;
        
        // Animation
        this.idleTimer = 0;
        this.floatOffset = 0;
        
        this.create();
    }

    /**
     * Create boss visual elements
     */
    create() {
        this.createShadow();
        this.createBody();
        this.createEyes();
        this.createAura();
        this.createHealthBar();
        
        this.scene.physics.add.existing(this, false);
        this.body.setSize(80, 80);
        this.body.setOffset(-40, -40);
        this.body.setImmovable(true);
        
        return this;
    }

    /**
     * Create large shadow
     */
    createShadow() {
        this.shadow = this.scene.add.graphics();
        this.shadow.fillStyle(0x000000, 0.3);
        this.shadow.fillEllipse(0, 45, 70, 35);
        this.add(this.shadow);
    }

    /**
     * Create boss body based on type
     */
    createBody() {
        const graphics = this.scene.add.graphics();
        
        switch (this.fruitType) {
            case 'banana':
                this.createBananaKingBody(graphics);
                break;
            case 'watermelon':
                this.createWatermelonGuardianBody(graphics);
                break;
            default:
                this.createBananaKingBody(graphics);
        }
        
        this.body = graphics;
        this.add(this.body);
    }

    /**
     * Banana King body - large regal banana
     */
    createBananaKingBody(graphics) {
        // Crown
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillTriangle(-15, -50, 0, -70, 15, -50);
        graphics.fillTriangle(-25, -48, -15, -65, -5, -48);
        graphics.fillTriangle(25, -48, 15, -65, 5, -48);
        
        // Jewel in crown
        graphics.fillStyle(0xE74C3C, 1);
        graphics.fillCircle(0, -55, 5);
        
        // Main banana body (larger than player)
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const x = -25 + t * 50;
            const curve = Math.sin(t * Math.PI) * 15;
            const y = -curve;
            const radius = 15 - Math.abs(t - 0.5) * 8;
            
            graphics.fillStyle(COLORS.bananaHills.banana, 1);
            graphics.fillCircle(x, y, radius);
        }
        
        // Brown tips
        graphics.fillStyle(COLORS.bananaHills.bananaBrown, 1);
        graphics.fillCircle(-28, 0, 8);
        graphics.fillCircle(28, 0, 8);
        
        // Regal sash
        graphics.fillStyle(0x9B59B6, 1);
        graphics.fillRect(-20, -10, 40, 8);
    }

    /**
     * Watermelon Guardian body - massive watermelon
     */
    createWatermelonGuardianBody(graphics) {
        // Main body (much larger)
        graphics.fillStyle(COLORS.watermelonWetlands.watermelon, 1);
        graphics.fillEllipse(0, 0, 70, 60);
        
        // Dark stripes
        graphics.fillStyle(COLORS.watermelonWetlands.watermelonDark, 1);
        for (let i = -25; i <= 25; i += 12) {
            graphics.fillRect(i, -28, 6, 56);
        }
        
        // Light belly
        graphics.fillStyle(COLORS.watermelonWetlands.watermelonLight, 1);
        graphics.fillEllipse(0, 12, 40, 24);
        
        // Ancient markings
        graphics.fillStyle(0xFFD700, 0.5);
        graphics.lineStyle(3, 0xFFD700, 0.7);
        graphics.strokeCircle(0, -10, 20);
        graphics.strokeCircle(0, -10, 30);
        
        // Mystical symbols
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sx = Math.cos(angle) * 25;
            const sy = Math.sin(angle) * 20 - 10;
            graphics.fillStyle(0xFFD700, 0.8);
            graphics.fillCircle(sx, sy, 3);
        }
    }

    /**
     * Create intense boss eyes
     */
    createEyes() {
        this.eyes = this.scene.add.container(0, -5);
        
        // Eye whites (larger, more intense)
        const leftWhite = this.scene.add.graphics();
        leftWhite.fillStyle(0xFFFFFF, 1);
        leftWhite.fillEllipse(-15, 0, 18, 20);
        this.eyes.add(leftWhite);
        
        const rightWhite = this.scene.add.graphics();
        rightWhite.fillStyle(0xFFFFFF, 1);
        rightWhite.fillEllipse(15, 0, 18, 20);
        this.eyes.add(rightWhite);
        
        // Pupils (red when angry)
        const leftPupil = this.scene.add.graphics();
        leftPupil.fillStyle(0xE74C3C, 1);
        leftPupil.fillCircle(-12, 2, 8);
        this.eyes.add(leftPupil);
        
        const rightPupil = this.scene.add.graphics();
        rightPupil.fillStyle(0xE74C3C, 1);
        rightPupil.fillCircle(18, 2, 8);
        this.eyes.add(rightPupil);
        
        // Angry eyebrows
        const leftBrow = this.scene.add.graphics();
        leftBrow.fillStyle(0x2C3E50, 1);
        leftBrow.fillRect(-20, -15, 18, 5);
        this.eyes.add(leftBrow);
        
        const rightBrow = this.scene.add.graphics();
        rightBrow.fillStyle(0x2C3E50, 1);
        rightBrow.fillRect(2, -15, 18, 5);
        this.eyes.add(rightBrow);
        
        this.leftPupil = leftPupil;
        this.rightPupil = rightPupil;
        
        this.add(this.eyes);
    }

    /**
     * Create magical aura effect
     */
    createAura() {
        this.aura = this.scene.add.graphics();
        this.aura.setAlpha(0.3);
        this.addAt(this.aura, 0);
    }

    /**
     * Create health bar
     */
    createHealthBar() {
        this.healthBar = this.scene.add.container(0, -80);
        
        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2C3E50, 0.8);
        bg.fillRoundedRect(-50, 0, 100, 12, 6);
        this.healthBar.add(bg);
        
        // Health fill
        this.healthFill = this.scene.add.graphics();
        this.healthFill.fillStyle(0xE74C3C, 1);
        this.healthFill.fillRoundedRect(-48, 2, 96, 8, 4);
        this.healthBar.add(this.healthFill);
        
        // Border
        const border = this.scene.add.graphics();
        border.lineStyle(2, 0xFFFFFF, 1);
        border.strokeRoundedRect(-50, 0, 100, 12, 6);
        this.healthBar.add(border);
        
        this.add(this.healthBar);
    }

    /**
     * Update boss
     */
    update(time, delta) {
        if (this.currentState === BOSS_STATES.DEFEATED) {
            return;
        }
        
        this.updateIdleAnimation(time, delta);
        this.updateAura(time, delta);
        this.updateBehavior(time, delta);
    }

    /**
     * Floating idle animation
     */
    updateIdleAnimation(time, delta) {
        this.idleTimer += delta * 0.0015;
        this.floatOffset = Math.sin(this.idleTimer) * 8;
        this.y = this.config.y + this.floatOffset;
        
        // Subtle rotation
        const rot = Math.sin(this.idleTimer * 0.5) * 0.05;
        this.setRotation(rot);
    }

    /**
     * Pulsing aura
     */
    updateAura(time, delta) {
        if (!this.aura) return;
        
        this.aura.clear();
        
        const pulse = (Math.sin(this.idleTimer * 3) + 1) * 0.5;
        const alpha = 0.2 + pulse * 0.3;
        const size = 50 + pulse * 15;
        
        // Phase-based aura color
        let auraColor = 0xFFD700;
        if (this.phase === 2) auraColor = 0xFFA500;
        if (this.phase === 3) auraColor = 0x8B4513;
        
        this.aura.fillStyle(auraColor, alpha);
        this.aura.fillCircle(0, 0, size);
    }

    /**
     * Boss behavior AI
     */
    updateBehavior(time, delta) {
        this.attackTimer += delta;
        
        if (this.attackTimer >= this.attackCooldown && 
            this.currentState !== BOSS_STATES.ATTACKING) {
            this.performAttack();
        }
        
        // Track player
        if (this.scene.player) {
            this.lookAt(this.scene.player.x, this.scene.player.y);
        }
    }

    /**
     * Perform an attack
     */
    performAttack() {
        if (this.isInvulnerable) return;
        
        this.currentState = BOSS_STATES.ATTACKING;
        this.attackTimer = 0;
        
        // Select attack based on phase
        const attackIndex = Math.floor(Math.random() * Math.min(this.phase, this.attacks.length));
        const attack = this.attacks[attackIndex] || this.attacks[0];
        
        this.executeAttack(attack);
    }

    /**
     * Execute specific attack
     */
    executeAttack(attack) {
        // Telegraph attack
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                // Launch attack
                if (attack.type === 'projectile') {
                    this.launchProjectile(attack);
                } else if (attack.type === 'charge') {
                    this.chargeAttack(attack);
                } else if (attack.type === 'area') {
                    this.areaAttack(attack);
                }
                
                // Recovery
                this.scene.time.delayedCall(attack.recovery || 1000, () => {
                    this.currentState = BOSS_STATES.IDLE;
                });
            }
        });
    }

    /**
     * Launch projectile
     */
    launchProjectile(attack) {
        if (!this.scene.player) return;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        
        const projectile = this.scene.add.circle(this.x, this.y, 12, attack.color || 0xFFD700);
        this.scene.physics.add.existing(projectile);
        
        const speed = attack.speed || 200;
        projectile.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        this.scene.time.delayedCall(3000, () => {
            projectile.destroy();
        });
    }

    /**
     * Charge at player
     */
    chargeAttack(attack) {
        // Implementation for charge attack
    }

    /**
     * Area of effect attack
     */
    areaAttack(attack) {
        // Implementation for AoE attack
    }

    /**
     * Look at target
     */
    lookAt(targetX, targetY) {
        if (!this.leftPupil || !this.rightPupil) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        const offsetX = Math.cos(angle) * 4;
        const offsetY = Math.sin(angle) * 4;
        
        this.leftPupil.setPosition(-12 + offsetX, 2 + offsetY);
        this.rightPupil.setPosition(18 + offsetX, 2 + offsetY);
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.isInvulnerable) return;
        
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
        
        // Flash effect
        this.scene.tweens.add({
            targets: this.body,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
        
        // Check phase change
        this.checkPhaseChange();
        
        // Check defeat
        if (this.health <= 0) {
            this.onDefeat();
        }
    }

    /**
     * Update health bar display
     */
    updateHealthBar() {
        if (!this.healthFill) return;
        
        this.healthFill.clear();
        
        const percent = this.health / this.maxHealth;
        const width = 96 * percent;
        
        // Color changes with health
        let color = 0xE74C3C;
        if (percent > 0.6) color = 0x27AE60;
        else if (percent > 0.3) color = 0xF39C12;
        
        this.healthFill.fillStyle(color, 1);
        this.healthFill.fillRoundedRect(-48, 2, width, 8, 4);
    }

    /**
     * Check for phase transition
     */
    checkPhaseChange() {
        const oldPhase = this.phase;
        
        if (this.health < this.maxHealth * 0.33) {
            this.phase = 3;
        } else if (this.health < this.maxHealth * 0.66) {
            this.phase = 2;
        }
        
        if (this.phase !== oldPhase) {
            this.onPhaseChange(this.phase);
        }
    }

    /**
     * Handle phase transition
     */
    onPhaseChange(newPhase) {
        this.currentState = BOSS_STATES.PHASE_CHANGE;
        this.isInvulnerable = true;
        
        // Dramatic effect
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                this.isInvulnerable = false;
                this.currentState = BOSS_STATES.IDLE;
                this.attackCooldown = Math.max(500, this.attackCooldown - 300);
            }
        });
        
        // Announce phase
        if (this.scene.uiManager) {
            const phaseNames = ['', 'Unripe', 'Ripe', 'Overripe'];
            this.scene.uiManager.showBossPhase(phaseNames[newPhase]);
        }
    }

    /**
     * Handle boss defeat - restorative, not violent
     */
    onDefeat() {
        this.currentState = BOSS_STATES.DEFEATED;
        
        // Calming transformation
        this.scene.tweens.add({
            targets: this.eyes,
            alpha: 0.5,
            duration: 1000
        });
        
        // Change eye color to peaceful
        this.leftPupil.clear();
        this.leftPupil.fillStyle(0x27AE60, 1);
        this.leftPupil.fillCircle(-12, 2, 8);
        this.rightPupil.clear();
        this.rightPupil.fillStyle(0x27AE60, 1);
        this.rightPupil.fillCircle(18, 2, 8);
        
        // Aura becomes calm
        this.scene.tweens.add({
            targets: this.aura,
            alpha: 0.1,
            scale: 0.8,
            duration: 2000
        });
        
        // Float up peacefully
        this.scene.tweens.add({
            targets: this,
            y: this.y - 100,
            alpha: 0.7,
            duration: 3000,
            ease: 'Sine.easeOut'
        });
        
        // Record victory
        window.gameData.defeatedBosses.push(this.id);
        window.saveSystem.addToArrayField('defeatedBosses', this.id);
        
        // Show victory message
        if (this.scene.uiManager) {
            this.scene.uiManager.showBossDefeated(this.name);
        }
        
        // Save progress
        window.saveSystem.save({
            defeatedBosses: window.gameData.defeatedBosses
        });
    }
}

window.Boss = Boss;
