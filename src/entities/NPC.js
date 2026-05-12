// ==========================================
// NPC ENTITY
// Charming, memorable fruit characters
// ==========================================

class NPC extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.setDepth(50);
        
        this.config = config;
        this.id = config.id || `npc_${Date.now()}`;
        this.type = config.type || 'fruit';
        this.fruitType = config.fruitType || 'orange';
        this.dialogue = config.dialogue || null;
        this.mood = config.mood || 'neutral';
        
        // Visual components
        this.body = null;
        this.shadow = null;
        this.eyes = null;
        this.accessories = [];
        
        // Animation
        this.idleTimer = 0;
        this.blinkTimer = 0;
        this.eyesOpen = true;
        
        this.create();
    }

    /**
     * Create NPC visual elements
     */
    create() {
        this.createShadow();
        this.createBody();
        this.createEyes();
        this.createAccessories();
        
        this.scene.physics.add.existing(this, false);
        this.body.setSize(40, 40);
        this.body.setOffset(-20, -20);
        this.body.setImmovable(true);
        
        return this;
    }

    /**
     * Create soft blob shadow
     */
    createShadow() {
        this.shadow = this.scene.add.graphics();
        this.shadow.fillStyle(0x000000, 0.2);
        this.shadow.fillEllipse(0, 22, 36, 18);
        this.add(this.shadow);
    }

    /**
     * Create fruit body based on type
     */
    createBody() {
        const graphics = this.scene.add.graphics();
        
        switch (this.fruitType) {
            case 'banana':
                this.createBananaBody(graphics);
                break;
            case 'watermelon':
                this.createWatermelonBody(graphics);
                break;
            case 'orange':
                this.createOrangeBody(graphics);
                break;
            case 'grape':
                this.createGrapeBody(graphics);
                break;
            case 'strawberry':
                this.createStrawberryBody(graphics);
                break;
            default:
                this.createOrangeBody(graphics);
        }
        
        this.graphics = graphics;
        this.add(this.graphics);
    }

    /**
     * Create banana-shaped body
     */
    createBananaBody(graphics) {
        graphics.fillStyle(COLORS.bananaHills.banana, 1);
        
        // Curved banana shape
        for (let i = 0; i < 40; i++) {
            const t = i / 40;
            const x = -15 + t * 30;
            const curve = Math.sin(t * Math.PI) * 8;
            const y = -curve;
            const radius = 8 - Math.abs(t - 0.5) * 4;
            
            graphics.fillStyle(COLORS.bananaHills.banana, 1);
            graphics.fillCircle(x, y, radius);
        }
        
        // Brown tips
        graphics.fillStyle(COLORS.bananaHills.bananaBrown, 1);
        graphics.fillCircle(-16, 0, 4);
        graphics.fillCircle(16, 0, 4);
    }

    /**
     * Create watermelon body
     */
    createWatermelonBody(graphics) {
        // Main body
        graphics.fillStyle(COLORS.watermelonWetlands.watermelon, 1);
        graphics.fillEllipse(0, 0, 36, 30);
        
        // Stripes
        graphics.fillStyle(COLORS.watermelonWetlands.watermelonDark, 1);
        for (let i = -12; i <= 12; i += 8) {
            graphics.fillRect(i, -12, 3, 24);
        }
        
        // Light belly
        graphics.fillStyle(COLORS.watermelonWetlands.watermelonLight, 1);
        graphics.fillEllipse(0, 5, 20, 12);
    }

    /**
     * Create orange body
     */
    createOrangeBody(graphics) {
        // Main body with gradient effect
        graphics.fillStyle('#FFA500', 1);
        graphics.fillCircle(0, 0, 18);
        
        // Highlight
        graphics.fillStyle('#FFD700', 0.5);
        graphics.fillCircle(-5, -5, 6);
        
        // Shadow
        graphics.fillStyle('#CC8400', 0.3);
        graphics.fillCircle(5, 5, 8);
        
        // Leaf
        graphics.fillStyle('#228B22', 1);
        graphics.fillEllipse(0, -18, 10, 6);
    }

    /**
     * Create grape cluster body
     */
    createGrapeBody(graphics) {
        const grapeColor = '#9B59B6';
        const positions = [
            { x: 0, y: -10, r: 8 },
            { x: -7, y: -3, r: 7 },
            { x: 7, y: -3, r: 7 },
            { x: -5, y: 6, r: 7 },
            { x: 5, y: 6, r: 7 },
            { x: 0, y: 13, r: 6 }
        ];
        
        positions.forEach(pos => {
            graphics.fillStyle(grapeColor, 1);
            graphics.fillCircle(pos.x, pos.y, pos.r);
            
            // Highlight
            graphics.fillStyle('#DDA0DD', 0.5);
            graphics.fillCircle(pos.x - 2, pos.y - 2, 2);
        });
    }

    /**
     * Create strawberry body
     */
    createStrawberryBody(graphics) {
        // Main body
        graphics.fillStyle('#FC5A8D', 1);
        graphics.beginPath();
        graphics.moveTo(0, -15);
        graphics.bezierCurveTo(15, -15, 18, 0, 0, 18);
        graphics.bezierCurveTo(-18, 0, -15, -15, 0, -15);
        graphics.fillPath();
        
        // Seeds
        graphics.fillStyle('#FFF8DC', 0.7);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI + Math.PI;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 8 + 3;
            graphics.fillCircle(x, y, 1.5);
        }
        
        // Leaves
        graphics.fillStyle('#228B22', 1);
        for (let i = 0; i < 5; i++) {
            const angle = ((i / 5) * Math.PI * 2) - Math.PI / 2;
            const lx = Math.cos(angle) * 8;
            const ly = Math.sin(angle) * 8 - 12;
            graphics.fillEllipse(lx, ly, 6, 3);
        }
    }

    /**
     * Create expressive eyes
     */
    createEyes() {
        this.eyes = this.scene.add.container(0, -3);
        
        // Eye whites
        const leftWhite = this.scene.add.graphics();
        leftWhite.fillStyle(0xFFFFFF, 1);
        leftWhite.fillEllipse(-6, 0, 8, 9);
        this.eyes.add(leftWhite);
        
        const rightWhite = this.scene.add.graphics();
        rightWhite.fillStyle(0xFFFFFF, 1);
        rightWhite.fillEllipse(6, 0, 8, 9);
        this.eyes.add(rightWhite);
        
        // Pupils
        const leftPupil = this.scene.add.graphics();
        leftPupil.fillStyle(0x2C3E50, 1);
        leftPupil.fillCircle(-5, 1, 4);
        this.eyes.add(leftPupil);
        
        const rightPupil = this.scene.add.graphics();
        rightPupil.fillStyle(0x2C3E50, 1);
        rightPupil.fillCircle(7, 1, 4);
        this.eyes.add(rightPupil);
        
        // Highlights
        const leftHighlight = this.scene.add.graphics();
        leftHighlight.fillStyle(0xFFFFFF, 1);
        leftHighlight.fillCircle(-4, 0, 2);
        this.eyes.add(leftHighlight);
        
        const rightHighlight = this.scene.add.graphics();
        rightHighlight.fillStyle(0xFFFFFF, 1);
        rightHighlight.fillCircle(8, 0, 2);
        this.eyes.add(rightHighlight);
        
        this.leftPupil = leftPupil;
        this.rightPupil = rightPupil;
        
        this.add(this.eyes);
    }

    /**
     * Create accessories based on character
     */
    createAccessories() {
        if (this.config.accessory === 'hat') {
            const hat = this.scene.add.graphics();
            hat.fillStyle(0xE74C3C, 1);
            hat.fillRoundedRect(-12, -22, 24, 8, 4);
            hat.fillStyle(0xC0392B, 1);
            hat.fillRect(-8, -28, 16, 6);
            this.add(hat);
            this.accessories.push(hat);
        }
        
        if (this.config.accessory === 'scarf') {
            const scarf = this.scene.add.graphics();
            scarf.fillStyle(0x3498DB, 1);
            scarf.fillRoundedRect(-14, 8, 28, 6, 3);
            // Scarf tail
            scarf.fillRoundedRect(8, 10, 6, 15, 2);
            this.add(scarf);
            this.accessories.push(scarf);
        }
        
        if (this.config.accessory === 'glasses') {
            const glasses = this.scene.add.graphics();
            glasses.lineStyle(2, 0x2C3E50, 1);
            glasses.strokeCircle(-6, -2, 7);
            glasses.strokeCircle(6, -2, 7);
            glasses.lineStyle(2, 0x2C3E50, 1);
            glasses.moveTo(1, -2);
            glasses.lineTo(5, -2);
            this.add(glasses);
            this.accessories.push(glasses);
        }
    }

    /**
     * Update NPC (idle animations)
     */
    update(time, delta) {
        this.updateIdleAnimation(time, delta);
        this.updateEyes(time, delta);
    }

    /**
     * Idle breathing animation
     */
    updateIdleAnimation(time, delta) {
        this.idleTimer += delta * 0.002;
        const breath = Math.sin(this.idleTimer) * 0.5;
        this.setScale(1 + breath * 0.02);
        this.y = this.config.y + breath;
    }

    /**
     * Blink eyes periodically
     */
    updateEyes(time, delta) {
        this.blinkTimer += delta;
        
        if (this.blinkTimer > 3000 && this.eyesOpen) {
            this.blink();
            this.blinkTimer = 0;
        }
    }

    /**
     * Perform a blink
     */
    blink() {
        this.eyesOpen = false;
        this.eyes.setVisible(false);
        
        this.scene.time.delayedCall(150, () => {
            this.eyesOpen = true;
            this.eyes.setVisible(true);
        });
    }

    /**
     * Look at a target position
     */
    lookAt(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        const offsetX = Math.cos(angle) * 2;
        const offsetY = Math.sin(angle) * 2;
        
        this.leftPupil.setPosition(-5 + offsetX, 1 + offsetY);
        this.rightPupil.setPosition(7 + offsetX, 1 + offsetY);
    }

    /**
     * Set mood/expression
     */
    setMood(mood) {
        this.mood = mood;
        // Could modify eye shape, add mouth, etc.
    }

    /**
     * Start dialogue
     */
    startDialogue() {
        if (this.dialogue) {
            this.scene.player.startDialogue(this);
        }
    }
}

window.NPC = NPC;
