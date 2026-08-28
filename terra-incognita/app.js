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
        description: 'Large blue regions covering significant portions of the surface',
        scientificName: 'Hydrosphere',
        headlines: [
            'BREAKING: EARTH COVERED IN LIQUID - MASSIVE BLUE REGIONS DETECTED',
            'SHOCKING DISCOVERY: EARTH HAS OCEANS - WATER WORLD CONFIRMED'
        ],
        paperTitles: [
            'Spectroscopic Confirmation of Liquid Water on Earth\'s Surface',
            'Global Distribution of Terrestrial Hydrospheric Features'
        ],
        paperAbstracts: [
            'High-resolution imaging reveals extensive blue regions with spectral signatures consistent with liquid water. These features cover approximately 71% of Earth\'s surface.',
            'Analysis of flyby imagery shows large, interconnected water bodies with varying albedo patterns.'
        ],
        favor: 4,
        color: '#1a3a8f'
    },
    continental: {
        name: 'Land Masses',
        description: 'Brown and green regions breaking up the blue expanse',
        scientificName: 'Continental Crust',
        headlines: [
            'REVOLUTIONARY: EARTH HAS SOLID LAND - NOT JUST WATER',
            'BREAKTHROUGH: CONTINENTS DISCOVERED ON EARTH'
        ],
        paperTitles: [
            'Geomorphic Analysis of Earth\'s Continental Landmasses',
            'Terrestrial Lithosphere: Composition and Structure'
        ],
        paperAbstracts: [
            'Imaging data reveals distinct continental landmasses with varied albedo and texture. These features appear to be composed of silicate minerals.',
            'The continental regions of Earth show complex topography with mountain ranges, plains, and other geomorphic features.'
        ],
        favor: 3,
        color: '#8b4513'
    },
    mountains: {
        name: 'Mountain Ranges',
        description: 'Linear features with high relief and shadow patterns',
        scientificName: 'Orogenic Belts',
        headlines: [
            'MYSTERY: EARTH\'S MOUNTAINS REACH FOR THE SKY',
            'INCREDIBLE: TOWERING PEAKS DISCOVERED ON EARTH'
        ],
        paperTitles: [
            'Topographic Analysis of Earth\'s Mountain Systems',
            'Orogenic Processes on Earth: Evidence from Remote Sensing'
        ],
        paperAbstracts: [
            'Stereo imaging reveals mountain ranges on Earth with elevations exceeding 8 kilometers above mean surface level.',
            'The linear arrangement and scale of Earth\'s mountain systems suggest they are formed by plate tectonics.'
        ],
        favor: 5,
        color: '#5a3a22'
    },
    clouds: {
        name: 'Atmospheric Clouds',
        description: 'White, dynamic features moving across the surface',
        scientificName: 'Tropospheric Condensates',
        headlines: [
            'STUNNING: EARTH\'S SKY IS FILLED WITH MOVING CLOUDS',
            'BREAKING: DYNAMIC WEATHER SYSTEMS OBSERVED ON EARTH'
        ],
        paperTitles: [
            'Atmospheric Dynamics on Earth: Observations of Cloud Systems',
            'Tropospheric Circulation Patterns on Earth'
        ],
        paperAbstracts: [
            'Time-lapse imaging reveals dynamic cloud systems moving across Earth\'s surface at speeds of 10-100 km/h.',
            'The global distribution of clouds on Earth shows distinct patterns, with concentration along the equator and in mid-latitudes.'
        ],
        favor: 3,
        color: '#ffffff'
    },
    polarIce: {
        name: 'Polar Ice Caps',
        description: 'Bright white regions at the north and south poles',
        scientificName: 'Cryosphere',
        headlines: [
            'CONFIRMED: EARTH HAS ICE CAPS AT BOTH POLES',
            'BREAKING: MASSIVE ICE DEPOSITS DISCOVERED ON EARTH'
        ],
        paperTitles: [
            'Cryospheric Features of Earth: Polar Ice Cap Analysis',
            'The White Poles: Composition and Extent of Earth\'s Ice Caps'
        ],
        paperAbstracts: [
            'High-albedo regions at both poles of Earth are confirmed to be ice caps, covering approximately 10% of the planet\'s surface.',
            'The polar ice caps on Earth show seasonal variations in extent, with winter expansion and summer retreat.'
        ],
        favor: 4,
        color: '#add8e6'
    },
    cities: {
        name: 'Artificial Structures',
        description: 'Geometric patterns and lights visible at night',
        scientificName: 'Technosignatures',
        headlines: [
            'UNBELIEVABLE: SIGNS OF INTELLIGENT LIFE ON EARTH',
            'BREAKING: EARTH HAS CITIES - ADVANCED CIVILIZATION CONFIRMED'
        ],
        paperTitles: [
            'Detection of Technosignatures on Earth: Evidence for Intelligent Life',
            'Urban Patterns on Earth: Analysis of Artificial Surface Modifications'
        ],
        paperAbstracts: [
            'High-resolution imaging reveals geometric patterns and structures on Earth\'s surface that are inconsistent with natural processes.',
            'Night-time observations of Earth reveal extensive artificial illumination, concentrated in specific regions.'
        ],
        favor: 10,
        color: '#ffd700'
    },
    vegetation: {
        name: 'Green Regions',
        description: 'Areas with distinct green coloration',
        scientificName: 'Biosphere',
        headlines: [
            'ASTONISHING: EARTH HAS GREEN REGIONS - POSSIBLE VEGETATION',
            'BREAKING: ORGANIC COMPOUNDS DETECTED ON EARTH\'S SURFACE'
        ],
        paperTitles: [
            'Spectral Signatures of Photosynthetic Activity on Earth',
            'The Green Planet: Evidence for Terrestrial Biosphere'
        ],
        paperAbstracts: [
            'Multispectral imaging reveals regions on Earth with strong absorption features in the red and blue wavelengths.',
            'The green coloration of certain land areas on Earth shows seasonal variations.'
        ],
        favor: 6,
        color: '#228b22'
    }
};

