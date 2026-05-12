// ==========================================
// SAVE SYSTEM
// LocalStorage-based persistence
// ==========================================

class SaveSystem {
    constructor() {
        this.saveKey = 'fruit_wanderer_save_v1';
        this.defaultData = {
            essenceSeeds: 0,
            juiceCurrency: 0,
            health: 5,
            maxHealth: 5,
            unlockedAbilities: [],
            defeatedBosses: [],
            collectedSeeds: [],
            currentRegion: 'banana_hills',
            playerPosition: { x: 400, y: 300 },
            settings: {
                musicVolume: 0.7,
                sfxVolume: 0.8
            },
            playTime: 0,
            lastSave: Date.now()
        };
        this.currentData = { ...this.defaultData };
    }

    /**
     * Load saved data
     */
    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                this.currentData = JSON.parse(saved);
                console.log('📦 Save loaded successfully');
                return this.currentData;
            }
        } catch (error) {
            console.error('❌ Failed to load save:', error);
        }
        
        // Return default data if no save exists
        this.currentData = { ...this.defaultData };
        return this.currentData;
    }

    /**
     * Save current game state
     */
    save(gameState) {
        try {
            this.currentData = {
                ...this.currentData,
                ...gameState,
                lastSave: Date.now()
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(this.currentData));
            console.log('💾 Game saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    }

    /**
     * Update specific field
     */
    updateField(field, value) {
        this.currentData[field] = value;
    }

    /**
     * Add to array field (no duplicates)
     */
    addToArrayField(field, value) {
        if (!this.currentData[field].includes(value)) {
            this.currentData[field].push(value);
        }
    }

    /**
     * Check if value exists in array field
     */
    hasInArrayField(field, value) {
        return this.currentData[field].includes(value);
    }

    /**
     * Get current save data
     */
    getData() {
        return { ...this.currentData };
    }

    /**
     * Reset to default
     */
    reset() {
        try {
            localStorage.removeItem(this.saveKey);
            this.currentData = { ...this.defaultData };
            console.log('🔄 Save reset successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to reset save:', error);
            return false;
        }
    }

    /**
     * Check if save exists
     */
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Delete save
     */
    delete() {
        return this.reset();
    }

    /**
     * Export save data as JSON string
     */
    export() {
        return JSON.stringify(this.currentData, null, 2);
    }

    /**
     * Import save data from JSON string
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.currentData = { ...this.defaultData, ...data };
            this.save({});
            return true;
        } catch (error) {
            console.error('❌ Failed to import save:', error);
            return false;
        }
    }

    /**
     * Get formatted play time
     */
    getFormattedPlayTime() {
        const seconds = Math.floor(this.currentData.playTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// Create global instance
window.saveSystem = new SaveSystem();
