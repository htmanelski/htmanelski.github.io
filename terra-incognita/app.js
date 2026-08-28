// Terra Incognita - Martian Earth Exploration Game
// You are a Martian scientist leading the exploration of Earth as an alien world

// ============================================
// Game State
// ============================================

const gameState = {
    budget: 10,
    missionsLaunched: 0,
    discoveries: [],
    currentMissionType: null,
    isSelectingTarget: false,
    revealedAreas: [],
    geologyRevealed: false,
    elevationRevealed: false,
    atmosphereData: null,
    magneticFieldDetected: false,
    flybyComplete: false,
    flybyPhotos: [],
    flybyUnblurSide: null,
    earthTextureState: 'blurry'
};

// ============================================
// Discovery Features
// ============================================

const DISCOVERY_FEATURES = {
    ocean: {
        name: 'Vast Water Bodies',
        headlines: ['BREAKING: EARTH COVERED IN LIQUID - MASSIVE BLUE REGIONS DETECTED'],
        paperTitles: ['Spectroscopic Confirmation of Liquid Water on Earth\'s Surface'],
        paperAbstracts: ['High-resolution imaging reveals extensive blue regions with spectral signatures consistent with liquid water.'],
        favor: 4
    },
    continental: {
        name: 'Land Masses',
        headlines: ['REVOLUTIONARY: EARTH HAS SOLID LAND - NOT JUST WATER'],
        paperTitles: ['Geomorphic Analysis of Earth\'s Continental Landmasses'],
        paperAbstracts: ['Imaging data reveals distinct continental landmasses with varied albedo and texture.'],
        favor: 3
    },
    mountains: {
        name: 'Mountain Ranges',
        headlines: ['MYSTERY: EARTH\'S MOUNTAINS REACH FOR THE SKY'],
        paperTitles: ['Topographic Analysis of Earth\'s Mountain Systems'],
        paperAbstracts: ['Stereo imaging reveals mountain ranges on Earth with elevations exceeding 8 kilometers.'],
        favor: 5
    }
};

const ATMOSPHERE_COMPOSITION = {
    nitrogen: { percentage: 78 },
    oxygen: { percentage: 21 },
    argon: { percentage: 0.93 },
    carbonDioxide: { percentage: 0.04 }
};

// ============================================
// Mission Types
// ============================================

let scene, camera, renderer, earth, controls, atmosphereMesh, cloudsMesh;
let raycaster, mouse;
let blurryTexture, partialTexture, detailedTexture;

const MISSION_TYPES = {
    flyby: {
        name: 'Flyby Imager',
        cost: 3,
        icon: '🛰️',
        description: 'High-speed pass, partial imaging + atmosphere/magnetic field scan',
        action: launchFlyby
    },
    orbiter: {
        name: 'Orbiter',
        cost: 4,
        icon: '🌍',
        description: 'Reveals coarse geologic map',
        action: launchOrbiter
    },
    impact: {
        name: 'Impact Probe',
        cost: 1,
        icon: '💥',
        description: 'Single-point geology',
        action: launchImpactProbe
    },
    lander: {
        name: 'Lander',
        cost: 5,
        icon: '🚀',
        description: 'Full analysis at target',
        action: launchLander
    },
    advancedLander: {
        name: 'Advanced Lander',
        cost: 8,
        icon: '🔬',
        description: 'Deep core sample + age dating',
        action: launchAdvancedLander
    }
};

// ============================================
// Earth Texture - Base64 encoded 512x256 Earth image
// This is a simplified equirectangular projection of Earth
// ============================================

