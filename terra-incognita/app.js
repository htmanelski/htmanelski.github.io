// Terra Incognita - Apollo Earth Exploration Game
// A simulation of exploring Earth as if it were an alien world

// ============================================
// Game State
// ============================================

const gameState = {
    budget: 8,
    missionsLaunched: 0,
    discoveries: [],
    currentMissionType: null,
    isSelectingTarget: false,
    revealedAreas: [], // Areas that have been unblurred
    geologyRevealed: false,
    elevationRevealed: false
};

// ============================================
// Three.js Setup
// ============================================

let scene, camera, renderer, earth, controls;
let raycaster, mouse;

// Mission types with their properties
const MISSION_TYPES = {
    orbiter: {
        name: 'Orbiter',
        cost: 2,
        icon: '🛰️',
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
        cost: 3,
        icon: '🚀',
        description: 'Gentle landing with full analysis',
        action: launchLander
    },
    advancedLander: {
        name: 'Advanced Lander',
        cost: 5,
        icon: '🔬',
        description: 'Deep core sample with age dating',
        action: launchAdvancedLander
    }
};

// Geologic data templates for different terrain types
const GEOLOGY_TEMPLATES = {
    ocean: {
        name: 'Ocean Basin',
        rockType: 'Basalt',
        description: 'Deep ocean floor with pillow basalt formations',
        headline: 'BREAKING: EARTH COVERED IN WATER - VOLCANIC OCEAN FLOOR DISCOVERED',
        paperTitle: 'Submarine Volcanism on Earth: Evidence from Pillow Basalt Structures',
        paperAbstract: 'Samples reveal tholeiitic basalt with characteristic pillow structures, indicating submarine eruption. Chemical analysis shows high iron and magnesium content, similar to lunar maria but with evidence of water interaction.',
        favor: 2,
        color: '#1a3a8f'
    },
    continental: {
        name: 'Continental Crust',
        rockType: 'Granite/Gneiss',
        description: 'Ancient crystalline rocks with complex deformation',
        headline: 'SHOCKING: EARTH HAS GRANITE - UNLIKE THE MOON!',
        paperTitle: 'Felsic Crust on Earth: Implications for Planetary Differentiation',
        paperAbstract: 'Discovery of granitic rocks suggests Earth has undergone extensive fractional crystallization. High silica content (70% SiO2) indicates a differentiated crust unlike the Moon\'s basaltic surface.',
        favor: 3,
        color: '#8b4513'
    },
    mountains: {
        name: 'Mountain Range',
        rockType: 'Metamorphic',
        description: 'Highly deformed rocks with evidence of tectonic forces',
        headline: 'MYSTERY: EARTH\'S MOUNTAINS TELL TALE OF COLLIDING PLATES',
        paperTitle: 'Metamorphic Petrology of Terrestrial Orogenic Belts',
        paperAbstract: 'Schist and gneiss samples show multiple phases of deformation and metamorphism. Presence of coesite indicates pressures exceeding 2 GPa, suggesting deep subduction.',
        favor: 4,
        color: '#5a3a22'
    },
    sedimentary: {
        name: 'Sedimentary Basin',
        rockType: 'Limestone/Sandstone',
        description: 'Layered rocks with fossil fragments',
        headline: 'REVOLUTIONARY: EARTH CONTAINS FOSSILS - EVIDENCE OF PAST LIFE!',
        paperTitle: 'Sedimentary Records of Earth\'s Ancient Biosphere',
        paperAbstract: 'Carbonate rocks contain well-preserved benthic foraminifera and shell fragments. Stratigraphic analysis reveals deposition in shallow marine environments during the Cretaceous period.',
        favor: 5,
        color: '#d2b48c'
    },
    volcanic: {
        name: 'Volcanic Arc',
        rockType: 'Andesite',
        description: 'Intermediate composition lavas with volcanic inclusions',
        headline: 'BREAKING: EARTH HAS ACTIVE VOLCANOES - AND THEY\'RE DIFFERENT FROM THE MOON\'S!',
        paperTitle: 'Andesitic Volcanism on Earth: Evidence for Subduction-Related Magmatism',
        paperAbstract: 'Andesite samples with 55-65% SiO2 suggest magmatic differentiation. Phenocrysts of plagioclase and amphibole indicate water-rich magma genesis, unlike anhydrous lunar basalts.',
        favor: 3,
        color: '#8b0000'
    },
    desert: {
        name: 'Desert',
        rockType: 'Sandstone/Evaporites',
        description: 'Arid environment with wind-deposited sediments',
        headline: 'EARTH\'S DRY ZONES REVEAL CLIMATE VARIABILITY',
        paperTitle: 'Eolian Deposition on Earth: Evidence for Arid Climatic Periods',
        paperAbstract: 'Well-sorted, cross-bedded sandstones indicate wind transport. Presence of evaporite minerals (gypsum, halite) suggests periods of extreme aridity.',
        favor: 2,
        color: '#daa520'
    },
    ice: {
        name: 'Polar Region',
        rockType: 'Ice/Glacial Deposits',
        description: 'Ice sheets with embedded rock fragments',
        headline: 'STUNNING: EARTH HAS ICE CAPS - CLIMATE RECORDS PRESERVED',
        paperTitle: 'Glacial Geology of Earth\'s Polar Regions',
        paperAbstract: 'Ice cores contain trapped atmospheric gases and dust layers. Isotopic analysis of water suggests multiple glacial-interglacial cycles over the past million years.',
        favor: 3,
        color: '#add8e6'
    }
};

