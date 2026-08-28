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
// Discovery Features (simplified)
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
// Earth Texture Generation - Using NASA Blue Marble Colors
// ============================================

function createRealisticEarthTexture(blurLevel) {
    // blurLevel: 0 = sharp, 1 = slightly blurry, 2 = very blurry
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create an ImageData array for the entire canvas
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Earth radius in pixels
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;
    
    // Sample Earth texture using approximate NASA Blue Marble colors
    // This creates a recognizable Earth pattern
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Calculate normalized coordinates (-1 to 1)
            const nx = (x - centerX) / radius;
            const ny = (y - centerY) / radius;
            
            // Check if pixel is inside the Earth disk
            if (nx * nx + ny * ny > 1) {
                // Outside Earth - space (black)
                const idx = (y * canvas.width + x) * 4;
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
                continue;
            }
            
            // Convert to latitude/longitude
            const lat = Math.asin(ny) * 180 / Math.PI;
            const lng = Math.atan2(nx, -ny) * 180 / Math.PI;
            
            // Normalize longitude to 0-360
            const normalizedLng = (lng + 180) % 360;
            
            // Get color based on location
            const color = getEarthColor(lat, normalizedLng);
            
            const idx = (y * canvas.width + x) * 4;
            data[idx] = color.r;
            data[idx + 1] = color.g;
            data[idx + 2] = color.b;
            data[idx + 3] = 255;
        }
    }
    
    // Apply blur if needed
    if (blurLevel > 0) {
        applyBoxBlur(data, canvas.width, canvas.height, blurLevel * 8);
    }
    
    // Add noise for telescope effect
    if (blurLevel >= 2) {
        addNoiseToImageData(data, canvas.width * canvas.height, 30);
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return new THREE.CanvasTexture(canvas);
}

function getEarthColor(lat, lng) {
    // Simplified Earth color mapping based on approximate geography
    
    // Polar regions (ice)
    if (lat > 60) {
        // North pole - Arctic
        return { r: 220, g: 230, b: 245 };
    }
    if (lat < -60) {
        // South pole - Antarctica
        return { r: 220, g: 230, b: 245 };
    }
    
    // Check if over ocean or land
    const isLand = isLandAt(lat, lng);
    
    if (!isLand) {
        // Ocean colors vary by depth and location
        const baseBlue = 20 + Math.random() * 10;
        const baseGreen = 60 + Math.random() * 20;
        const baseRed = 10 + Math.random() * 5;
        return { r: baseRed, g: baseGreen, b: 120 + Math.random() * 40 };
    }
    
    // Land - vary by biome
    // Deserts (Sahara, Australia, etc.)
    if ((lat > 15 && lat < 35 && lng > 340 && lng < 20) ||
        (lat > -40 && lat < -10 && lng > 110 && lng < 150)) {
        return { r: 210, g: 180, b: 140 };
    }
    
    // Forests/vegetation (temperate zones)
    if (Math.abs(lat) < 50) {
        return { 
            r: 50 + Math.random() * 30,
            g: 100 + Math.random() * 50,
            b: 40 + Math.random() * 20
        };
    }
    
    // Mountains
    if ((lat > 25 && lat < 40 && lng > 70 && lng < 100) ||  // Himalayas
        (lat > 35 && lat < 60 && lng > 220 && lng < 250)) { // Rockies
        return { r: 80, g: 60, b: 40 };
    }
    
    // Default land
    return { 
        r: 80 + Math.random() * 40,
        g: 100 + Math.random() * 40,
        b: 50 + Math.random() * 20
    };
}

function isLandAt(lat, lng) {
    // Simplified continent detection
    // This is a rough approximation of Earth's land masses
    
    // Normalize
    lat = Math.abs(lat);
    
    // Africa (centered on prime meridian)
    if (lng > 340 || lng < 40) {
        if (lat > 10 && lat < 40) return true;
    }
    
    // Eurasia
    if (lng > 0 && lng < 180) {
        if (lat > 30 && lat < 70) return true;
    }
    
    // North America
    if (lng > 220 && lng < 320) {
        if (lat > 10 && lat < 70) return true;
    }
    
    // South America
    if (lng > 280 && lng < 330) {
        if (lat > 0 && lat < 60) return true;
    }
    
    // Australia
    if (lng > 110 && lng < 160) {
        if (lat > 10 && lat < 45) return true;
    }
    
    // Antarctica
    if (lat > 60) return true;
    
    return false;
}

