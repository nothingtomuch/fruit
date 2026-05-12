// ==========================================
// UTILITY HELPERS
// ==========================================

/**
 * Generate a soft gradient texture
 */
function createGradientTexture(scene, key, width, height, colors) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    for (let y = 0; y < height; y++) {
        const progress = y / height;
        const color = interpolateColor(colors[0], colors[1], progress);
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, y, width, 1);
    }
    
    graphics.generateTexture(key, width, height);
    graphics.destroy();
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Create a soft blob shadow
 */
function createBlobShadow(scene, key, radius, intensity = 0.2) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Soft gradient shadow
    for (let i = radius; i >= 0; i--) {
        const alpha = intensity * (i / radius);
        graphics.fillStyle(0x000000, alpha);
        graphics.fillCircle(radius, radius, i);
    }
    
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.destroy();
}

/**
 * Create a rounded rectangle texture
 */
function createRoundedRectTexture(scene, key, width, height, radius, color, strokeColor = null, strokeWidth = 0) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    if (strokeColor !== null) {
        graphics.lineStyle(strokeWidth, strokeColor, 1);
    }
    
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, width, height, radius);
    
    if (strokeColor !== null) {
        graphics.strokeRoundedRect(0, 0, width, height, radius);
    }
    
    graphics.generateTexture(key, width, height);
    graphics.destroy();
}

/**
 * Create a circular gradient texture
 */
function createCircularGradientTexture(scene, key, radius, innerColor, outerColor) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    for (let i = radius; i >= 0; i--) {
        const progress = i / radius;
        const color = interpolateColor(outerColor, innerColor, progress);
        graphics.fillStyle(color, 1);
        graphics.fillCircle(radius, radius, i);
    }
    
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.destroy();
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Ease in-out quadratic
 */
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Get distance between two points
 */
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Get angle between two points
 */
function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Check if point is inside a polygon
 */
function pointInPolygon(point, vertices) {
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
 * Create a wave motion value
 */
function wave(time, frequency = 1, amplitude = 1, phase = 0) {
    return Math.sin(time * frequency + phase) * amplitude;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export utilities globally
window.createGradientTexture = createGradientTexture;
window.interpolateColor = interpolateColor;
window.createBlobShadow = createBlobShadow;
window.createRoundedRectTexture = createRoundedRectTexture;
window.createCircularGradientTexture = createCircularGradientTexture;
window.clamp = clamp;
window.lerp = lerp;
window.easeInOutQuad = easeInOutQuad;
window.getDistance = getDistance;
window.getAngle = getAngle;
window.randomInt = randomInt;
window.randomFloat = randomFloat;
window.pointInPolygon = pointInPolygon;
window.wave = wave;
window.debounce = debounce;
window.throttle = throttle;