// ============================================
// Geology Classification
// ============================================

// Simplified geologic classification based on latitude/longitude
// This is a placeholder - in a full implementation, we'd use real geologic maps
function classifyGeology(lat, lng) {
    // Normalize coordinates
    lat = Math.abs(lat);
    lng = lng < 0 ? lng + 360 : lng;
    
    // Ocean detection (simplified - oceans cover ~71% of Earth)
    // This is a very rough approximation
    const isOcean = (
        // Pacific Ocean
        (lng > 120 && lng < 280 && lat < 60) ||
        // Atlantic Ocean
        (lng > 280 && lng < 340 && lat < 70) ||
        (lng > 20 && lng < 60 && lat < 70) ||
        // Indian Ocean
        (lng > 20 && lng < 120 && lat < 30) ||
        // Arctic Ocean
        (lat > 70) ||
        // Southern Ocean
        (lat > 50 && lng > 120 && lng < 280)
    );
    
    if (isOcean) {
        return GEOLOGY_TEMPLATES.ocean;
    }
    
    // Polar regions
    if (lat > 65) {
        return GEOLOGY_TEMPLATES.ice;
    }
    
    // Mountain ranges (simplified)
    const mountainRanges = [
        // Himalayas
        { latMin: 25, latMax: 40, lngMin: 70, lngMax: 100 },
        // Andes
        { latMin: -55, latMax: 10, lngMin: 280, lngMax: 330 },
        // Rockies
        { latMin: 35, latMax: 60, lngMin: 220, lngMax: 250 },
        // Alps
        { latMin: 40, latMax: 50, lngMin: 5, lngMax: 20 },
        // Atlas
        { latMin: 30, latMax: 37, lngMin: 340, lngMax: 360 }
    ];
    
    for (const range of mountainRanges) {
        if (lat >= range.latMin && lat <= range.latMax && 
            lng >= range.lngMin && lng <= range.lngMax) {
            return GEOLOGY_TEMPLATES.mountains;
        }
    }
    
    // Volcanic arcs
    const volcanicArcs = [
        // Pacific Ring of Fire
        { latMin: -15, latMax: 60, lngMin: 120, lngMax: 280 }
    ];
    
    for (const arc of volcanicArcs) {
        if (lat >= arc.latMin && lat <= arc.latMax && 
            lng >= arc.lngMin && lng <= arc.lngMax) {
            // 10% chance of volcanic, otherwise continental
            if (Math.random() < 0.1) {
                return GEOLOGY_TEMPLATES.volcanic;
            }
        }
    }
    
    // Deserts
    const deserts = [
        // Sahara
        { latMin: 15, latMax: 30, lngMin: 340, lngMax: 20 },
        // Australian
        { latMin: -35, latMax: -15, lngMin: 110, lngMax: 150 }
    ];
    
    for (const desert of deserts) {
        if (lat >= desert.latMin && lat <= desert.latMax && 
            lng >= desert.lngMin && lng <= desert.lngMax) {
            return GEOLOGY_TEMPLATES.desert;
        }
    }
    
    // Sedimentary basins (20% chance)
    if (Math.random() < 0.2) {
        return GEOLOGY_TEMPLATES.sedimentary;
    }
    
    // Default to continental
    return GEOLOGY_TEMPLATES.continental;
}