const ATMOSPHERE_COMPOSITION = {
    nitrogen: { percentage: 78 },
    oxygen: { percentage: 21 },
    argon: { percentage: 0.93 },
    carbonDioxide: { percentage: 0.04 },
    waterVapor: { percentage: 'variable' }
};

// ============================================
// Mission Types
// ============================================

let scene, camera, renderer, earth, controls, atmosphereMesh, cloudsMesh;
let raycaster, mouse;

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
        description: 'Reveals coarse geologic map of a region',
        action: launchOrbiter
    },
    impact: {
        name: 'Impact Probe',
        cost: 1,
        icon: '💥',
        description: 'Crash-lands at target, returns basic geology',
        action: launchImpactProbe
    },
    lander: {
        name: 'Lander',
        cost: 5,
        icon: '🚀',
        description: 'Gentle landing with full analysis',
        action: launchLander
    },
    advancedLander: {
        name: 'Advanced Lander',
        cost: 8,
        icon: '🔬',
        description: 'Deep core sample with age dating',
        action: launchAdvancedLander
    }
};

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
    
    const possibleFeatures = ['ocean', 'continental', 'mountains', 'clouds', 'polarIce'];
    const numFeatures = Math.floor(Math.random() * 2) + 3;
    
    const shuffled = [...possibleFeatures].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numFeatures, shuffled.length); i++) {
        discoveries.push(shuffled[i]);
    }
    
    if (Math.random() < 0.1) discoveries.push('cities');
    if (Math.random() < 0.3) discoveries.push('vegetation');
    
    return discoveries;
}

