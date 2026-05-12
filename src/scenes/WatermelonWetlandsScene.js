// ==========================================
// WATERMELON WETLANDS SCENE
// Region 2 - Rainy, misty, flooded wetlands
// ==========================================

class WatermelonWetlandsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WatermelonWetlandsScene' });
    }

    create() {
        // Initialize systems
        this.traversalSystem = new TraversalSystem(this);
        this.dialogue = new DialogueSystem(this).create();
        this.uiManager = new UIManager(this);
        
        // Setup camera
        this.setupCamera();
        
        // Setup input
        this.setupInput();
        
        // Create world
        this.createSky();
        this.createTerrain();
        this.createWater();
        this.createDecorations();
        this.createTraversalZones();
        
        // Create entities
        this.createPlayer();
        this.createNPCs();
        this.createEssenceSeeds();
        
        // Create ambient particles (rain, fireflies)
        this.createAmbientParticles();
        
        // Show region transition
        this.time.delayedCall(500, () => {
            this.uiManager.showRegionTransition('Watermelon Wetlands', 'Where rain remembers everything');
        });
        
        window.gameData.currentRegion = 'watermelon_wetlands';
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, 2048, 1536);
        this.cameras.main.setZoom(0.9);
        this.cameras.main.setBackgroundColor(COLORS.watermelonWetlands.sky);
        
        if (this.player) {
            this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
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
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.isPaused = !this.isPaused;
            this.physics.pause();
            this.uiManager.togglePause(this.isPaused);
        });
        
        this.input.keyboard.on('keydown-E', () => {
            if (!this.isPaused && this.player && this.player.nearNPC && !this.dialogue.isActive) {
                this.player.startDialogue(this.player.nearNPC);
            }
        });
    }

    createSky() {
        const sky = this.add.rectangle(1024, 768, 2048, 1536, COLORS.watermelonWetlands.sky);
        sky.setDepth(-10);
        
        // Moon
        const moon = this.add.circle(1700, 150, 50, '#F4F6F7');
        moon.setDepth(-9);
        
        // Mist layers
        for (let i = 0; i < 5; i++) {
            const mist = this.add.graphics();
            mist.fillStyle(COLORS.watermelonWetlands.mist, 0.1 + i * 0.05);
            mist.fillRect(0, i * 100, 2048, 150);
            mist.setDepth(-8 + i);
        }
    }

    createTerrain() {
        // Ground with water overlay
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(COLORS.watermelonWetlands.watermelonDark, 1);
        groundGraphics.fillRect(0, 400, 2048, 1136);
        
        // Elevated platforms (lily pad style)
        this.createLilyPlatform(400, 350, 250);
        this.createLilyPlatform(900, 280, 200);
        this.createLilyPlatform(1400, 350, 300);
        this.createLilyPlatform(700, 180, 180);
        
        // Ramps
        this.createRamp(600, 350, 100, 50, ELEVATION.GROUND, ELEVATION.LOW);
        this.createRamp(1050, 280, 100, 50, ELEVATION.LOW, ELEVATION.MEDIUM);
    }

    createLilyPlatform(x, y, size) {
        const lily = this.add.graphics();
        lily.fillStyle(COLORS.watermelonWetlands.lilyPad, 1);
        lily.fillCircle(x + size/2, y + size/2, size/2);
        
        // Wedge cutout
        lily.fillStyle(COLORS.watermelonWetlands.watermelonDark, 1);
        lily.beginPath();
        lily.moveTo(x + size/2, y + size/2);
        lily.lineTo(x + size, y);
        lily.lineTo(x + size + 10, y + size/3);
        lily.closePath();
        lily.fillPath();
        
        lily.setDepth(10);
        lily.elevation = ELEVATION.LOW;
    }

    createWater() {
        // Shallow water overlay
        const water = this.add.tileSprite(1024, 968, 2048, 1136, 'water_tile');
        water.setAlpha(0.6);
        water.setDepth(5);
        water.setScrollFactor(0.5);
        
        // Animate water tiles
        this.tweens.add({
            targets: water,
            tilePositionX: 100,
            duration: 5000,
            repeat: -1,
            yoyo: true
        });
    }

    createDecorations() {
        // Watermelon plants
        this.createWatermelonPlant(250, 550);
        this.createWatermelonPlant(800, 650);
        this.createWatermelonPlant(1500, 700);
        
        // Reeds
        this.createReedPatch(350, 600, 8);
        this.createReedPatch(1200, 750, 12);
        
        // Mushrooms
        this.createMushroom(600, 700, 'large');
        this.createMushroom(1100, 800, 'medium');
        this.createMushroom(1600, 600, 'small');
        
        // Stone lanterns
        this.createStoneLantern(500, 500);
        this.createStoneLantern(1400, 550);
        
        // Wooden bridges
        this.createBridge(750, 320, 150);
        
        // Signposts
        this.createSignpost(300, 450, '→ Guardian Pool');
        this.createSignpost(1700, 500, 'Banana Hills ←');
    }

    createWatermelonPlant(x, y) {
        const plant = this.add.container(x, y);
        
        // Vines
        const vines = this.add.graphics();
        vines.lineStyle(4, '#2D5A27', 1);
        for (let i = 0; i < 5; i++) {
            vines.moveTo(0, 0);
            vines.quadraticCurveTo(
                Math.cos(i) * 30,
                -20 - i * 10,
                Math.cos(i) * 50,
                -30 - i * 15
            );
        }
        plant.add(vines);
        
        // Watermelons
        for (let i = 0; i < 3; i++) {
            const melon = this.add.graphics();
            melon.fillStyle(COLORS.watermelonWetlands.watermelon, 1);
            melon.fillEllipse(i * 25 - 25, -40 - i * 10, 30, 25);
            // Stripes
            melon.fillStyle(COLORS.watermelonWetlands.watermelonDark, 1);
            melon.fillRect(i * 25 - 30, -50 - i * 10, 4, 20);
            melon.fillRect(i * 25 - 15, -50 - i * 10, 4, 20);
            plant.add(melon);
        }
        
        plant.setDepth(y);
    }

    createReedPatch(x, y, count) {
        for (let i = 0; i < count; i++) {
            const reed = this.add.graphics();
            reed.fillStyle('#5D8A3A', 1);
            reed.fillRect(-2, -40 - randomInt(0, 20), 4, 40 + randomInt(0, 20));
            
            // Reed top
            reed.fillStyle('#8B7355', 1);
            reed.fillCircle(0, -45 - randomInt(0, 20), 3);
            
            reed.setPosition(x + randomInt(-40, 40), y + randomInt(-20, 20));
            reed.setDepth(reed.y);
            
            // Sway
            this.tweens.add({
                targets: reed,
                rotation: 0.1,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createMushroom(x, y, size) {
        const sizes = { small: 15, medium: 25, large: 40 };
        const r = sizes[size] || 25;
        
        const mushroom = this.add.container(x, y);
        
        // Stem
        const stem = this.add.graphics();
        stem.fillStyle('#F5DEB3', 1);
        stem.fillRect(-r/4, -r, r/2, r);
        mushroom.add(stem);
        
        // Cap
        const cap = this.add.graphics();
        cap.fillStyle('#E74C3C', 1);
        cap.fillCircle(0, -r, r);
        
        // White spots
        cap.fillStyle(0xFFFFFF, 1);
        cap.fillCircle(-r/3, -r - 5, r/5);
        cap.fillCircle(r/3, -r - 8, r/6);
        cap.fillCircle(0, -r + 5, r/6);
        
        mushroom.add(cap);
        mushroom.setDepth(y);
    }

    createStoneLantern(x, y) {
        const lantern = this.add.container(x, y);
        
        // Base
        const base = this.add.graphics();
        base.fillStyle('#7F8C8D', 1);
        base.fillRect(-15, -10, 30, 20);
        lantern.add(base);
        
        // Light chamber
        const chamber = this.add.graphics();
        chamber.fillStyle('#95A5A6', 0.8);
        chamber.fillRect(-10, -35, 20, 25);
        lantern.add(chamber);
        
        // Roof
        const roof = this.add.graphics();
        roof.fillStyle('#7F8C8D', 1);
        roof.beginPath();
        roof.moveTo(-15, -35);
        roof.lineTo(0, -50);
        roof.lineTo(15, -35);
        roof.closePath();
        roof.fillPath();
        lantern.add(roof);
        
        // Glowing light
        const light = this.add.circle(0, -23, 8, 0xFFD700, 0.6);
        lantern.add(light);
        
        // Flicker animation
        this.tweens.add({
            targets: light,
            alpha: 0.4,
            scale: 0.9,
            duration: 200,
            yoyo: true,
            repeat: -1
        });
        
        lantern.setDepth(y);
    }

    createBridge(x, y, width) {
        const bridge = this.add.graphics();
        bridge.fillStyle('#8B4513', 1);
        bridge.fillRoundedRect(x, y, width, 30, 4);
        
        // Planks
        bridge.lineStyle(2, '#6B3410', 0.5);
        for (let i = 0; i < width; i += 15) {
            bridge.moveTo(x + i, y);
            bridge.lineTo(x + i, y + 30);
        }
        
        bridge.setDepth(y - 1);
    }

    createSignpost(x, y, text) {
        const sign = this.add.container(x, y);
        
        const post = this.add.graphics();
        post.fillStyle('#8B4513', 1);
        post.fillRect(-4, 0, 8, 50);
        sign.add(post);
        
        const board = this.add.graphics();
        board.fillStyle('#DEB887', 1);
        board.fillRoundedRect(-40, -30, 80, 35, 4);
        board.lineStyle(2, '#8B4513', 1);
        board.strokeRoundedRect(-40, -30, 80, 35, 4);
        sign.add(board);
        
        const label = this.add.text(0, -12, text, {
            fontFamily: 'Segoe UI',
            fontSize: '14px',
            color: '#2C3E50'
        });
        label.setOrigin(0.5);
        sign.add(label);
        
        sign.setDepth(y);
    }

    createTraversalZones() {
        // Water slowdown zones
        this.traversalSystem.addSurfaceModifier(300, 600, 400, 200, 'water', 1);
        this.traversalSystem.addSurfaceModifier(1000, 700, 300, 150, 'water', 1);
        
        // Slippery wet surfaces
        this.traversalSystem.addSurfaceModifier(600, 400, 150, 80, 'slippery', 0.3);
        
        // Climbable vines
        this.traversalSystem.addClimbableZone(1650, 200, 40, 200, ELEVATION.GROUND, ELEVATION.HIGH);
    }

    createPlayer() {
        const startPos = window.gameData.playerPosition || { x: 300, y: 500 };
        this.player = new Player(this, startPos.x, startPos.y, 'player').initialize();
        this.player.currentElevation = ELEVATION.GROUND;
    }

    createNPCs() {
        this.npcs = [];
        
        // Thoughtful watermelon NPC
        const melonNPC = new NPC(this, 700, 600, {
            id: 'melon_thoughtful',
            fruitType: 'watermelon',
            dialogue: {
                pages: [
                    {
                        speaker: 'Thoughtful Melon',
                        text: "Sometimes I think the rain remembers things we've forgotten. Each drop carries a story..."
                    },
                    {
                        speaker: 'Thoughtful Melon',
                        text: "The Guardian below... it wasn't always so troubled. The Bowl's influence changes us all."
                    }
                ]
            }
        });
        this.npcs.push(melonNPC);
        
        // Energetic grape NPC
        const grapeNPC = new NPC(this, 1300, 650, {
            id: 'grape_scout',
            fruitType: 'grape',
            accessory: 'scarf',
            dialogue: {
                pages: [
                    {
                        speaker: 'Scout Grape',
                        text: "Hey! You're the wanderer, right? I've been mapping these wetlands for weeks!"
                    },
                    {
                        speaker: 'Scout Grape',
                        text: "Watch out for the deep pools - the current can be tricky. But the views from above? Totally worth it!"
                    }
                ]
            }
        });
        this.npcs.push(grapeNPC);
    }

    createEssenceSeeds() {
        this.seeds = [];
        
        const seedConfigs = [
            { id: 'wetland_seed_1', x: 500, y: 320, elevation: ELEVATION.LOW },
            { id: 'wetland_seed_2', x: 950, y: 250, elevation: ELEVATION.MEDIUM },
            { id: 'wetland_seed_3', x: 1500, y: 320, elevation: ELEVATION.LOW },
            { id: 'wetland_seed_4', x: 1800, y: 700, elevation: ELEVATION.GROUND },
            { id: 'wetland_seed_5', x: 400, y: 800, elevation: ELEVATION.GROUND }
        ];
        
        seedConfigs.forEach(config => {
            if (window.gameData.collectedSeeds.includes(config.id)) return;
            
            const seed = this.add.sprite(config.x, config.y, 'essence_seed');
            seed.setDepth(config.y);
            seed.setData('id', config.id);
            seed.setData('collected', false);
            
            this.tweens.add({
                targets: seed,
                scaleX: 1.1,
                scaleY: 1.1,
                alpha: 0.8,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.tweens.add({
                targets: seed,
                y: config.y - 10,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            seed.collect = () => {
                if (seed.getData('collected')) return;
                seed.setData('collected', true);
                
                this.tweens.add({
                    targets: seed,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 300,
                    ease: 'Back.in',
                    onComplete: () => seed.destroy()
                });
                
                const particles = this.add.particles(seed.x, seed.y, 'essence_seed', {
                    speed: 50,
                    scale: { start: 0.5, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 500,
                    quantity: 10,
                    blendMode: 'ADD'
                });
                
                this.time.delayedCall(500, () => particles.destroy());
            };
            
            this.seeds.push(seed);
        });
    }

    createAmbientParticles() {
        // Rain
        const rainEmitter = this.add.particles(0, 0, 'water_tile', {
            speed: 200,
            scale: { start: 0.2, end: 0.2 },
            alpha: { start: 0.4, end: 0.2 },
            lifespan: 800,
            quantity: 2,
            frequency: 50,
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, 2048, 1536),
                type: 'random'
            },
            blendMode: 'ADD'
        });
        rainEmitter.setDepth(1000);
        
        // Fireflies
        for (let i = 0; i < 20; i++) {
            const firefly = this.add.circle(
                randomInt(200, 1800),
                randomInt(300, 1000),
                3,
                0xFFFF00,
                0.8
            );
            firefly.setDepth(firefly.y + 50);
            
            this.tweens.add({
                targets: firefly,
                x: firefly.x + randomInt(-80, 80),
                y: firefly.y + randomInt(-40, 40),
                alpha: 0.4,
                duration: randomInt(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    update(time, delta) {
        if (this.player) {
            this.player.update(time, delta);
        }
        
        if (this.npcs) {
            this.npcs.forEach(npc => npc.update(time, delta));
        }
        
        if (this.player && !this.isPaused) {
            this.cameras.main.followOffset.set(0, -100);
        }
        
        if (time % 30000 < delta) {
            this.player?.saveProgress();
        }
    }
}

window.WatermelonWetlandsScene = WatermelonWetlandsScene;