// Small Earth texture as base64 - 512x256 equirectangular
// This is a placeholder that will be replaced with a better generated texture
const EARTH_BASE64_SMALL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAADICAYAAAAboB4xAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDPHJlY3Qge1BhY2thZ2UgZGVmYXVsdCByZXNvdXJjZXM6IEluZGV4IERlYnVnIExpbms6IENvcHlyaWdodCA8L3BkZj4gPjxwZGY6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAsIHZlcmNvbnMvMzEyMiIgdHlwZT0iYWNjcmliYXRlZC1wYWludC10aW1lY3VwIj48cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPjxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnpzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2hpbnV0aW5nIEFwbGVuKSIgeG1sOkNyZWF0ZURhdGU9IjIwMTctMDctMDdUMTQ6MzA6NDQtMDc6MDAiIHhtcE1NOkRvY3VtZW50SUQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zZXJkL3htcC8xIiB4bXBNTTpEb2N1bWVudElkPSJ4bXAuZGlkOkE0NjQ0NDQ0NjcxMTExRTU1MDc4Rjg0MzE0ODg1RjY3Ij48eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VzPSJhZG9iZTpuczptZXRhLyIgeG1wTU06UHJpbnRQcm9jZXNzPSJ4bXA6Q3JlYXRvclRvb2wvQT1jcmVhdG9yO211bHRpLnBkZjEwKDEpIiB4bXBNTTpEb2N1bWVudElkPSJ4bXAuZGlkOkE0NjQ0NDQ1NjcxMTExRTU1MDc4Rjg0MzE0ODg1RjY3Ij48L3JkZjpEZXNjcmlwdGlvbj48L3JkZjpSREY+PC94OnhtcG1ldGE+";

// ============================================
// Earth Texture Generation
// Create a recognizable Earth using equirectangular projection
// ============================================

function createEarthTextureCanvas(blurLevel) {
    // blurLevel: 0 = sharp, 1 = medium blur, 2 = very blurry
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create image data for direct pixel manipulation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Fill with ocean blue
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 10;     // R
        data[i + 1] = 40;  // G  
        data[i + 2] = 80;  // B
        data[i + 3] = 255; // A
    }
    
    // Now draw continents as land
    // In equirectangular projection:
    // - x = 0 to width maps to longitude -180 to +180
    // - y = 0 to height maps to latitude +90 to -90
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Convert pixel to lat/lon
            const lon = (x / width) * 360 - 180;  // -180 to 180
            const lat = 90 - (y / height) * 180;   // 90 to -90
            
            if (isLandAt(lat, lon)) {
                const idx = (y * width + x) * 4;
                // Land color based on biome
                const color = getLandColor(lat, lon);
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
            }
        }
    }
    
    // Add polar ice caps
    addPolarIceCaps(data, width, height);
    
    // Apply blur
    if (blurLevel > 0) {
        applyGaussianBlur(data, width, height, blurLevel * 4);
    }
    
    // Add film grain for telescope effect
    if (blurLevel >= 2) {
        addFilmGrain(data, width * height, 25);
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function isLandAt(lat, lon) {
    // More accurate continent detection
    // Normalize longitude to 0-360
    const lng = (lon + 180) % 360;
    const absLat = Math.abs(lat);
    
    // Africa: roughly 20°W to 50°E, 35°S to 37°N
    if (lng >= 340 || lng < 50) {
        if (lat >= -35 && lat <= 37) {
            return true;
        }
    }
    
    // Europe/Asia: 20°W to 180°E, 35°N to 70°N
    if (lng >= 0 && lng <= 180) {
        if (lat >= 35 && lat <= 70) {
            return true;
        }
    }
    
    // North America: 170°W to 60°W, 10°N to 70°N
    if (lng >= 190 && lng <= 300) {
        if (lat >= 10 && lat <= 70) {
            return true;
        }
    }
    
    // South America: 80°W to 35°W, 55°S to 10°N
    if (lng >= 280 && lng <= 325) {
        if (lat >= -55 && lat <= 10) {
            return true;
        }
    }
    
    // Australia: 110°E to 155°E, 10°S to 45°S
    if (lng >= 110 && lng <= 155) {
        if (lat >= -45 && lat <= -10) {
            return true;
        }
    }
    
    // Greenland: 50°W to 10°W, 60°N to 85°N
    if (lng >= 310 && lng <= 350) {
        if (lat >= 60 && lat <= 85) {
            return true;
        }
    }
    
    // Madagascar: 40°E to 50°E, 12°S to 26°S
    if (lng >= 40 && lng <= 50) {
        if (lat >= -26 && lat <= -12) {
            return true;
        }
    }
    
    return false;
}

function getLandColor(lat, lon) {
    const absLat = Math.abs(lat);
    const lng = (lon + 180) % 360;
    
    // Deserts
    if ((lat > 15 && lat < 35 && lng > 340 && lng < 20) ||  // Sahara
        (lat > -40 && lat < -10 && lng > 110 && lng < 150)) { // Australia desert
        return { r: 210, g: 180, b: 140 };
    }
    
    // Forests
    if (absLat < 50) {
        return {
            r: Math.floor(50 + Math.random() * 30),
            g: Math.floor(100 + Math.random() * 60),
            b: Math.floor(40 + Math.random() * 30)
        };
    }
    
    // Tundra/arctic
    if (absLat > 60) {
        return { r: 150, g: 140, b: 120 };
    }
    
    // Default land
    return {
        r: Math.floor(80 + Math.random() * 50),
        g: Math.floor(100 + Math.random() * 50),
        b: Math.floor(50 + Math.random() * 30)
    };
}

function addPolarIceCaps(data, width, height) {
    for (let y = 0; y < height; y++) {
        const lat = 90 - (y / height) * 180;
        
        if (lat > 60) {
            // North pole - Arctic
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                data[idx] = 220 + Math.random() * 20;
                data[idx + 1] = 230 + Math.random() * 15;
                data[idx + 2] = 245 + Math.random() * 10;
            }
        }
        
        if (lat < -60) {
            // South pole - Antarctica
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                data[idx] = 220 + Math.random() * 20;
                data[idx + 1] = 230 + Math.random() * 15;
                data[idx + 2] = 245 + Math.random() * 10;
            }
        }
    }
}