function generateHeadlines(discoveries) {
    const headlines = [];
    const papers = [];
    
    headlines.push('BREAKING: EARTH HAS THICK ATMOSPHERE - COMPOSITION UNLIKE MARS');
    papers.push({
        title: 'Atmospheric Composition of Earth: First In-Situ Measurements',
        abstract: `Spectroscopic analysis reveals Earth's atmosphere is composed primarily of nitrogen (${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%) and oxygen (${ATMOSPHERE_COMPOSITION.oxygen.percentage}%). Surface pressure: ${gameState.atmosphereData.pressure}.`
    });
    
    headlines.push('STUNNING: EARTH HAS POWERFUL MAGNETIC FIELD - PLANETARY DYNAMO CONFIRMED');
    papers.push({
        title: 'Detection of a Global Magnetic Field on Earth',
        abstract: 'Magnetometer readings reveal a strong dipolar magnetic field with surface strength of 25-65 microteslas, consistent with a liquid iron-nickel outer core.'
    });
    
    for (const feature of discoveries) {
        const featureData = DISCOVERY_FEATURES[feature];
        headlines.push(featureData.headlines[0]);
        papers.push({
            title: featureData.paperTitles[0],
            abstract: featureData.paperAbstracts[0]
        });
    }
    
    return { headlines, papers };
}

// ============================================
// Geologic Data Templates
// ============================================

