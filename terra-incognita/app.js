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
        paperAbstracts: ['High-resolution imaging reveals extensive blue regions with spectral signatures consistent with liquid water. These features cover approximately 71% of Earth\'s surface.'],
        favor: 4
    },
    continental: {
        name: 'Land Masses',
        headlines: ['REVOLUTIONARY: EARTH HAS SOLID LAND - NOT JUST WATER'],
        paperTitles: ['Geomorphic Analysis of Earth\'s Continental Landmasses'],
        paperAbstracts: ['Imaging data reveals distinct continental landmasses with varied albedo and texture. These features appear to be composed of silicate minerals.'],
        favor: 3
    },
    mountains: {
        name: 'Mountain Ranges',
        headlines: ['MYSTERY: EARTH\'S MOUNTAINS REACH FOR THE SKY'],
        paperTitles: ['Topographic Analysis of Earth\'s Mountain Systems'],
        paperAbstracts: ['Stereo imaging reveals mountain ranges on Earth with elevations exceeding 8 kilometers above mean surface level.'],
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
let earthTexture, blurryEarthTexture, partialEarthTexture, detailedEarthTexture, cloudTexture;
let textureLoader;

// Use NASA Blue Marble Next Generation - public domain, equirectangular projection
// This is the standard Earth image used by most globe libraries
const EARTH_TEXTURE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Whole_world_-_land_and_oceans_12000.jpg/2048px-Whole_world_-_land_and_oceans_12000.jpg';
const CLOUD_TEXTURE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Earth_cloud_map.jpg/2048px-Earth_cloud_map.jpg';

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
// Texture Processing
// ============================================

function createBlurryTextureFromImage(sourceTexture, blurAmount) {
    // Create a canvas and draw the source texture scaled down
    const canvas = document.createElement('canvas');
    const scale = 1 / (blurAmount + 1);
    canvas.width = Math.max(1, sourceTexture.image.width * scale);
    canvas.height = Math.max(1, sourceTexture.image.height * scale);
    const ctx = canvas.getContext('2d');
    
    // Draw scaled down (this creates blur)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceTexture.image, 0, 0, canvas.width, canvas.height);
    
    // Scale back up to original size
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = sourceTexture.image.width;
    finalCanvas.height = sourceTexture.image.height;
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
    
    // Add film grain noise for telescope effect
    if (blurAmount >= 2) {
        const imageData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30 - 15;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        finalCtx.putImageData(imageData, 0, 0);
    }
    
    const texture = new THREE.CanvasTexture(finalCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
}

function createPartialTextureFromImage(sourceTexture, side) {
    // Create a canvas with the same dimensions
    const canvas = document.createElement('canvas');
    canvas.width = sourceTexture.image.width;
    canvas.height = sourceTexture.image.height;
    const ctx = canvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(sourceTexture.image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply blur to one hemisphere
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            
            // Determine which hemisphere this pixel is in
            // In equirectangular projection, x position = longitude
            const isClearSide = side === 'right' ? x > canvas.width / 2 : x < canvas.width / 2;
            
            if (!isClearSide) {
                // Apply blur to this pixel
                const radius = 8;
                let r = 0, g = 0, b = 0;
                let count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const sx = Math.max(0, Math.min(canvas.width - 1, x + dx));
                        const sy = Math.max(0, Math.min(canvas.height - 1, y + dy));
                        const sidx = (sy * canvas.width + sx) * 4;
                        r += data[sidx];
                        g += data[sidx + 1];
                        b += data[sidx + 2];
                        count++;
                    }
                }
                
                data[idx] = r / count;
                data[idx + 1] = g / count;
                data[idx + 2] = b / count;
                
                // Add noise
                const noise = Math.random() * 20 - 10;
                data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
                data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
                data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
}

// ============================================
// Feature Detection from Flyby
// ============================================

function analyzeFlybyResults() {
    const discoveries = [];
    
    gameState.atmosphereData = {
        thickness: '~100 km',
        composition: ATMOSPHERE_COMPOSITION,
        pressure: '~1013 hPa at surface',
        temperature: '-60°C to +30°C range'
    };
    
    gameState.magneticFieldDetected = true;
    gameState.flybyUnblurSide = Math.random() < 0.5 ? 'left' : 'right';
    
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
    
    headlines.push('BREAKING: EARTH HAS THICK ATMOSPHERE - COMPOSITION UNLIKE MARS');
    papers.push({
        title: 'Atmospheric Composition of Earth: First In-Situ Measurements from Flyby',
        abstract: `Spectroscopic analysis during the flyby reveals Earth's atmosphere is composed primarily of nitrogen (${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%) and oxygen (${ATMOSPHERE_COMPOSITION.oxygen.percentage}%), with trace amounts of argon, carbon dioxide, and water vapor. The total surface pressure is approximately ${gameState.atmosphereData.pressure}, significantly higher than Mars' thin atmosphere.`
    });
    
    headlines.push('STUNNING: EARTH HAS POWERFUL MAGNETIC FIELD - PLANETARY DYNAMO CONFIRMED');
    papers.push({
        title: 'Detection of a Global Magnetic Field on Earth: Evidence for a Liquid Core',
        abstract: 'Magnetometer readings during the flyby reveal a strong dipolar magnetic field with a surface strength of approximately 25-65 microteslas. This field is consistent with a geodynamo generated by convection in a liquid iron-nickel outer core.'
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

// ============================================
// Geology Classification
// ============================================

function classifyGeology(lat, lng) {
    lat = Math.abs(lat);
    lng = lng < 0 ? lng + 360 : lng;
    
    const isOcean = (
        (lng > 120 && lng < 280 && lat < 60) ||
        (lng > 280 && lng < 340 && lat < 70) ||
        (lng > 20 && lng < 60 && lat < 70) ||
        (lng > 20 && lng < 120 && lat < 30) ||
        (lat > 70) ||
        (lat > 50 && lng > 120 && lng < 280)
    );
    
    if (isOcean) {
        return { name: 'Ocean Basin', rockType: 'Basalt', description: 'Deep ocean floor', color: '#1a3a8f' };
    }
    
    if (lat > 65) {
        return { name: 'Polar Region', rockType: 'Ice', description: 'Ice sheets', color: '#add8e6' };
    }
    
    return { name: 'Continental Crust', rockType: 'Granite/Gneiss', description: 'Ancient crystalline rocks', color: '#8b4513' };
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
    
    addLogEntry('🛰️ Flyby Mission Launched', 'info', 'Spacecraft on trajectory for high-speed Earth pass. Imaging and sensor data will be collected during closest approach...', null, null, null);
    
    setTimeout(() => {
        gameState.flybyPhotos = generateFlybyPhotos();
        const discoveries = analyzeFlybyResults();
        const { headlines, papers } = generateHeadlines(discoveries);
        
        gameState.earthTextureState = 'partial';
        updateEarthTexture();
        
        displayFlybyResults(gameState.flybyPhotos, discoveries, headlines, papers);
        
        addLogEntry(
            '🛰️ Flyby Mission Complete',
            'success',
            `Flyby successful! Collected data from ${gameState.flybyPhotos.length} imaging passes. The ${gameState.flybyUnblurSide} hemisphere now at improved resolution. Atmosphere and magnetic field data received.`,
            headlines[0],
            papers[0].title,
            papers[0].abstract
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
    const geology = classifyGeology(lat, lng);
    if (geology.rockType === 'Basalt') features.push('ocean');
    else if (geology.rockType === 'Ice') features.push('polarIce');
    else features.push('continental');
    if (Math.random() < 0.3) features.push('mountains');
    return features;
}

function getLocationThumbnailColor(lat, lng) {
    const geology = classifyGeology(lat, lng);
    if (geology.rockType === 'Basalt') return '#1a3a8f';
    if (geology.rockType === 'Ice') return '#add8e6';
    return '#8b4513';
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
        <h4>Atmosphere Analysis:</h4>
        <p><strong>Thickness:</strong> ${gameState.atmosphereData.thickness}</p>
        <p><strong>Surface Pressure:</strong> ${gameState.atmosphereData.pressure}</p>
        <p><strong>Temperature Range:</strong> ${gameState.atmosphereData.temperature}</p>
        <p><strong>Primary Composition:</strong></p>
        <ul>
            <li>Nitrogen (N₂): ${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%</li>
            <li>Oxygen (O₂): ${ATMOSPHERE_COMPOSITION.oxygen.percentage}%</li>
            <li>Argon (Ar): ${ATMOSPHERE_COMPOSITION.argon.percentage}%</li>
            <li>Carbon Dioxide (CO₂): ${ATMOSPHERE_COMPOSITION.carbonDioxide.percentage}%</li>
        </ul>
    `;
    
    flybyMagneticDiv.innerHTML = `
        <h4>Magnetic Field Detection:</h4>
        <p><strong>Status:</strong> ✓ DETECTED</p>
        <p><strong>Type:</strong> Global dipolar field</p>
        <p><strong>Surface Strength:</strong> 25-65 microteslas</p>
        <p><strong>Implications:</strong> Liquid iron-nickel outer core confirmed</p>
        <p><strong>Comparison:</strong> ~100x stronger than Mars' residual crustal magnetism</p>
    `;
    
    flybyResultsDiv.style.display = 'block';
}

function launchOrbiter() {
    if (gameState.budget < MISSION_TYPES.orbiter.cost) {
        addLogEntry('Insufficient budget for Orbiter mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.orbiter.cost;
    gameState.missionsLaunched++;
    gameState.isSelectingTarget = false;
    gameState.geologyRevealed = true;
    gameState.earthTextureState = 'detailed';
    
    updateEarthTexture();
    
    addLogEntry(
        '🌍 Orbiter Mission Launched',
        'success',
        'Revealed coarse geologic map of Earth. Major landforms and rock type distributions now visible.',
        'BREAKING: EARTH HAS DIVERSE TERRAIN - NOT JUST BASALT!',
        'Global Geologic Survey from Orbit: First Evidence of Continental Crust',
        'Preliminary analysis reveals Earth has both oceanic and continental crust types, with mountain ranges, sedimentary basins, and volcanic arcs. This diversity is unlike anything observed on the Moon or Mars.'
    );
    
    gameState.budget += 4;
    updateUI();
}

function launchImpactProbe(lat, lng) {
    if (gameState.budget < MISSION_TYPES.impact.cost) {
        addLogEntry('Insufficient budget for Impact Probe mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.impact.cost;
    gameState.missionsLaunched++;
    
    const geology = classifyGeology(lat, lng);
    
    gameState.revealedAreas.push({
        lat: lat,
        lng: lng,
        radius: 5,
        type: 'impact'
    });
    
    addLogEntry(
        '💥 Impact Probe Mission',
        'success',
        `Impact at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Found ${geology.rockType}. ${geology.description}.`,
        'BREAKING: EARTH\'S SURFACE COMPOSITION REVEALED',
        'First Direct Measurement of Terrestrial Surface Materials',
        `The impact probe returned samples of ${geology.rockType}, confirming the presence of ${geology.name} in this region. Chemical analysis is underway.`
    );
    
    gameState.budget += 2;
    updateUI();
}

function launchLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.lander.cost) {
        addLogEntry('Insufficient budget for Lander mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.lander.cost;
    gameState.missionsLaunched++;
    
    const geology = classifyGeology(lat, lng);
    
    gameState.revealedAreas.push({
        lat: lat,
        lng: lng,
        radius: 10,
        type: 'lander'
    });
    
    addLogEntry(
        '🚀 Lander Mission',
        'success',
        `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Astronauts report: "We're on a surface of ${geology.rockType.toLowerCase()}. The samples show ${geology.description.toLowerCase()}."`,
        'SUCCESS: FIRST SOFT LANDING ON EARTH',
        'In-Situ Analysis of Terrestrial Surface Materials',
        `The lander has successfully touched down and conducted preliminary analysis. The surface is composed of ${geology.rockType}, with ${geology.description}. Initial measurements suggest this region is part of Earth's ${geology.name}.`
    );
    
    gameState.budget += 4;
    updateUI();
}

function launchAdvancedLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.advancedLander.cost) {
        addLogEntry('Insufficient budget for Advanced Lander mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.advancedLander.cost;
    gameState.missionsLaunched++;
    
    const geology = classifyGeology(lat, lng);
    
    gameState.revealedAreas.push({
        lat: lat,
        lng: lng,
        radius: 15,
        type: 'advanced'
    });
    
    const enhancedDescription = `${geology.description}. Advanced instruments reveal age: ${Math.floor(Math.random() * 4000 + 500)} million years.`;
    
    addLogEntry(
        '🔬 Advanced Lander Mission',
        'success',
        `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Comprehensive analysis: ${enhancedDescription}`,
        'HISTORIC: DEEP CORE SAMPLES RETRIEVED FROM EARTH',
        'Radiometric Dating and Geochemical Analysis of Terrestrial Materials',
        `The advanced lander has conducted a comprehensive analysis of Earth's surface and subsurface. ${enhancedDescription} Radiometric dating confirms the age of these formations, providing critical constraints on Earth's geologic history.`
    );
    
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
        if (btn) {
            btn.disabled = gameState.budget < mission.cost;
        }
    }
}

function addLogEntry(title, type, description, headline, paperTitle, paperAbstract) {
    const logEntries = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    let content = '';
    if (headline) {
        content += `<div class="headline">${headline}</div>`;
    }
    if (title && !headline) {
        content += `<div class="log-title">${title}</div>`;
    }
    if (description) {
        content += `<div class="description">${description}</div>`;
    }
    if (paperTitle && paperAbstract) {
        content += `<div class="paper"><strong>${paperTitle}</strong><br><em>Abstract:</em> ${paperAbstract}</div>`;
    }
    content += `<div class="meta">Mission ${gameState.missionsLaunched}  ${timeStr}</div>`;
    
    entry.innerHTML = content;
    logEntries.prepend(entry);
    
    gameState.discoveries.push({
        title: title,
        type: type,
        description: description,
        headline: headline,
        paperTitle: paperTitle,
        paperAbstract: paperAbstract,
        time: now
    });
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
    
    // Initialize texture loader
    textureLoader = new THREE.TextureLoader();
    
    // Create Earth
    createEarth();
    
    window.addEventListener('resize', onWindowResize);
    globeContainer.addEventListener('click', onGlobeClick);
    
    animate();
}

function createEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Create a placeholder material
    const placeholderMaterial = new THREE.MeshPhongMaterial({
        color: 0x224488,
        shininess: 0
    });
    
    earth = new THREE.Mesh(geometry, placeholderMaterial);
    scene.add(earth);
    
    // Load the real Earth texture
    loadEarthTextures();
    
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

function loadEarthTextures() {
    // Load the NASA Blue Marble texture
    textureLoader.load(
        EARTH_TEXTURE_URL,
        (texture) => {
            earthTexture = texture;
            earthTexture.colorSpace = THREE.SRGBColorSpace;
            earthTexture.anisotropy = 16;
            
            // Create blurry version (starting state - very blurry telescope view)
            blurryEarthTexture = createBlurryTextureFromImage(earthTexture, 3);
            
            // Create partial version (will be updated on flyby)
            partialEarthTexture = createBlurryTextureFromImage(earthTexture, 3);
            
            // Detailed is the original
            detailedEarthTexture = earthTexture;
            
            // Set initial texture
            earth.material.map = blurryEarthTexture;
            earth.material.needsUpdate = true;
            
            console.log('Earth texture loaded successfully');
        },
        undefined,
        (error) => {
            console.error('Error loading Earth texture:', error);
            console.log('Falling back to canvas-based texture');
            // Fallback to canvas-based Earth
            const canvas = createFallbackEarthCanvas();
            earthTexture = new THREE.CanvasTexture(canvas);
            blurryEarthTexture = createBlurryTextureFromImage(earthTexture, 3);
            partialEarthTexture = createBlurryTextureFromImage(earthTexture, 3);
            detailedEarthTexture = earthTexture;
            earth.material.map = blurryEarthTexture;
            earth.material.needsUpdate = true;
        }
    );
    
    // Load cloud texture
    textureLoader.load(
        CLOUD_TEXTURE_URL,
        (texture) => {
            cloudTexture = texture;
            cloudTexture.colorSpace = THREE.SRGBColorSpace;
            cloudTexture.anisotropy = 16;
            cloudsMesh.material.map = cloudTexture;
            cloudsMesh.material.needsUpdate = true;
            console.log('Cloud texture loaded');
        },
        undefined,
        (error) => {
            console.log('Could not load cloud texture');
        }
    );
}

function createFallbackEarthCanvas() {
    // Create a simple Earth-like texture as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Fill with ocean blue
    ctx.fillStyle = '#0a2448';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw continents
    ctx.fillStyle = '#5a8a4a';
    
    // Africa
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.45, canvas.height * 0.35);
    ctx.bezierCurveTo(canvas.width * 0.45, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.2, canvas.width * 0.55, canvas.height * 0.25);
    ctx.bezierCurveTo(canvas.width * 0.6, canvas.height * 0.3, canvas.width * 0.6, canvas.height * 0.45, canvas.width * 0.55, canvas.height * 0.5);
    ctx.bezierCurveTo(canvas.width * 0.5, canvas.height * 0.55, canvas.width * 0.45, canvas.height * 0.55, canvas.width * 0.45, canvas.height * 0.35);
    ctx.fill();
    
    // Eurasia
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.55, canvas.height * 0.25);
    ctx.bezierCurveTo(canvas.width * 0.65, canvas.height * 0.2, canvas.width * 0.8, canvas.height * 0.25, canvas.width * 0.85, canvas.height * 0.35);
    ctx.bezierCurveTo(canvas.width * 0.9, canvas.height * 0.4, canvas.width * 0.85, canvas.height * 0.5, canvas.width * 0.75, canvas.height * 0.5);
    ctx.bezierCurveTo(canvas.width * 0.65, canvas.height * 0.5, canvas.width * 0.55, canvas.height * 0.4, canvas.width * 0.55, canvas.height * 0.25);
    ctx.fill();
    
    // North America
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.25, canvas.height * 0.3);
    ctx.bezierCurveTo(canvas.width * 0.2, canvas.height * 0.25, canvas.width * 0.3, canvas.height * 0.25, canvas.width * 0.35, canvas.height * 0.3);
    ctx.bezierCurveTo(canvas.width * 0.4, canvas.height * 0.35, canvas.width * 0.4, canvas.height * 0.5, canvas.width * 0.3, canvas.height * 0.55);
    ctx.bezierCurveTo(canvas.width * 0.25, canvas.height * 0.5, canvas.width * 0.25, canvas.height * 0.4, canvas.width * 0.25, canvas.height * 0.3);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.3, canvas.height * 0.55);
    ctx.bezierCurveTo(canvas.width * 0.35, canvas.height * 0.5, canvas.width * 0.4, canvas.height * 0.55, canvas.width * 0.4, canvas.height * 0.7);
    ctx.bezierCurveTo(canvas.width * 0.35, canvas.height * 0.75, canvas.width * 0.3, canvas.height * 0.7, canvas.width * 0.3, canvas.height * 0.55);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.75, canvas.height * 0.65);
    ctx.bezierCurveTo(canvas.width * 0.8, canvas.height * 0.6, canvas.width * 0.85, canvas.height * 0.65, canvas.width * 0.85, canvas.height * 0.7);
    ctx.bezierCurveTo(canvas.width * 0.8, canvas.height * 0.75, canvas.width * 0.75, canvas.height * 0.75, canvas.width * 0.75, canvas.height * 0.65);
    ctx.fill();
    
    // Antarctica
    ctx.fillStyle = '#d0e0f0';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.9, canvas.width * 0.4, canvas.height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
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
    if (!earthTexture) {
        // Textures still loading
        return;
    }
    
    switch (gameState.earthTextureState) {
        case 'blurry':
            earth.material.map = blurryEarthTexture;
            break;
        case 'partial':
            partialEarthTexture = createPartialTextureFromImage(earthTexture, gameState.flybyUnblurSide);
            earth.material.map = partialEarthTexture;
            break;
        case 'detailed':
            earth.material.map = detailedEarthTexture;
            break;
    }
    
    earth.material.needsUpdate = true;
    
    if (gameState.atmosphereData) {
        atmosphereMesh.material.opacity = 0.25;
    }
    
    if (gameState.flybyComplete && cloudTexture) {
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
                    addLogEntry(`Select target location for ${mission.name} mission`, 'info');
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
        'As a Martian scientist, you have been placed in charge of the first comprehensive exploration program of Earth. Our current knowledge is limited to blurry optical images and occultation data suggesting the presence of an atmosphere. The Martian President has declared: "We choose to go to the Earth" - and you are the one who will make it happen.',
        'MARTIAN PRESIDENT: "WE CHOOSE TO GO TO THE EARTH"',
        'Initial Reconnaissance Report: The Blue Planet',
        'Preliminary telescopic observations reveal Earth to be a blue world with white polar caps and faint dark surface features. Occultation data during solar transits indicates the presence of a substantial atmosphere, with estimated surface pressure orders of magnitude higher than Mars. The nature of the dark features remains unknown - they could be oceans, forests, or some other surface material. Polar caps appear to be ice, suggesting the presence of water on this planet.'
    );
}

window.addEventListener('DOMContentLoaded', init);