function applyGaussianBlur(data, width, height, radius) {
    // Simple box blur - good enough for our purposes
    const temp = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const sx = Math.max(0, Math.min(width - 1, x + dx));
                    const sy = Math.max(0, Math.min(height - 1, y + dy));
                    const sidx = (sy * width + sx) * 4;
                    r += data[sidx];
                    g += data[sidx + 1];
                    b += data[sidx + 2];
                    a += data[sidx + 3];
                    count++;
                }
            }
            
            temp[idx] = r / count;
            temp[idx + 1] = g / count;
            temp[idx + 2] = b / count;
            temp[idx + 3] = a / count;
        }
    }
    
    for (let i = 0; i < data.length; i++) {
        data[i] = temp[i];
    }
}

function addFilmGrain(data, pixelCount, intensity) {
    for (let i = 0; i < pixelCount; i++) {
        const idx = i * 4;
        const noise = Math.random() * intensity - intensity / 2;
        data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
    }
}

function createPartialTexture(side) {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // First create a sharp Earth
    const sharpCanvas = createEarthTextureCanvas(0);
    ctx.drawImage(sharpCanvas, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply blur to one hemisphere
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // In equirectangular, hemisphere is determined by x (longitude)
            const isClearSide = side === 'right' ? x > width / 2 : x < width / 2;
            
            if (!isClearSide) {
                // Blur this pixel by sampling nearby pixels
                const radius = 8;
                let r = 0, g = 0, b = 0;
                let count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const sx = Math.max(0, Math.min(width - 1, x + dx));
                        const sy = Math.max(0, Math.min(height - 1, y + dy));
                        const sidx = (sy * width + sx) * 4;
                        r += data[sidx];
                        g += data[sidx + 1];
                        b += data[sidx + 2];
                        count++;
                    }
                }
                
                data[idx] = Math.min(255, r / count + (Math.random() * 20 - 10));
                data[idx + 1] = Math.min(255, g / count + (Math.random() * 20 - 10));
                data[idx + 2] = Math.min(255, b / count + (Math.random() * 20 - 10));
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
}

// ============================================
// Mission Functions
// ============================================

