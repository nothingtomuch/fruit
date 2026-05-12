// ==========================================
// DIALOGUE SYSTEM
// Professional, polished dialogue with typing effect
// ==========================================

class DialogueSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentDialogue = null;
        this.currentPageIndex = 0;
        this.typingComplete = false;
        this.typingSpeed = DIALOGUE_SPEEDS.TYPING;
        
        this.panel = null;
        this.nameText = null;
        this.contentText = null;
        this.indicator = null;
        this.portrait = null;
        
        this.onDialogueEnd = null;
    }

    /**
     * Initialize the dialogue UI
     */
    create() {
        const container = this.scene.add.container(0, 0);
        container.setDepth(10000);
        container.setVisible(false);

        // Main panel background
        this.panel = this.scene.add.graphics();
        container.add(this.panel);

        // Speaker name background
        this.nameBg = this.scene.add.graphics();
        container.add(this.nameBg);

        // Speaker name
        this.nameText = this.scene.add.text(0, 0, '', {
            fontFamily: 'Segoe UI',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#2C3E50',
            strokeThickness: 4
        });
        this.nameText.setOrigin(0, 0.5);
        this.nameText.setDepth(10001);
        container.add(this.nameText);

        // Dialogue content
        this.contentText = this.scene.add.text(0, 0, '', {
            fontFamily: 'Segoe UI',
            fontSize: '18px',
            color: '#2C3E50',
            wordWrap: { width: 700 },
            lineSpacing: 8
        });
        this.contentText.setOrigin(0, 0);
        container.add(this.contentText);

        // Continue indicator
        this.indicator = this.scene.add.graphics();
        container.add(this.indicator);

        // Portrait (optional)
        this.portrait = this.scene.add.image(0, 0, '');
        this.portrait.setVisible(false);
        this.portrait.setDisplaySize(120, 120);
        container.add(this.portrait);

        this.container = container;
        
        return this;
    }

    /**
     * Start a dialogue sequence
     */
    start(dialogueData, onComplete = null) {
        if (!dialogueData || !dialogueData.pages || dialogueData.pages.length === 0) {
            return;
        }

        this.currentDialogue = dialogueData;
        this.currentPageIndex = 0;
        this.onDialogueEnd = onComplete;
        
        this.container.setPosition(
            this.scene.cameras.main.scrollX + 64,
            this.scene.cameras.main.scrollY + this.scene.scale.height - 180
        );
        
        this.showPanel();
        this.showPage(0);
        
        this.isActive = true;
        this.scene.physics.pause();
    }

    /**
     * Show the dialogue panel with animation
     */
    showPanel() {
        this.container.setVisible(true);
        
        // Draw panel
        this.panel.clear();
        this.panel.fillStyle(0xFFFFFF, 0.95);
        this.panel.fillRoundedRect(0, 0, 800, 140, 16);
        this.panel.lineStyle(3, 0x2C3E50, 1);
        this.panel.strokeRoundedRect(0, 0, 800, 140, 16);

        // Draw name background
        this.nameBg.clear();
        this.nameBg.fillStyle(0x3498DB, 1);
        this.nameBg.fillRoundedRect(20, -10, 200, 40, 8);
    }

    /**
     * Display a specific page
     */
    showPage(pageIndex) {
        const page = this.currentDialogue.pages[pageIndex];
        this.typingComplete = false;
        
        // Update speaker name
        if (page.speaker) {
            this.nameText.setText(page.speaker);
            this.nameBg.setVisible(true);
            this.nameText.setVisible(true);
        } else {
            this.nameBg.setVisible(false);
            this.nameText.setVisible(false);
        }

        // Update portrait
        if (page.portrait) {
            this.portrait.setTexture(page.portrait);
            this.portrait.setVisible(true);
            this.portrait.setPosition(100, 70);
        } else {
            this.portrait.setVisible(false);
        }

        // Clear previous text
        this.contentText.setText('');
        
        // Type out the text
        this.typeText(page.text);
        
        // Hide indicator while typing
        this.indicator.clear();
    }

    /**
     * Type out text character by character
     */
    typeText(fullText) {
        let currentIndex = 0;
        this.typedText = '';
        
        const typeInterval = this.scene.time.addEvent({
            delay: this.typingSpeed,
            callback: () => {
                if (!this.isActive || currentIndex >= fullText.length) {
                    typeInterval.remove();
                    this.typingComplete = true;
                    this.showContinueIndicator();
                    return;
                }

                this.typedText += fullText[currentIndex];
                this.contentText.setText(this.typedText);
                currentIndex++;
            },
            repeat: fullText.length - 1
        });

        this.typingEvent = typeInterval;
    }

    /**
     * Show the "continue" indicator
     */
    showContinueIndicator() {
        this.indicator.clear();
        
        // Draw arrow bounce animation
        const arrow = this.scene.add.graphics();
        arrow.fillStyle(0x2C3E50, 1);
        arrow.fillTriangle(0, 0, 8, 8, 16, 0);
        
        this.indicator.add(arrow);
        this.indicator.setPosition(760, 100);
        
        // Bounce animation
        this.scene.tweens.add({
            targets: this.indicator,
            y: 105,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Handle advance input (E key or click)
     */
    advance() {
        if (!this.isActive) return false;
        
        // If still typing, complete immediately
        if (!this.typingComplete) {
            this.completeCurrentPage();
            return true;
        }

        // Go to next page or end dialogue
        const nextPageIndex = this.currentPageIndex + 1;
        
        if (nextPageIndex < this.currentDialogue.pages.length) {
            this.currentPageIndex = nextPageIndex;
            this.showPage(nextPageIndex);
            return true;
        } else {
            this.end();
            return false;
        }
    }

    /**
     * Complete current page instantly
     */
    completeCurrentPage() {
        if (this.typingEvent) {
            this.typingEvent.remove();
        }
        
        const page = this.currentDialogue.pages[this.currentPageIndex];
        this.contentText.setText(page.text);
        this.typingComplete = true;
        this.showContinueIndicator();
    }

    /**
     * End the dialogue
     */
    end() {
        this.isActive = false;
        this.container.setVisible(false);
        
        if (this.typingEvent) {
            this.typingEvent.remove();
        }
        
        this.scene.physics.resume();
        
        if (this.onDialogueEnd) {
            this.onDialogueEnd();
        }
    }

    /**
     * Destroy the dialogue system
     */
    destroy() {
        if (this.container) {
            this.container.destroy(true);
        }
    }
}

window.DialogueSystem = DialogueSystem;