// ============================================
// Mission Functions
// ============================================

function launchOrbiter() {
    if (gameState.budget < MISSION_TYPES.orbiter.cost) {
        addLogEntry('Insufficient budget for Orbiter mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.orbiter.cost;
    gameState.missionsLaunched++;
    gameState.isSelectingTarget = false;
    
    // Orbiter reveals coarse geologic map globally
    gameState.geologyRevealed = true;
    
    // Update the Earth's texture to show geology
    updateEarthTexture();
    
    addLogEntry(
        '🛰️ Orbiter Mission Launched',
        'success',
        'Revealed coarse geologic map of Earth. Major landforms and rock type distributions now visible.',
        'BREAKING: EARTH HAS DIVERSE TERRAIN - NOT JUST BASALT!',
        'Global Geologic Survey from Orbit: First Evidence of Continental Crust',
        'Preliminary analysis reveals Earth has both oceanic and continental crust types, with mountain ranges, sedimentary basins, and volcanic arcs. This diversity is unlike anything observed on the Moon.'
    );
    
    // Award favor for discovery
    gameState.budget += 3;
    
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
    
    // Reveal a small area around the impact site
    gameState.revealedAreas.push({
        lat: lat,
        lng: lng,
        radius: 5, // degrees
        type: 'impact'
    });
    
    addLogEntry(
        '💥 Impact Probe Mission',
        'success',
        `Impact at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Found ${geology.rockType}. ${geology.description}.`,
        geology.headline,
        geology.paperTitle,
        geology.paperAbstract
    );
    
    // Award favor based on discovery
    gameState.budget += geology.favor;
    
    updateUI();
    updateEarthTexture();
}

function launchLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.lander.cost) {
        addLogEntry('Insufficient budget for Lander mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.lander.cost;
    gameState.missionsLaunched++;
    
    const geology = classifyGeology(lat, lng);
    
    // Reveal a larger area
    gameState.revealedAreas.push({
        lat: lat,
        lng: lng,
        radius: 10, // degrees
        type: 'lander'
    });
    
    addLogEntry(
        '🚀 Lander Mission',
        'success',
        `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Astronauts report: "We're on a surface of ${geology.rockType.toLowerCase()}. The samples show ${geology.description.toLowerCase()}."`,
        geology.headline,
        geology.paperTitle,
        geology.paperAbstract
    );
    
    // Award favor
    gameState.budget += geology.favor + 1; // Extra point for successful landing
    
    updateUI();
    updateEarthTexture();
}

function launchAdvancedLander(lat, lng) {
    if (gameState.budget < MISSION_TYPES.advancedLander.cost) {
        addLogEntry('Insufficient budget for Advanced Lander mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.advancedLander.cost;
    gameState.missionsLaunched++;
    
    const geology = classifyGeology(lat, lng);
    
    // Reveal a large area with detailed information
    gameState.revealedAreas.push({
        lat: lat,
        lng: lng,
        radius: 15, // degrees
        type: 'advanced'
    });
    
    // Enhanced description for advanced lander
    const enhancedDescription = `${geology.description}. Advanced instruments reveal age: ${Math.floor(Math.random() * 4000 + 500)} million years.`;
    
    addLogEntry(
        '🔬 Advanced Lander Mission',
        'success',
        `Landed at ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E. Comprehensive analysis: ${enhancedDescription}`,
        geology.headline,
        geology.paperTitle,
        geology.paperAbstract + ' Radiometric dating confirms the age of these formations, providing critical constraints on Earth\'s geologic history.'
    );
    
    // Award favor
    gameState.budget += geology.favor + 2; // Extra points for advanced mission
    
    updateUI();
    updateEarthTexture();
}

// ============================================
// UI Functions
// ============================================

function updateUI() {
    document.getElementById('budget').textContent = gameState.budget;
    document.getElementById('missions-launched').textContent = gameState.missionsLaunched;
    
    // Update mission button states
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
    
    let content = `<div class="headline">${headline || title}</div>`;
    if (description) {
        content += `<div class="description">${description}</div>`;
    }
    if (paperTitle && paperAbstract) {
        content += `<div class="paper"><strong>${paperTitle}</strong><br><em>Abstract:</em> ${paperAbstract}</div>`;
    }
    content += `<div class="meta">Mission ${gameState.missionsLaunched} • ${timeStr}</div>`;
    
    entry.innerHTML = content;
    logEntries.prepend(entry);
    
    // Store in game state
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
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight * 0.75, 0.1, 1000);
    camera.position.z = 2;
    
    // Renderer setup
    const globeContainer = document.getElementById('globe-container');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    globeContainer.appendChild(renderer.domElement);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 1.5;
    controls.maxDistance = 3;
    controls.enableZoom = true;
    controls.enablePan = false;
    
    // Raycaster for clicking
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Earth
    createEarth();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Handle mouse click for target selection
    globeContainer.addEventListener('click', onGlobeClick);
    
    // Start animation loop
    animate();
}

function createEarth() {
    // Earth geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create telescopic texture (low-res, blurred)
    const texture = createTelescopicTexture();
    
    // Material
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 0
    });
    
    // Create Earth mesh
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);
    
    // Add atmosphere effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Add star background
    createStars();
}