function launchFlyby() {
    if (gameState.budget < MISSION_TYPES.flyby.cost) {
        addLogEntry('Insufficient budget for Flyby mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.flyby.cost;
    gameState.missionsLaunched++;
    gameState.flybyComplete = true;
    
    addLogEntry('🛰️ Flyby Mission Launched', 'info', 'Spacecraft on trajectory...', null, null, null);
    
    setTimeout(() => {
        gameState.flybyPhotos = generateFlybyPhotos();
        const discoveries = analyzeFlybyResults();
        const { headlines, papers } = generateHeadlines(discoveries);
        
        gameState.earthTextureState = 'partial';
        gameState.flybyUnblurSide = Math.random() < 0.5 ? 'left' : 'right';
        updateEarthTexture();
        
        displayFlybyResults(gameState.flybyPhotos, discoveries, headlines, papers);
        
        addLogEntry(
            '🛰️ Flyby Mission Complete',
            'success',
            `Flyby successful! ${gameState.flybyPhotos.length} imaging passes. The ${gameState.flybyUnblurSide} hemisphere now clearer.`,
            headlines[0], papers[0].title, papers[0].abstract
        );
        
        for (let i = 1; i < headlines.length; i++) {
            addLogEntry(headlines[i], 'discovery', null, null, papers[i].title, papers[i].abstract);
        }
        
        let favorGained = 5;
        discoveries.forEach(d => favorGained += DISCOVERY_FEATURES[d].favor);
        gameState.budget += favorGained;
        updateUI();
    }, 2000);
}

function analyzeFlybyResults() {
    const discoveries = [];
    gameState.atmosphereData = {
        thickness: '~100 km',
        composition: ATMOSPHERE_COMPOSITION,
        pressure: '~1013 hPa'
    };
    gameState.magneticFieldDetected = true;
    
    const possibleFeatures = ['ocean', 'continental', 'mountains'];
    const numFeatures = Math.floor(Math.random() * 2) + 2;
    
    const shuffled = [...possibleFeatures].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numFeatures, shuffled.length); i++) {
        discoveries.push(shuffled[i]);
    }
    
    return discoveries;
}

function generateHeadlines(discoveries) {
    const headlines = [];
    const papers = [];
    
    headlines.push('BREAKING: EARTH HAS THICK ATMOSPHERE');
    papers.push({
        title: 'Atmospheric Composition of Earth',
        abstract: `N₂ (${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%), O₂ (${ATMOSPHERE_COMPOSITION.oxygen.percentage}%). Surface pressure: ${gameState.atmosphereData.pressure}.`
    });
    
    headlines.push('STUNNING: MAGNETIC FIELD DETECTED');
    papers.push({
        title: 'Global Magnetic Field on Earth',
        abstract: 'Strong dipolar field detected: 25-65 microteslas. Liquid core confirmed.'
    });
    
    for (const feature of discoveries) {
        headlines.push(DISCOVERY_FEATURES[feature].headlines[0]);
        papers.push({
            title: DISCOVERY_FEATURES[feature].paperTitles[0],
            abstract: DISCOVERY_FEATURES[feature].paperAbstracts[0]
        });
    }
    
    return { headlines, papers };
}

function generateFlybyPhotos() {
    const photos = [];
    const centerLat = (Math.random() * 140 - 70);
    const centerLng = (Math.random() * 360 - 180);
    
    for (let i = 0; i < 3; i++) {
        const lat = Math.max(-80, Math.min(80, centerLat + (Math.random() * 20 - 10)));
        const lng = (centerLng + (Math.random() * 20 - 10) + 540) % 360 - 180;
        const features = detectFeaturesInPhoto(lat, lng);
        const thumbColor = getLocationThumbnailColor(lat, lng);
        
        photos.push({
            id: `flyby-${i}`,
            lat: lat,
            lng: lng,
            features: features,
            description: generatePhotoDescription(features, lat, lng),
            thumbnail: thumbColor
        });
    }
    return photos;
}

function detectFeaturesInPhoto(lat, lng) {
    const features = [];
    const isLand = isLandAt(lat, (lng + 180) % 360);
    if (!isLand) features.push('ocean');
    else features.push('continental');
    if (Math.abs(lat) > 60) features.push('polarIce');
    if (Math.random() < 0.3) features.push('mountains');
    return features;
}

