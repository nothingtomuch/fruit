// ==========================================
// BANANA HILLS SCENE
// Region 1 - Warm, sunny, slippery hills
// ==========================================

class BananaHillsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BananaHillsScene' });
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
        this.createDecorations();
        this.createTraversalZones();
        
        // Create entities
        this.createPlayer();
        this.createNPCs();
        this.createEssenceSeeds();
        
        // Create ambient particles
        this.createAmbientParticles();
        
        // Show region transition
        this.time.delayedCall(500, () => {
            this.uiManager.showRegionTransition('Banana Hills', 'Where the sun always smiles');
        });
        
        window.gameData.currentRegion = 'banana_hills';
    }

    /**
     * Setup camera with gentle 2.5D angle
     */
    setupCamera() {
        this.cameras.main.setBounds(0, 0, 2048, 1536);
        this.cameras.main.setZoom(0.9);
        this.cameras.main.setBackgroundColor(COLORS.bananaHills.sky);
        
        // Camera follows player with smooth easing
        if (this.player) {
            this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        }
    }

    /**
     * Setup keyboard input
     */
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // Pause on ESC
        this.input.keyboard.on('keydown-ESC', () => {
            this.isPaused = !this.isPaused;
            this.physics.pause();
            this.uiManager.togglePause(this.isPaused);
        });
        
        // Interaction on E
        this.input.keyboard.on('keydown-E', () => {
            if (!this.isPaused && this.player && this.player.nearNPC && !this.dialogue.isActive) {
                this.player.startDialogue(this.player.nearNPC);
            }
        });
    }

    /**
     * Create gradient sky background
     */
    createSky() {
        const sky = this.add.rectangle(
            1024, 768, 2048, 1536,
            COLORS.bananaHills.sky
        );
        sky.setDepth(-10);
        sky.setScrollFactor(0);
        
        // Sun
        const sun = this.add.circle(1800, 200, 80, COLORS.bananaHills.sun);
        sun.setDepth(-9);
        sun.setScrollFactor(0);
        
        // Sun glow
        const sunGlow = this.add.circle(1800, 200, 120, COLORS.bananaHills.sun, 0.3);
        sunGlow.setDepth(-9);
        sunGlow.setScrollFactor(0);
        
        // Clouds
        this.createClouds();
    }

    /**
     * Create fluffy clouds
     */
    createClouds() {
        const cloudPositions = [
            { x: 300, y: 150 }, { x: 600, y: 200 }, { x: 900, y: 120 },
            { x: 1200, y: 180 }, { x: 1500, y: 140 }, { x: 180, y: 280 }
        ];
        
        cloudPositions.forEach(pos => {
            const cloud = this.add.container(pos.x, pos.y);
            
            // Cloud puffs
            for (let i = 0; i < 5; i++) {
                const puff = this.add.circle(
                    i * 25 - 50,
                    Math.sin(i) * 10,
                    randomInt(25, 40),
                    COLORS.bananaHills.cloud,
                    0.9
                );
                cloud.add(puff);
            }
            
            cloud.setDepth(-8);
            cloud.setScrollFactor(0.3);
            
            // Gentle drift
            this.tweens.add({
                targets: cloud,
                x: pos.x + 50,
                duration: randomInt(8000, 15000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    /**
     * Create terrain with elevation layers
     */
    createTerrain() {
        // Ground layer (elevation 0)
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(COLORS.bananaHills.grass, 1);
        groundGraphics.fillRect(0, 400, 2048, 1136);
        
        // Add terrain texture pattern
        for (let y = 400; y < 1536; y += 64) {
            for (let x = 0; x < 2048; x += 64) {
                const tile = this.add.image(x + 32, y + 32, 'grass_tile');
                tile.setDepth(1);
            }
        }
        
        // Elevated platforms
        this.createElevatedPlatform(400, 350, 300, 40, ELEVATION.LOW);
        this.createElevatedPlatform(900, 280, 250, 40, ELEVATION.MEDIUM);
        this.createElevatedPlatform(1400, 350, 350, 40, ELEVATION.LOW);
        this.createElevatedPlatform(700, 180, 200, 30, ELEVATION.HIGH);
        
        // Ramps connecting elevations
        this.createRamp(650, 350, 100, 50, ELEVATION.GROUND, ELEVATION.LOW);
        this.createRamp(1100, 280, 100, 50, ELEVATION.LOW, ELEVATION.MEDIUM);
        
        // Register elevation layers
        this.traversalSystem.addElevationLayer('ground', ELEVATION.GROUND, [
            { x: 0, y: 400 }, { x: 2048, y: 400 }, { x: 2048, y: 1536 }, { x: 0, y: 1536 }
        ]);
        
        this.traversalSystem.addElevationLayer('platform1', ELEVATION.LOW, [
            { x: 400, y: 350 }, { x: 700, y: 350 }, { x: 700, y: 390 }, { x: 400, y: 390 }
        ]);
    }

    /**
     * Create an elevated platform
     */
    createElevatedPlatform(x, y, width, height, elevation) {
        const graphics = this.add.graphics();
        
        // Top surface
        graphics.fillStyle(COLORS.bananaHills.grass, 1);
        graphics.fillRoundedRect(x, y, width, height, 8);
        
        // Side (cliff face)
        graphics.fillStyle(COLORS.bananaHills.dirt, 1);
        graphics.fillRect(x, y + height, width, 30);
        
        // Edge highlight
        graphics.lineStyle(3, COLORS.bananaHills.grassDark, 0.5);
        graphics.strokeRoundedRect(x, y, width, height, 8);
        
        graphics.setDepth(10);
        
        // Add collision
        this.physics.add.existing(graphics, false);
        graphics.body.setSize(width, height);
        graphics.body.setOffset(0, 0);
        graphics.body.setImmovable(true);
        
        // Store elevation data
        graphics.elevation = elevation;
        
        return graphics;
    }

    /**
     * Create a ramp between elevations
     */
    createRamp(x, y, width, height, fromElev, toElev) {
        const graphics = this.add.graphics();
        
        // Ramp surface
        graphics.fillStyle(COLORS.bananaHills.dirt, 1);
        graphics.beginPath();
        graphics.moveTo(x, y);
        graphics.lineTo(x + width, y - height);
        graphics.lineTo(x + width, y);
        graphics.closePath();
        graphics.fillPath();
        
        graphics.setDepth(5);
        
        // Register as transition point
        this.traversalSystem.addTransitionPoint(
            x, y - height, width, height,
            fromElev, toElev, 'ramp'
        );
        
        return graphics;
    }

    /**
     * Create traversal zones (slippery areas, climbable vines, etc.)
     */
    createTraversalZones() {
        // Slippery banana peel patches
        this.traversalSystem.addSurfaceModifier(500, 500, 150, 80, 'slippery', 0.5);
        this.traversalSystem.addSurfaceModifier(1200, 600, 120, 60, 'slippery', 0.3);
        
        // Climbable vine
        this.traversalSystem.addClimbableZone(1600, 200, 40, 200, ELEVATION.GROUND, ELEVATION.HIGH);
        
        // Visual vine
        const vine = this.add.graphics();
        vine.lineStyle(8, '#228B22', 1);
        for (let y = 200; y < 400; y += 20) {
            vine.moveTo(1620, y);
            vine.lineTo(1620, y + 15);
            // Leaves
            vine.fillStyle('#2E8B2E', 1);
            vine.fillEllipse(1625, y + 7, 12, 6);
        }
        vine.setDepth(50);
    }

    /**
     * Create environmental decorations
     */
    createDecorations() {
        // Trees
        this.createTree(200, 500);
        this.createTree(400, 700);
        this.createTree(800, 550);
        this.createTree(1500, 600);
        this.createTree(1800, 800);
        
        // Flowers
        this.createFlowerPatch(300, 600, 10);
        this.createFlowerPatch(1000, 700, 15);
        this.createFlowerPatch(1600, 900, 8);
        
        // Rocks
        this.createRock(600, 650, 'large');
        this.createRock(1100, 750, 'medium');
        this.createRock(1400, 500, 'small');
        
        // Banana plants
        this.createBananaPlant(750, 450);
        this.createBananaPlant(1300, 550);
        
        // Bench
        this.createBench(500, 550);
        
        // Signpost
        this.createSignpost(300, 450, '→ Boss Shrine');
        this.createSignpost(1700, 500, 'Wetlands ←');
        
        // Campfire
        this.createCampfire(900, 650);
    }

    /**
     * Create a stylized tree
     */
    createTree(x, y) {
        const tree = this.add.container(x, y);
        
        // Trunk
        const trunk = this.add.graphics();
        trunk.fillStyle('#8B4513', 1);
        trunk.fillRect(-8, -20, 16, 40);
        tree.add(trunk);
        
        // Foliage (layered circles)
        const foliage = this.add.graphics();
        foliage.fillStyle(COLORS.bananaHills.grassDark, 1);
        foliage.fillCircle(0, -35, 35);
        foliage.fillCircle(-20, -25, 25);
        foliage.fillCircle(20, -25, 25);
        foliage.fillCircle(0, -15, 20);
        tree.add(foliage);
        
        tree.setDepth(y);
        
        // Gentle sway
        this.tweens.add({
            targets: foliage,
            rotation: 0.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create a patch of flowers
     */
    createFlowerPatch(x, y, count) {
        const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#F7FFF7'];
        
        for (let i = 0; i < count; i++) {
            const fx = x + randomInt(-50, 50);
            const fy = y + randomInt(-30, 30);
            
            const flower = this.add.graphics();
            const color = colors[randomInt(0, colors.length - 1)];
            flower.fillStyle(color, 1);
            
            // Simple flower shape
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * Math.PI * 2;
                const px = Math.cos(angle) * 5;
                const py = Math.sin(angle) * 5;
                flower.fillCircle(px, py, 3);
            }
            flower.fillStyle('#FFD700', 1);
            flower.fillCircle(0, 0, 3);
            
            flower.setDepth(fy);
        }
    }

    /**
     * Create a rock
     */
    createRock(x, y, size) {
        const sizes = { small: 15, medium: 25, large: 40 };
        const radius = sizes[size] || 25;
        
        const rock = this.add.graphics();
        rock.fillStyle('#7F8C8D', 1);
        rock.fillCircle(0, 0, radius);
        rock.fillStyle('#95A5A6', 0.5);
        rock.fillCircle(-radius/3, -radius/3, radius/2);
        
        rock.setPosition(x, y);
        rock.setDepth(y);
        
        // Shadow
        const shadow = this.add.ellipse(x, y + radius, radius * 1.5, radius * 0.5, 0x000000, 0.2);
        shadow.setDepth(y - 1);
    }

    /**
     * Create a banana plant
     */
    createBananaPlant(x, y) {
        const plant = this.add.container(x, y);
        
        // Large leaves
        for (let i = 0; i < 5; i++) {
            const leaf = this.add.graphics();
            leaf.fillStyle('#228B22', 1);
            leaf.fillEllipse(
                Math.cos(i * 0.5) * 20,
                -30 - i * 15,
                40,
                15
            );
            leaf.setRotation(i * 0.3 - 0.6);
            plant.add(leaf);
        }
        
        // Hanging bananas
        const bananas = this.add.graphics();
        bananas.fillStyle(COLORS.bananaHills.banana, 1);
        for (let i = 0; i < 3; i++) {
            bananas.fillCircle(i * 12 - 12, -60, 6);
        }
        plant.add(bananas);
        
        plant.setDepth(y);
    }

    /**
     * Create a bench
     */
    createBench(x, y) {
        const bench = this.add.graphics();
        bench.fillStyle('#8B4513', 1);
        bench.fillRect(-30, -10, 60, 8); // Seat
        bench.fillRect(-25, 0, 6, 20); // Leg
        bench.fillRect(19, 0, 6, 20); // Leg
        bench.fillRect(-30, -25, 60, 6); // Back
        
        bench.setPosition(x, y);
        bench.setDepth(y);
    }

    /**
     * Create a signpost
     */
    createSignpost(x, y, text) {
        const sign = this.add.container(x, y);
        
        // Post
        const post = this.add.graphics();
        post.fillStyle('#8B4513', 1);
        post.fillRect(-4, 0, 8, 50);
        sign.add(post);
        
        // Board
        const board = this.add.graphics();
        board.fillStyle('#DEB887', 1);
        board.fillRoundedRect(-40, -30, 80, 35, 4);
        board.lineStyle(2, '#8B4513', 1);
        board.strokeRoundedRect(-40, -30, 80, 35, 4);
        sign.add(board);
        
        // Text
        const label = this.add.text(0, -12, text, {
            fontFamily: 'Segoe UI',
            fontSize: '14px',
            color: '#2C3E50'
        });
        label.setOrigin(0.5);
        sign.add(label);
        
        sign.setDepth(y);
    }

    /**
     * Create a campfire
     */
    createCampfire(x, y) {
        const fire = this.add.container(x, y);
        
        // Logs
        const logs = this.add.graphics();
        logs.fillStyle('#8B4513', 1);
        logs.fillCircle(-8, 5, 6);
        logs.fillCircle(8, 5, 6);
        logs.fillCircle(0, 5, 5);
        fire.add(logs);
        
        // Flames
        const flames = this.add.graphics();
        fire.add(flames);
        
        // Animate flames
        this.time.addEvent({
            delay: 100,
            callback: () => {
                flames.clear();
                flames.fillStyle('#FF6B35', 1);
                for (let i = 0; i < 5; i++) {
                    const fw = randomInt(8, 15);
                    const fh = randomInt(15, 25);
                    flames.fillEllipse(
                        randomInt(-10, 10),
                        -randomInt(10, 25),
                        fw,
                        fh
                    );
                }
                flames.fillStyle('#FFD700', 0.8);
                flames.fillEllipse(0, -15, 10, 15);
            },
            repeat: -1
        });
        
        fire.setDepth(y);
        
        // Light glow
        const glow = this.add.circle(x, y, 60, 0xFFD700, 0.1);
        glow.setDepth(y - 1);
    }

    /**
     * Create the player character
     */
    createPlayer() {
        const startPos = window.gameData.playerPosition || { x: 400, y: 500 };
        this.player = new Player(this, startPos.x, startPos.y, 'player').initialize();
        
        // Set initial elevation
        this.player.currentElevation = ELEVATION.GROUND;
    }

    /**
     * Create NPCs
     */
    createNPCs() {
        this.npcs = [];
        
        // Anxious banana NPC
        const bananaNPC = new NPC(this, 600, 550, {
            id: 'banana_anxious',
            fruitType: 'banana',
            accessory: 'scarf',
            dialogue: {
                pages: [
                    {
                        speaker: 'Nervous Banana',
                        text: "Oh! Hello there! I was just... um... thinking about rolling down that hill. But then I remembered I'm curved. Not great at rolling."
                    },
                    {
                        speaker: 'Nervous Banana',
                        text: "Have you seen the old shrine to the east? They say the Banana King lives there. I hope he's having a good day..."
                    }
                ]
            }
        });
        this.npcs.push(bananaNPC);
        
        // Cheerful orange NPC
        const orangeNPC = new NPC(this, 950, 680, {
            id: 'orange_cheerful',
            fruitType: 'orange',
            accessory: 'hat',
            dialogue: {
                pages: [
                    {
                        speaker: 'Cheerful Orange',
                        text: "Hey there, wanderer! Beautiful day, isn't it? The sun is shining, the breeze is gentle... perfect for exploring!"
                    },
                    {
                        speaker: 'Cheerful Orange',
                        text: "I heard there are magical seeds hidden around these hills. They say they make you faster, more agile... quite the adventure!"
                    },
                    {
                        speaker: 'Cheerful Orange',
                        text: "Take care out there! And remember - every hill is easier when you roll with it!"
                    }
                ]
            }
        });
        this.npcs.push(orangeNPC);
        
        // Wise grape elder
        const grapeNPC = new NPC(this, 1550, 650, {
            id: 'grape_elder',
            fruitType: 'grape',
            accessory: 'glasses',
            dialogue: {
                pages: [
                    {
                        speaker: 'Elder Grape',
                        text: "Ah, young one. You seek the Essence Seeds, don't you? I can see it in your eyes."
                    },
                    {
                        speaker: 'Elder Grape',
                        text: "The Bowl grows stronger each day. It drains the life from our lands, leaving only emptiness behind."
                    },
                    {
                        speaker: 'Elder Grape',
                        text: "But you... you carry hope. May your journey restore balance to our world."
                    }
                ]
            }
        });
        this.npcs.push(grapeNPC);
    }

    /**
     * Create collectible Essence Seeds
     */
    createEssenceSeeds() {
        this.seeds = [];
        
        const seedConfigs = [
            { id: 'seed_1', x: 550, y: 320, elevation: ELEVATION.LOW },
            { id: 'seed_2', x: 1000, y: 250, elevation: ELEVATION.MEDIUM },
            { id: 'seed_3', x: 1550, y: 320, elevation: ELEVATION.LOW },
            { id: 'seed_4', x: 800, y: 150, elevation: ELEVATION.HIGH },
            { id: 'seed_5', x: 1750, y: 800, elevation: ELEVATION.GROUND }
        ];
        
        seedConfigs.forEach(config => {
            // Check if already collected
            if (window.gameData.collectedSeeds.includes(config.id)) {
                return;
            }
            
            const seed = this.add.sprite(config.x, config.y, 'essence_seed');
            seed.setDepth(config.y);
            seed.setData('id', config.id);
            seed.setData('collected', false);
            
            // Glow animation
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
            
            // Floating animation
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
                
                // Collection effect
                this.tweens.add({
                    targets: seed,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 300,
                    ease: 'Back.in',
                    onComplete: () => seed.destroy()
                });
                
                // Particles
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

    /**
     * Create ambient particle effects
     */
    createAmbientParticles() {
        // Floating leaves
        const leavesEmitter = this.add.particles(0, 0, 'grass_tile', {
            speed: 20,
            scale: { start: 0.3, end: 0.2 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 4000,
            quantity: 1,
            frequency: 2000,
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, 2048, 1536),
                type: 'random'
            }
        });
        leavesEmitter.setDepth(100);
        
        // Butterflies
        this.createButterflies();
    }

    /**
     * Create butterfly decorations
     */
    createButterflies() {
        for (let i = 0; i < 10; i++) {
            const butterfly = this.add.graphics();
            butterfly.fillStyle('#FFD700', 0.8);
            butterfly.fillEllipse(0, 0, 8, 5);
            butterfly.fillEllipse(-6, 0, 5, 3);
            butterfly.fillEllipse(6, 0, 5, 3);
            
            const bx = randomInt(200, 1800);
            const by = randomInt(200, 1000);
            butterfly.setPosition(bx, by);
            butterfly.setDepth(by + 50);
            
            // Fluttering movement
            this.tweens.add({
                targets: butterfly,
                x: bx + randomInt(-100, 100),
                y: by + randomInt(-50, 50),
                rotation: randomFloat(-0.3, 0.3),
                duration: randomInt(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    update(time, delta) {
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // Update NPCs
        if (this.npcs) {
            this.npcs.forEach(npc => npc.update(time, delta));
        }
        
        // Update camera follow
        if (this.player && !this.isPaused) {
            this.cameras.main.followOffset.set(0, -100);
        }
        
        // Auto-save periodically
        if (time % 30000 < delta) {
            this.player?.saveProgress();
        }
    }
}

window.BananaHillsScene = BananaHillsScene;
