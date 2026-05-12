// ==========================================
// TRAVERSAL SYSTEM
// Centralized elevation and movement management
// ==========================================

class TraversalSystem {
    constructor(scene) {
        this.scene = scene;
        this.elevationLayers = new Map();
        this.terrainData = new Map();
        this.climbableZones = [];
        this.transitionPoints = [];
        this.surfaceModifiers = new Map();
    }

    /**
     * Register an elevation layer
     */
    addElevationLayer(id, elevation, polygons) {
        this.elevationLayers.set(id, {
            id,
            elevation,
            polygons,
            colliders: []
        });
    }

    /**
     * Add terrain data at a position
     */
    addTerrainData(x, y, width, height, terrainType, elevation, properties = {}) {
        const key = `${Math.floor(x)},${Math.floor(y)}`;
        this.terrainData.set(key, {
            x, y, width, height,
            terrainType,
            elevation,
            properties
        });
    }

    /**
     * Add a climbable zone (vines, ladders, etc.)
     */
    addClimbableZone(x, y, width, height, fromElevation, toElevation) {
        this.climbableZones.push({
            x, y, width, height,
            fromElevation,
            toElevation,
            active: true
        });
    }

    /**
     * Add a transition point (ramps, stairs, bridges)
     */
    addTransitionPoint(x, y, width, height, fromElevation, toElevation, direction) {
        this.transitionPoints.push({
            x, y, width, height,
            fromElevation,
            toElevation,
            direction,
            active: true
        });
    }

    /**
     * Add surface modifier (slippery, sticky, water, etc.)
     */
    addSurfaceModifier(x, y, width, height, modifier, strength = 1) {
        const key = `surface_${this.surfaceModifiers.size}`;
        this.surfaceModifiers.set(key, {
            x, y, width, height,
            modifier,
            strength
        });
    }

    /**
     * Get terrain data at position
     */
    getTerrainAt(x, y) {
        for (const [key, terrain] of this.terrainData) {
            if (x >= terrain.x && x <= terrain.x + terrain.width &&
                y >= terrain.y && y <= terrain.y + terrain.height) {
                return terrain;
            }
        }
        return null;
    }

    /**
     * Get elevation at position
     */
    getElevationAt(x, y) {
        for (const [id, layer] of this.elevationLayers) {
            for (const polygon of layer.polygons) {
                if (this.pointInPolygon({ x, y }, polygon)) {
                    return layer.elevation;
                }
            }
        }
        return ELEVATION.GROUND;
    }

    /**
     * Check if position is in climbable zone
     */
    isInClimbableZone(x, y) {
        for (const zone of this.climbableZones) {
            if (!zone.active) continue;
            if (x >= zone.x && x <= zone.x + zone.width &&
                y >= zone.y && y <= zone.y + zone.height) {
                return zone;
            }
        }
        return null;
    }

    /**
     * Check if position is in transition point
     */
    isInTransitionPoint(x, y, currentElevation) {
        for (const point of this.transitionPoints) {
            if (!point.active) continue;
            if (point.fromElevation !== currentElevation) continue;
            if (x >= point.x && x <= point.x + point.width &&
                y >= point.y && y <= point.y + point.height) {
                return point;
            }
        }
        return null;
    }

    /**
     * Get surface modifier at position
     */
    getSurfaceModifierAt(x, y) {
        for (const [key, modifier] of this.surfaceModifiers) {
            if (x >= modifier.x && x <= modifier.x + modifier.width &&
                y >= modifier.y && y <= modifier.y + modifier.height) {
                return modifier;
            }
        }
        return null;
    }

    /**
     * Check if movement is valid between two points
     */
    canMove(fromX, fromY, toX, toY, elevation) {
        const targetElevation = this.getElevationAt(toX, toY);
        
        // Can't move between different elevations without transition
        if (targetElevation !== elevation) {
            const transition = this.isInTransitionPoint(toX, toY, elevation);
            if (!transition) {
                return false;
            }
        }
        
        // Check for walls/cliffs
        const terrain = this.getTerrainAt(toX, toY);
        if (terrain && terrain.properties.solid) {
            return false;
        }
        
        return true;
    }

    /**
     * Apply surface effects to velocity
     */
    applySurfaceEffects(velocity, x, y, baseStats) {
        const modifier = this.getSurfaceModifierAt(x, y);
        if (!modifier) return velocity;

        const modified = { ...velocity };
        
        switch (modifier.modifier) {
            case 'slippery':
                modified.x *= 1 + (0.3 * modifier.strength);
                modified.y *= 1 + (0.3 * modifier.strength);
                break;
            case 'sticky':
                modified.x *= 1 - (0.4 * modifier.strength);
                modified.y *= 1 - (0.4 * modifier.strength);
                break;
            case 'water':
                modified.x *= 0.5;
                modified.y *= 0.5;
                break;
            case 'mud':
                modified.x *= 0.6;
                modified.y *= 0.6;
                break;
            case 'ice':
                modified.x *= 1.2;
                modified.y *= 1.2;
                break;
        }
        
        return modified;
    }

    /**
     * Point in polygon check
     */
    pointInPolygon(point, vertices) {
        let inside = false;
        const x = point.x;
        const y = point.y;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;
            
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        
        return inside;
    }

    /**
     * Clear all data
     */
    clear() {
        this.elevationLayers.clear();
        this.terrainData.clear();
        this.climbableZones = [];
        this.transitionPoints = [];
        this.surfaceModifiers.clear();
    }
}

window.TraversalSystem = TraversalSystem;