function getLocationThumbnailColor(lat, lng) {
    const color = getLandColor(lat, (lng + 180) % 360);
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function generatePhotoDescription(features, lat, lng) {
    const descriptions = [];
    if (features.includes('ocean')) descriptions.push('Vast blue expanse');
    if (features.includes('continental')) descriptions.push('Land masses');
    if (features.includes('polarIce')) descriptions.push('Ice cap');
    if (features.includes('mountains')) descriptions.push('Mountains');
    return `Flyby Photo: ${lat.toFixed(1)}°${lat > 0 ? 'N' : 'S'}, ${lng.toFixed(1)}°${lng > 0 ? 'E' : 'W'} - ${descriptions.join(', ')}.`;
}

function displayFlybyResults(photos, discoveries, headlines, papers) {
    const flybyResultsDiv = document.getElementById('flyby-results');
    const flybyPhotosDiv = document.getElementById('flyby-photos');
    const flybyAtmosphereDiv = document.getElementById('flyby-atmosphere');
    const flybyMagneticDiv = document.getElementById('flyby-magnetic');
    
    flybyPhotosDiv.innerHTML = '<h4>Flyby Images:</h4>';
    photos.forEach(photo => {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'flyby-photo';
        photoDiv.style.backgroundColor = photo.thumbnail;
        photoDiv.innerHTML = `
            <div class="photo-title">Photo #${photo.id.split('-')[1]}</div>
            <div class="photo-location">Lat: ${photo.lat.toFixed(1)}°, Lng: ${photo.lng.toFixed(1)}°</div>
            <div class="photo-desc">${photo.description}</div>
            <div class="photo-features">Features: ${photo.features.join(', ')}</div>
        `;
        flybyPhotosDiv.appendChild(photoDiv);
    });
    
    flybyAtmosphereDiv.innerHTML = `
        <h4>Atmosphere:</h4>
        <p><strong>Thickness:</strong> ${gameState.atmosphereData.thickness}</p>
        <p><strong>Pressure:</strong> ${gameState.atmosphereData.pressure}</p>
    `;
    
    flybyMagneticDiv.innerHTML = `
        <h4>Magnetic Field:</h4>
        <p><strong>Status:</strong> ✓ DETECTED</p>
        <p><strong>Strength:</strong> 25-65 μT</p>
    `;
    
    flybyResultsDiv.style.display = 'block';
}

function launchOrbiter() {
    if (gameState.budget < MISSION_TYPES.orbiter.cost) return;
    gameState.budget -= MISSION_TYPES.orbiter.cost;
    gameState.missionsLaunched++;
    gameState.earthTextureState = 'detailed';
    updateEarthTexture();
    addLogEntry('🌍 Orbiter Mission', 'success', 'Global map revealed!', 
        'BREAKING: EARTH HAS DIVERSE TERRAIN', 'Global Survey', 'Diverse crust types confirmed.');
    gameState.budget += 4;
    updateUI();
}

function launchImpactProbe(lat, lng) {
    if (gameState.budget < MISSION_TYPES.impact.cost) return;
    gameState.budget -= MISSION_TYPES.impact.cost;
    gameState.missionsLaunched++;
    addLogEntry('💥 Impact Probe', 'success', `Impact at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E.`,
        'SURFACE COMPOSITION REVEALED', 'Direct Measurement', 'Surface samples collected.');
    gameState.budget += 2;
    updateUI();
}

function launchLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.lander.cost) return;
    gameState.budget -= MISSION_TYPES.lander.cost;
    gameState.missionsLaunched++;
    addLogEntry('🚀 Lander Mission', 'success', `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E.`,
        'FIRST SOFT LANDING', 'In-Situ Analysis', 'Surface analysis complete.');
    gameState.budget += 4;
    updateUI();
}

function launchAdvancedLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.advancedLander.cost) return;
    gameState.budget -= MISSION_TYPES.advancedLander.cost;
    gameState.missionsLaunched++;
    addLogEntry('🔬 Advanced Lander', 'success', `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Age: ${Math.floor(Math.random() * 4000 + 500)}M years.`,
        'DEEP CORE SAMPLES', 'Radiometric Dating', 'Comprehensive analysis.');
    gameState.budget += 6;
    updateUI();
}

// ============================================
// UI Functions
// ============================================

function updateUI() {
    document.getElementById('budget').textContent = gameState.budget;
    document.getElementById('missions-launched').textContent = gameState.missionsLaunched;
    for (const [type, mission] of Object.entries(MISSION_TYPES)) {
        const btn = document.getElementById(`${type}-btn`);
        if (btn) btn.disabled = gameState.budget < mission.cost;
    }
}

function addLogEntry(title, type, description, headline, paperTitle, paperAbstract) {
    const logEntries = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    let content = '';
    if (headline) content += `<div class="headline">${headline}</div>`;
    if (title && !headline) content += `<div class="log-title">${title}</div>`;
    if (description) content += `<div class="description">${description}</div>`;
    if (paperTitle && paperAbstract) content += `<div class="paper"><strong>${paperTitle}</strong><br><em>Abstract:</em> ${paperAbstract}</div>`;
    content += `<div class="meta">Mission ${gameState.missionsLaunched}  ${timeStr}</div>`;
    entry.innerHTML = content;
    logEntries.prepend(entry);
    gameState.discoveries.push({ title, type, description, headline, paperTitle, paperAbstract, time: now });
}