function applyBoxBlur(data, width, height, radius) {
    // Simple box blur implementation
    const tempBuffer = new Uint8ClampedArray(data.length);
    
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
            
            tempBuffer[idx] = r / count;
            tempBuffer[idx + 1] = g / count;
            tempBuffer[idx + 2] = b / count;
            tempBuffer[idx + 3] = a / count;
        }
    }
    
    // Copy back
    for (let i = 0; i < data.length; i++) {
        data[i] = tempBuffer[i];
    }
}

function addNoiseToImageData(data, pixelCount, intensity) {
    for (let i = 0; i < pixelCount; i++) {
        const idx = i * 4;
        const noise = Math.random() * intensity - intensity / 2;
        data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
    }
}

function createPartialEarthTexture(side) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const nx = (x - centerX) / radius;
            const ny = (y - centerY) / radius;
            
            if (nx * nx + ny * ny > 1) {
                const idx = (y * canvas.width + x) * 4;
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
                continue;
            }
            
            const lat = Math.asin(ny) * 180 / Math.PI;
            const lng = Math.atan2(nx, -ny) * 180 / Math.PI;
            const normalizedLng = (lng + 180) % 360;
            
            const color = getEarthColor(lat, normalizedLng);
            
            const idx = (y * canvas.width + x) * 4;
            
            // Determine if this is on the clear side
            const angle = Math.atan2(nx, -ny); // -π to π
            const isClearSide = side === 'right' ? angle < 0 : angle > 0;
            
            if (isClearSide) {
                // Clear side - use original color
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
            } else {
                // Blurry side - use blurred/smudged color
                // Sample from a wider area
                const sampleRadius = 8;
                let r = 0, g = 0, b = 0;
                let count = 0;
                
                for (let sy = Math.max(0, y - sampleRadius); sy <= Math.min(canvas.height - 1, y + sampleRadius); sy++) {
                    for (let sx = Math.max(0, x - sampleRadius); sx <= Math.min(canvas.width - 1, x + sampleRadius); sx++) {
                        const sidx = (sy * canvas.width + sx) * 4;
                        // Only sample valid Earth pixels (not space)
                        if (data[sidx + 3] > 0) {
                            r += data[sidx];
                            g += data[sidx + 1];
                            b += data[sidx + 2];
                            count++;
                        }
                    }
                }
                
                if (count > 0) {
                    data[idx] = Math.min(255, r / count + (Math.random() * 20 - 10));
                    data[idx + 1] = Math.min(255, g / count + (Math.random() * 20 - 10));
                    data[idx + 2] = Math.min(255, b / count + (Math.random() * 20 - 10));
                } else {
                    data[idx] = color.r;
                    data[idx + 1] = color.g;
                    data[idx + 2] = color.b;
                }
            }
            
            data[idx + 3] = 255;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return new THREE.CanvasTexture(canvas);
}

function createDetailedEarthTexture() {
    return createRealisticEarthTexture(0);
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
    const color = getEarthColor(lat, (lng + 180) % 360);
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
        <p><strong>Composition:</strong> N₂ (${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%), O₂ (${ATMOSPHERE_COMPOSITION.oxygen.percentage}%)</p>
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
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Earth with textures
    createEarth();
    
    window.addEventListener('resize', onWindowResize);
    globeContainer.addEventListener('click', onGlobeClick);
    
    animate();
}

function createEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Create textures
    blurryTexture = createRealisticEarthTexture(2); // Very blurry
    partialTexture = createRealisticEarthTexture(2); // Will be regenerated on flyby
    detailedTexture = createDetailedEarthTexture();
    
    // Material
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
            partialTexture = createPartialEarthTexture(gameState.flybyUnblurSide);
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
