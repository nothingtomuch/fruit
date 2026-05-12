// ==========================================
// UI MANAGER
// Clean, modern, cozy interface
// ==========================================

class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.containers = {};
        this.notifications = [];
        
        this.create();
    }

    /**
     * Create all UI elements
     */
    create() {
        this.createHUD();
        this.createNotifications();
    }

    /**
     * Create heads-up display
     */
    createHUD() {
        // HUD Container - top left
        this.hudContainer = this.scene.add.container(20, 20);
        this.hudContainer.setDepth(10000);
        this.hudContainer.setScrollFactor(0);

        // Essence Seed counter
        this.seedContainer = this.scene.add.container(0, 0);
        const seedBg = this.scene.add.graphics();
        seedBg.fillStyle(0x2C3E50, 0.9);
        seedBg.fillRoundedRect(0, 0, 140, 40, 8);
        this.seedContainer.add(seedBg);

        const seedIcon = this.scene.add.graphics();
        seedIcon.fillStyle(COLORS.essenceSeed.glow, 1);
        seedIcon.fillCircle(20, 20, 12);
        seedIcon.lineStyle(2, 0xFFFFFF, 0.5);
        seedIcon.strokeCircle(20, 20, 12);
        this.seedContainer.add(seedIcon);

        // Seed sparkle
        const sparkle = this.scene.add.graphics();
        sparkle.fillStyle(0xFFFFFF, 0.8);
        sparkle.fillCircle(24, 16, 3);
        this.seedContainer.add(sparkle);

        this.seedText = this.scene.add.text(45, 20, '0', {
            fontFamily: 'Segoe UI',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#FFD700'
        });
        this.seedText.setOrigin(0, 0.5);
        this.seedContainer.add(this.seedText);

        this.hudContainer.add(this.seedContainer);

        // Health bar - below seeds
        this.healthContainer = this.scene.add.container(0, 50);
        const healthBg = this.scene.add.graphics();
        healthBg.fillStyle(0x2C3E50, 0.9);
        healthBg.fillRoundedRect(0, 0, 140, 28, 8);
        this.healthContainer.add(healthBg);

        // Heart icon
        const heartIcon = this.scene.add.graphics();
        heartIcon.fillStyle(0xE74C3C, 1);
        this.drawHeart(heartIcon, 18, 14, 10);
        this.healthContainer.add(heartIcon);

        // Health fill
        this.healthFill = this.scene.add.graphics();
        this.healthContainer.add(this.healthFill);

        // Health text
        this.healthText = this.scene.add.text(45, 14, '5/5', {
            fontFamily: 'Segoe UI',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ECF0F1'
        });
        this.healthText.setOrigin(0, 0.5);
        this.healthContainer.add(this.healthText);

        this.hudContainer.add(this.healthContainer);

        // Juice currency - top right
        this.juiceContainer = this.scene.add.container(this.scene.scale.width - 160, 20);
        const juiceBg = this.scene.add.graphics();
        juiceBg.fillStyle(0x2C3E50, 0.9);
        juiceBg.fillRoundedRect(0, 0, 140, 40, 8);
        this.juiceContainer.add(juiceBg);

        const juiceIcon = this.scene.add.graphics();
        juiceIcon.fillStyle(COLORS.ui.juice, 1);
        juiceIcon.fillCircle(20, 20, 12);
        this.juiceContainer.add(juiceIcon);

        // Juice droplet highlight
        const juiceHighlight = this.scene.add.graphics();
        juiceHighlight.fillStyle(0xFFFFFF, 0.5);
        juiceHighlight.fillCircle(24, 16, 4);
        this.juiceContainer.add(juiceHighlight);

        this.juiceText = this.scene.add.text(45, 20, '0', {
            fontFamily: 'Segoe UI',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#9B59B6'
        });
        this.juiceText.setOrigin(0, 0.5);
        this.juiceContainer.add(this.juiceText);

        this.hudContainer.add(this.juiceContainer);

        this.updateHUD();
    }

    /**
     * Draw a heart shape
     */
    drawHeart(graphics, x, y, size) {
        // Create heart shape using circles and a triangle (Phaser-compatible)
        const halfSize = size / 2;
        
        // Left hump (circle)
        graphics.fillCircle(x - halfSize / 2, y, halfSize);
        // Right hump (circle)
        graphics.fillCircle(x + halfSize / 2, y, halfSize);
        // Bottom triangle using a polygon
        graphics.fillTriangle(x - halfSize, y, x, y + size, x + halfSize, y);
    }

    /**
     * Create notification container
     */
    createNotifications() {
        this.notificationContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            100
        );
        this.notificationContainer.setDepth(10001);
        this.notificationContainer.setScrollFactor(0);
    }

    /**
     * Update HUD values
     */
    updateHUD() {
        this.seedText.setText(window.gameData.essenceSeeds.toString());
        this.juiceText.setText(window.gameData.juiceCurrency.toString());
        this.updateHealth();
    }

    /**
     * Update health bar
     */
    updateHealth() {
        if (!this.healthFill) return;

        this.healthFill.clear();
        
        const healthPercent = window.gameData.health / window.gameData.maxHealth;
        const width = 85 * healthPercent;
        
        // Color based on health
        let color = 0xE74C3C;
        if (healthPercent > 0.6) color = 0x27AE60;
        else if (healthPercent > 0.3) color = 0xF39C12;
        
        this.healthFill.fillStyle(color, 1);
        this.healthFill.fillRoundedRect(42, 10, width, 10, 5);
        
        this.healthText.setText(`${window.gameData.health}/${window.gameData.maxHealth}`);
    }

    /**
     * Show ability upgrade notification
     */
    showUpgradeNotification() {
        this.showNotification('✨ Movement Upgraded!', '#27AE60');
    }

    /**
     * Show boss phase announcement
     */
    showBossPhase(phaseName) {
        this.showNotification(phaseName, '#E74C3C', 2000);
    }

    /**
     * Show boss defeated message
     */
    showBossDefeated(bossName) {
        this.showNotification(`🌟 ${bossName} Calmed!`, '#FFD700', 3000);
    }

    /**
     * Show a notification
     */
    showNotification(text, color = '#FFFFFF', duration = 1500) {
        const notification = this.scene.add.container(0, 0);
        
        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2C3E50, 0.95);
        bg.fillRoundedRect(-150, -20, 300, 40, 8);
        bg.lineStyle(2, parseInt(color.slice(1), 16), 1);
        bg.strokeRoundedRect(-150, -20, 300, 40, 8);
        notification.add(bg);

        // Text
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Segoe UI',
            fontSize: '20px',
            fontStyle: 'bold',
            color: color
        });
        label.setOrigin(0.5);
        notification.add(label);

        this.notificationContainer.add(notification);

        // Animate in
        notification.setY(-50);
        notification.setAlpha(0);
        
        this.scene.tweens.add({
            targets: notification,
            y: 0,
            alpha: 1,
            duration: 300,
            ease: 'Back.out'
        });

        // Animate out and remove
        this.scene.time.delayedCall(duration, () => {
            this.scene.tweens.add({
                targets: notification,
                y: -50,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }

    /**
     * Show region transition
     */
    showRegionTransition(regionName, subtitle = '') {
        const overlay = this.scene.add.container(0, 0);
        overlay.setDepth(10002);
        overlay.setScrollFactor(0);
        
        // Darken background
        const darken = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.7
        );
        overlay.add(darken);

        // Region name
        const title = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2 - 30,
            regionName,
            {
                fontFamily: 'Segoe UI',
                fontSize: '42px',
                fontStyle: 'bold',
                color: '#FFFFFF',
                stroke: '#2C3E50',
                strokeThickness: 6
            }
        );
        title.setOrigin(0.5);
        overlay.add(title);

        // Subtitle
        if (subtitle) {
            const sub = this.scene.add.text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2 + 20,
                subtitle,
                {
                    fontFamily: 'Segoe UI',
                    fontSize: '24px',
                    color: '#BDC3C7'
                }
            );
            sub.setOrigin(0.5);
            overlay.add(sub);
        }

        // Fade in
        overlay.setAlpha(0);
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500
        });

        // Fade out
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: overlay,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                }
            });
        });
    }

    /**
     * Create pause menu
     */
    createPauseMenu() {
        const pauseContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        pauseContainer.setDepth(10003);
        pauseContainer.setScrollFactor(0);
        pauseContainer.setVisible(false);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2C3E50, 0.95);
        bg.fillRoundedRect(-200, -150, 400, 300, 16);
        pauseContainer.add(bg);

        // Title
        const title = this.scene.add.text(0, -100, 'PAUSED', {
            fontFamily: 'Segoe UI',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        });
        title.setOrigin(0.5);
        pauseContainer.add(title);

        // Options
        const resumeText = this.scene.add.text(0, -30, 'Press E to Resume', {
            fontFamily: 'Segoe UI',
            fontSize: '20px',
            color: '#BDC3C7'
        });
        resumeText.setOrigin(0.5);
        pauseContainer.add(resumeText);

        const saveText = this.scene.add.text(0, 10, 'Game auto-saves', {
            fontFamily: 'Segoe UI',
            fontSize: '16px',
            color: '#7F8C8D'
        });
        saveText.setOrigin(0.5);
        pauseContainer.add(saveText);

        this.pauseContainer = pauseContainer;
    }

    /**
     * Toggle pause menu
     */
    togglePause(isPaused) {
        if (this.pauseContainer) {
            this.pauseContainer.setVisible(isPaused);
        }
    }

    /**
     * Destroy UI manager
     */
    destroy() {
        if (this.hudContainer) this.hudContainer.destroy(true);
        if (this.notificationContainer) this.notificationContainer.destroy(true);
        if (this.pauseContainer) this.pauseContainer.destroy(true);
    }
}

window.UIManager = UIManager;