function createTelescopicTexture() {
    // Create a canvas to draw our low-res Earth
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Draw a simplified Earth
    // Background (ocean)
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 400, 200);
    
    // Continents (very simplified, blurred shapes)
    ctx.fillStyle = '#3a5a3a';
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(200, 100, 60, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eurasia
    ctx.beginPath();
    ctx.ellipse(280, 70, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Americas
    ctx.beginPath();
    ctx.ellipse(120, 80, 50, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(320, 130, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Antarctica
    ctx.beginPath();
    ctx.ellipse(200, 170, 70, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply heavy blur
    // First, draw to a temporary canvas at higher res for blurring
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400 * 4;
    tempCanvas.height = 200 * 4;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0, 400 * 4, 200 * 4);
    
    // Apply blur by drawing scaled down
    canvas.width = 400;
    canvas.height = 200;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, 0, 0, 400, 200);
    
    // Apply noise to simulate old telescope
    const imageData = ctx.getImageData(0, 0, 400, 200);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // Add some noise
        const noise = Math.random() * 20 - 10;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Create Three.js texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    
    return texture;
}

function createGeologyTexture() {
    // Create a more detailed geologic map
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // This would be replaced with actual geologic data in a full implementation
    // For now, create a simplified version
    
    // Fill with ocean color
    ctx.fillStyle = '#1a3a8f';
    ctx.fillRect(0, 0, 800, 400);
    
    // Draw continents with different colors based on geology
    // Africa - mix of sedimentary and continental
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(400, 200, 120, 140, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eurasia
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.ellipse(560, 140, 160, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Americas
    ctx.fillStyle = '#cd853f';
    ctx.beginPath();
    ctx.ellipse(240, 160, 100, 160, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.ellipse(640, 260, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Antarctica
    ctx.fillStyle = '#add8e6';
    ctx.beginPath();
    ctx.ellipse(400, 360, 140, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some mountain ranges
    ctx.fillStyle = '#5a3a22';
    // Himalayas
    ctx.beginPath();
    ctx.ellipse(520, 160, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Andes
    ctx.beginPath();
    ctx.ellipse(280, 220, 30, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rockies
    ctx.beginPath();
    ctx.ellipse(240, 120, 30, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply slight blur
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800 * 2;
    tempCanvas.height = 400 * 2;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.drawImage(canvas, 0, 0, 800 * 2, 400 * 2);
    
    canvas.width = 800;
    canvas.height = 400;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tempCanvas, 0, 0, 800, 400);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    
    return texture;
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
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function updateEarthTexture() {
    if (gameState.geologyRevealed) {
        earth.material.map = createGeologyTexture();
        earth.material.needsUpdate = true;
    }
    
    // For now, we'll just switch between the two textures
    // In a full implementation, we'd create a composite texture
    // that shows revealed areas
}

function onWindowResize() {
    const globeContainer = document.getElementById('globe-container');
    camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
}

function onGlobeClick(event) {
    if (!gameState.isSelectingTarget) return;
    
    // Calculate mouse position in normalized device coordinates
    const globeContainer = document.getElementById('globe-container');
    const rect = globeContainer.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast to find intersection with Earth
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(earth);
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Convert 3D point to lat/lng
        const lat = 90 - (THREE.MathUtils.radToDeg(Math.acos(point.y)));
        const lng = THREE.MathUtils.radToDeg(Math.atan2(point.z, point.x));
        
        // Launch the selected mission type
        if (gameState.currentMissionType) {
            MISSION_TYPES[gameState.currentMissionType].action(lat, lng);
            gameState.isSelectingTarget = false;
            gameState.currentMissionType = null;
            
            // Remove target selection UI
            document.body.style.cursor = '';
        }
    }
}

// ============================================
// Mission Selection
// ============================================

function setupMissionButtons() {
    for (const [type, mission] of Object.entries(MISSION_TYPES)) {
        const btn = document.getElementById(`${type}-btn`);
        if (btn) {
            btn.addEventListener('click', () => {
                if (gameState.budget < mission.cost) {
                    addLogEntry(`Insufficient budget for ${mission.name}`, 'error');
                    return;
                }
                
                // For orbiter, just launch immediately
                if (type === 'orbiter') {
                    mission.action();
                } else {
                    // For targeted missions, enable target selection
                    gameState.isSelectingTarget = true;
                    gameState.currentMissionType = type;
                    document.body.style.cursor = 'crosshair';
                    addLogEntry(`Select target location for ${mission.name} mission`, 'info');
                }
            });
        }
    }
}

// ============================================
// Animation Loop
// ============================================

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    earth.rotation.y += 0.001; // Slow auto-rotation
    
    renderer.render(scene, camera);
}

// ============================================
// Initialize Game
// ============================================

function init() {
    // Initialize Three.js
    initThreeJS();
    
    // Set up mission buttons
    setupMissionButtons();
    
    // Update UI
    updateUI();
    
    // Add initial log entry
    addLogEntry(
        'Welcome to Terra Incognita',
        'info',
        'You are in control of humanity\'s first missions to explore Earth as if it were an alien world. Your budget is limited, so choose your missions wisely. Each discovery will earn you more funding and reveal more about this mysterious planet.',
        'EARTH: THE FINAL FRONTIER',
        'Initial Observations of the Blue Planet',
        'Preliminary telescopic observations reveal Earth to be a blue world with white polar caps and dark surface features. The nature of these features remains unknown. Initial spectral analysis suggests the presence of water vapor in the atmosphere.'
    );
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', init);