const GEOLOGY_TEMPLATES = {
    ocean: { name: 'Ocean Basin', rockType: 'Basalt', description: 'Deep ocean floor', color: '#1a3a8f' },
    continental: { name: 'Continental Crust', rockType: 'Granite/Gneiss', description: 'Ancient crystalline rocks', color: '#8b4513' },
    mountains: { name: 'Mountain Range', rockType: 'Metamorphic', description: 'Highly deformed rocks', color: '#5a3a22' },
    sedimentary: { name: 'Sedimentary Basin', rockType: 'Limestone/Sandstone', description: 'Layered rocks', color: '#d2b48c' },
    volcanic: { name: 'Volcanic Arc', rockType: 'Andesite', description: 'Intermediate lavas', color: '#8b0000' },
    desert: { name: 'Desert', rockType: 'Sandstone/Evaporites', description: 'Arid environment', color: '#daa520' },
    ice: { name: 'Polar Region', rockType: 'Ice', description: 'Ice sheets', color: '#add8e6' }
};

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
    
    if (isOcean) return GEOLOGY_TEMPLATES.ocean;
    if (lat > 65) return GEOLOGY_TEMPLATES.ice;
    
    const mountainRanges = [
        { latMin: 25, latMax: 40, lngMin: 70, lngMax: 100 },
        { latMin: -55, latMax: 10, lngMin: 280, lngMax: 330 },
        { latMin: 35, latMax: 60, lngMin: 220, lngMax: 250 }
    ];
    
    for (const range of mountainRanges) {
        if (lat >= range.latMin && lat <= range.latMax && lng >= range.lngMin && lng <= range.lngMax) {
            return GEOLOGY_TEMPLATES.mountains;
        }
    }
    
    return Math.random() < 0.2 ? GEOLOGY_TEMPLATES.desert : GEOLOGY_TEMPLATES.continental;
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
        updateEarthTexture();
        
        displayFlybyResults(gameState.flybyPhotos, discoveries, headlines, papers);
        
        addLogEntry(
            '🛰️ Flyby Mission Complete',
            'success',
            `Flyby successful! ${gameState.flybyPhotos.length} imaging passes. The ${gameState.flybyUnblurSide} hemisphere now clearer. Atmosphere and magnetic field data received.`,
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

function generateFlybyPhotos() {
    const photos = [];
    const centerLat = (Math.random() * 140 - 70);
    const centerLng = (Math.random() * 360 - 180);
    
    for (let i = 0; i < 3; i++) {
        const lat = Math.max(-80, Math.min(80, centerLat + (Math.random() * 20 - 10)));
        const lng = (centerLng + (Math.random() * 20 - 10) + 540) % 360 - 180;
        const features = detectFeaturesInPhoto(lat, lng);
        const thumbColor = getLocationColor(lat, lng);
        
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
    if (geology === GEOLOGY_TEMPLATES.ocean) features.push('ocean');
    else features.push('continental');
    if (Math.abs(lat) > 60) features.push('polarIce');
    if (Math.random() < 0.4) features.push('clouds');
    if (Math.random() < 0.3) features.push('mountains');
    if (Math.random() < 0.05) features.push('cities');
    if (Math.random() < 0.15) features.push('vegetation');
    return features;
}

function getLocationColor(lat, lng) {
    const geology = classifyGeology(lat, lng);
    if (geology === GEOLOGY_TEMPLATES.ocean) return `rgb(30, 80, ${Math.floor(140 + Math.random() * 40)})`;
    if (geology === GEOLOGY_TEMPLATES.ice) return '#e6f7ff';
    if (geology === GEOLOGY_TEMPLATES.mountains) return '#654321';
    if (geology === GEOLOGY_TEMPLATES.desert) return '#d2b48c';
    return `rgb(${Math.floor(100 + Math.random() * 60)}, ${Math.floor(100 + Math.random() * 80)}, 50)`;
}

function generatePhotoDescription(features, lat, lng) {
    const descriptions = [];
    if (features.includes('ocean')) descriptions.push('Vast blue expanse');
    if (features.includes('continental')) descriptions.push('Brown and green land');
    if (features.includes('mountains')) descriptions.push('Towering peaks');
    if (features.includes('clouds')) descriptions.push('White clouds');
    if (features.includes('polarIce')) descriptions.push('Bright ice cap');
    if (features.includes('vegetation')) descriptions.push('Green vegetation');
    if (features.includes('cities')) descriptions.push('Geometric patterns');
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
        <p><strong>Composition:</strong> N₂ (${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%), O₂ (${ATMOSPHERE_COMPOSITION.oxygen.percentage}%), Ar, CO₂, H₂O</p>
    `;
    
    flybyMagneticDiv.innerHTML = `
        <h4>Magnetic Field:</h4>
        <p><strong>Status:</strong> ✓ DETECTED</p>
        <p><strong>Strength:</strong> 25-65 microteslas</p>
        <p><strong>Implications:</strong> Liquid iron-nickel core confirmed</p>
    `;
    
    flybyResultsDiv.style.display = 'block';
}

function launchOrbiter() {
    if (gameState.budget < MISSION_TYPES.orbiter.cost) {
        addLogEntry('Insufficient budget', 'error');
        return;
    }
    gameState.budget -= MISSION_TYPES.orbiter.cost;
    gameState.missionsLaunched++;
    gameState.earthTextureState = 'detailed';
    updateEarthTexture();
    addLogEntry('🌍 Orbiter Mission', 'success', 'Global geologic map revealed!', 
        'BREAKING: EARTH HAS DIVERSE TERRAIN', 'Global Geologic Survey', 'Earth has both oceanic and continental crust types.');
    gameState.budget += 4;
    updateUI();
}

function launchImpactProbe(lat, lng) {
    if (gameState.budget < MISSION_TYPES.impact.cost) return;
    gameState.budget -= MISSION_TYPES.impact.cost;
    gameState.missionsLaunched++;
    const geology = classifyGeology(lat, lng);
    addLogEntry('💥 Impact Probe', 'success', `Impact at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Found ${geology.rockType}.`, 
        'SURFACE COMPOSITION REVEALED', 'Direct Measurement', `Found ${geology.rockType} in this region.`);
    gameState.budget += 2;
    updateUI();
}

function launchLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.lander.cost) return;
    gameState.budget -= MISSION_TYPES.lander.cost;
    gameState.missionsLaunched++;
    const geology = classifyGeology(lat, lng);
    addLogEntry('🚀 Lander Mission', 'success', `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Surface: ${geology.rockType}.`, 
        'FIRST SOFT LANDING ON EARTH', 'In-Situ Analysis', `Surface composed of ${geology.rockType}.`);
    gameState.budget += 4;
    updateUI();
}

function launchAdvancedLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.advancedLander.cost) return;
    gameState.budget -= MISSION_TYPES.advancedLander.cost;
    gameState.missionsLaunched++;
    const geology = classifyGeology(lat, lng);
    addLogEntry('🔬 Advanced Lander', 'success', `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Age: ${Math.floor(Math.random() * 4000 + 500)}M years.`, 
        'DEEP CORE SAMPLES RETRIEVED', 'Radiometric Dating', 'Comprehensive analysis completed.');
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
// Three.js - Earth with Canvas Textures
// ============================================

let blurryTexture, partialTexture, detailedTexture;

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
    
    // Create Earth with canvas textures
    createEarthWithCanvasTextures();
    
    window.addEventListener('resize', onWindowResize);
    globeContainer.addEventListener('click', onGlobeClick);
    
    animate();
}

function createEarthWithCanvasTextures() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Create textures
    blurryTexture = createBlurryEarthTexture();
    partialTexture = createBlurryEarthTexture(); // Will be updated on flyby
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

function createBlurryEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base: deep ocean blue
    ctx.fillStyle = '#0a2448';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw continents as blurry green/brown shapes
    ctx.fillStyle = 'rgba(100, 150, 80, 0.4)';
    
    // Africa (centered)
    drawBlurryContinent(ctx, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.25, canvas.height * 0.3);
    
    // Eurasia (top-right)
    drawBlurryContinent(ctx, canvas.width * 0.7, canvas.height * 0.35, canvas.width * 0.35, canvas.height * 0.2);
    
    // North America (top-left)
    drawBlurryContinent(ctx, canvas.width * 0.3, canvas.height * 0.35, canvas.width * 0.25, canvas.height * 0.25);
    
    // South America (bottom-left)
    drawBlurryContinent(ctx, canvas.width * 0.35, canvas.height * 0.6, canvas.width * 0.15, canvas.height * 0.25);
    
    // Australia (bottom-right)
    drawBlurryContinent(ctx, canvas.width * 0.75, canvas.height * 0.65, canvas.width * 0.12, canvas.height * 0.12);
    
    // Antarctica (bottom)
    ctx.fillStyle = 'rgba(200, 220, 240, 0.5)';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.85, canvas.width * 0.4, canvas.height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply heavy blur
    applyBlur(ctx, canvas, 10);
    
    // Add film grain noise
    addNoise(ctx, canvas, 15);
    
    return new THREE.CanvasTexture(canvas);
}

function createDetailedEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base ocean
    ctx.fillStyle = '#0a2448';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Continents with more detail
    ctx.fillStyle = '#5a8a4a';
    drawBlurryContinent(ctx, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.25, canvas.height * 0.3);
    
    ctx.fillStyle = '#6a7a5a';
    drawBlurryContinent(ctx, canvas.width * 0.7, canvas.height * 0.35, canvas.width * 0.35, canvas.height * 0.2);
    
    ctx.fillStyle = '#5a7a5a';
    drawBlurryContinent(ctx, canvas.width * 0.3, canvas.height * 0.35, canvas.width * 0.25, canvas.height * 0.25);
    
    ctx.fillStyle = '#6a8a5a';
    drawBlurryContinent(ctx, canvas.width * 0.35, canvas.height * 0.6, canvas.width * 0.15, canvas.height * 0.25);
    
    ctx.fillStyle = '#7a8a5a';
    drawBlurryContinent(ctx, canvas.width * 0.75, canvas.height * 0.65, canvas.width * 0.12, canvas.height * 0.12);
    
    // Antarctica
    ctx.fillStyle = '#d0e0f0';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.85, canvas.width * 0.4, canvas.height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply light blur
    applyBlur(ctx, canvas, 2);
    
    return new THREE.CanvasTexture(canvas);
}

function createPartialEarthTexture(side) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base ocean
    ctx.fillStyle = '#0a2448';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all continents
    ctx.fillStyle = '#5a8a4a';
    drawBlurryContinent(ctx, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.25, canvas.height * 0.3);
    ctx.fillStyle = '#6a7a5a';
    drawBlurryContinent(ctx, canvas.width * 0.7, canvas.height * 0.35, canvas.width * 0.35, canvas.height * 0.2);
    ctx.fillStyle = '#5a7a5a';
    drawBlurryContinent(ctx, canvas.width * 0.3, canvas.height * 0.35, canvas.width * 0.25, canvas.height * 0.25);
    ctx.fillStyle = '#6a8a5a';
    drawBlurryContinent(ctx, canvas.width * 0.35, canvas.height * 0.6, canvas.width * 0.15, canvas.height * 0.25);
    ctx.fillStyle = '#7a8a5a';
    drawBlurryContinent(ctx, canvas.width * 0.75, canvas.height * 0.65, canvas.width * 0.12, canvas.height * 0.12);
    
    // Antarctica
    ctx.fillStyle = '#d0e0f0';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.85, canvas.width * 0.4, canvas.height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply differential blur
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const relativeX = x / canvas.width;
            const isClearSide = side === 'right' ? relativeX > 0.5 : relativeX < 0.5;
            
            if (!isClearSide) {
                // Heavy blur for blurry side
                const samples = [];
                for (let dy = -4; dy <= 4; dy++) {
                    for (let dx = -4; dx <= 4; dx++) {
                        const sx = Math.max(0, Math.min(canvas.width - 1, x + dx));
                        const sy = Math.max(0, Math.min(canvas.height - 1, y + dy));
                        const sidx = (sy * canvas.width + sx) * 4;
                        samples.push([data[sidx], data[sidx + 1], data[sidx + 2]]);
                    }
                }
                let r = 0, g = 0, b = 0;
                samples.forEach(s => { r += s[0]; g += s[1]; b += s[2]; });
                data[idx] = r / samples.length;
                data[idx + 1] = g / samples.length;
                data[idx + 2] = b / samples.length;
            }
        }
    }
    
    // Add noise to blurry side
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const relativeX = x / canvas.width;
            const isClearSide = side === 'right' ? relativeX > 0.5 : relativeX < 0.5;
            if (!isClearSide) {
                const noise = Math.random() * 20 - 10;
                data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
                data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
                data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return new THREE.CanvasTexture(canvas);
}

function drawBlurryContinent(ctx, cx, cy, width, height) {
    ctx.beginPath();
    // Draw multiple overlapping ellipses for a more organic shape
    ctx.ellipse(cx, cy, width, height, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - width * 0.1, cy, width * 0.8, height, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.ellipse(cx + width * 0.1, cy, width * 0.8, height, -Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fill();
}

function applyBlur(ctx, canvas, radius) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let y = radius; y < canvas.height - radius; y++) {
        for (let x = radius; x < canvas.width - radius; x++) {
            const idx = (y * canvas.width + x) * 4;
            const samples = [];
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const sx = x + dx;
                    const sy = y + dy;
                    const sidx = (sy * canvas.width + sx) * 4;
                    samples.push([data[sidx], data[sidx + 1], data[sidx + 2]]);
                }
            }
            
            let r = 0, g = 0, b = 0;
            samples.forEach(s => { r += s[0]; g += s[1]; b += s[2]; });
            data[idx] = r / samples.length;
            data[idx + 1] = g / samples.length;
            data[idx + 2] = b / samples.length;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function addNoise(ctx, canvas, intensity) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * intensity - intensity / 2;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
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
        'Preliminary observations reveal Earth as a blue world with white polar caps and faint dark surface features. Occultation data indicates a substantial atmosphere. The dark features remain unidentified.'
    );
}

window.addEventListener('DOMContentLoaded', init);