// ============================================
// Three.js Initialization
// ============================================

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight * 0.75, 0.1, 1000);
    camera.position.z = 2;
    
    const globeContainer = document.getElementById('globe-container');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    globeContainer.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 1.5;
    controls.maxDistance = 3;
    controls.enableZoom = true;
    controls.enablePan = false;
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    createEarth();
    
    window.addEventListener('resize', onWindowResize);
    globeContainer.addEventListener('click', onGlobeClick);
    
    animate();
}

function createEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Create textures
    blurryTexture = new THREE.CanvasTexture(createEarthTextureCanvas(2));
    partialTexture = new THREE.CanvasTexture(createEarthTextureCanvas(2));
    detailedTexture = new THREE.CanvasTexture(createEarthTextureCanvas(0));
    
    const material = new THREE.MeshPhongMaterial({
        map: blurryTexture,
        shininess: 0
    });
    
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    
    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);
    
    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(1.005, 128, 128);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudsMesh.visible = false;
    scene.add(cloudsMesh);
    
    createStars();
}

function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.8
    });
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        starsVertices.push(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    scene.add(new THREE.Points(starsGeometry, starsMaterial));
}

function updateEarthTexture() {
    switch (gameState.earthTextureState) {
        case 'blurry':
            earth.material.map = blurryTexture;
            break;
        case 'partial':
            partialTexture = createPartialTexture(gameState.flybyUnblurSide);
            earth.material.map = partialTexture;
            break;
        case 'detailed':
            earth.material.map = detailedTexture;
            break;
    }
    earth.material.needsUpdate = true;
    
    if (gameState.atmosphereData) {
        atmosphereMesh.material.opacity = 0.25;
    }
    
    if (gameState.flybyComplete) {
        cloudsMesh.visible = true;
    }
}

function onWindowResize() {
    const globeContainer = document.getElementById('globe-container');
    camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
}

function onGlobeClick(event) {
    if (!gameState.isSelectingTarget) return;
    
    const globeContainer = document.getElementById('globe-container');
    const rect = globeContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(earth);
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        const lat = 90 - (THREE.MathUtils.radToDeg(Math.acos(point.y)));
        const lng = THREE.MathUtils.radToDeg(Math.atan2(point.z, point.x));
        
        if (gameState.currentMissionType) {
            MISSION_TYPES[gameState.currentMissionType].action(lat, lng);
            gameState.isSelectingTarget = false;
            gameState.currentMissionType = null;
            document.body.style.cursor = '';
        }
    }
}

function setupMissionButtons() {
    for (const [type, mission] of Object.entries(MISSION_TYPES)) {
        const btn = document.getElementById(`${type}-btn`);
        if (btn) {
            btn.addEventListener('click', () => {
                if (gameState.budget < mission.cost) {
                    addLogEntry(`Insufficient budget for ${mission.name}`, 'error');
                    return;
                }
                if (type === 'flyby' || type === 'orbiter') {
                    mission.action();
                } else {
                    gameState.isSelectingTarget = true;
                    gameState.currentMissionType = type;
                    document.body.style.cursor = 'crosshair';
                    addLogEntry(`Select target for ${mission.name}`, 'info');
                }
            });
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    earth.rotation.y += 0.001;
    if (cloudsMesh.visible) {
        cloudsMesh.rotation.y += 0.0005;
    }
    renderer.render(scene, camera);
}

function init() {
    initThreeJS();
    setupMissionButtons();
    updateUI();
    
    addLogEntry(
        'Mission Briefing',
        'info',
        'As a Martian scientist, you are in charge of Earth exploration. Our knowledge is limited to blurry optical images and occultation data. The Martian President declared: "We choose to go to the Earth" - and you will make it happen.',
        'MARTIAN PRESIDENT: "WE CHOOSE TO GO TO THE EARTH"',
        'Initial Reconnaissance: The Blue Planet',
        'Preliminary observations reveal Earth as a blue world with white polar caps and faint dark surface features. Occultation data indicates a substantial atmosphere.'
    );
}

window.addEventListener('DOMContentLoaded', init);
