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
    flybyUnblurSide: null, // 'left' or 'right' - which hemisphere gets unblurred
    earthTextureState: 'blurry', // 'blurry', 'partial', 'detailed'
    texturesLoaded: false
};

// ============================================
// Configuration
// ============================================

// NASA Blue Marble image - equirectangular projection, public domain
// Using a 2k version for reasonable loading
const EARTH_TEXTURE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Whole_world_-_land_and_oceans_12000.jpg/2048px-Whole_world_-_land_and_oceans_12000.jpg';

// Cloud texture - public domain
const CLOUD_TEXTURE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Earth_cloud_map.jpg/2048px-Earth_cloud_map.jpg';

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
            'SHOCKING DISCOVERY: EARTH HAS OCEANS - WATER WORLD CONFIRMED',
            'EARTH\'S BLUE MYSTERY SOLVED: LIQUID WATER DOMINATES SURFACE',
            'UNBELIEVABLE: EARTH HAS MORE WATER THAN LAND',
            'HISTORIC: FIRST CONFIRMATION OF EXTRATERRESTRIAL OCEANS'
        ],
        paperTitles: [
            'Spectroscopic Confirmation of Liquid Water on Earth\'s Surface',
            'Global Distribution of Terrestrial Hydrospheric Features',
            'Optical Properties of Earth\'s Ocean Basins: A Comparative Study',
            'The Blue Planet: Quantitative Analysis of Earth\'s Water Coverage',
            'Hydrospheric Dynamics on Earth: Preliminary Observations'
        ],
        paperAbstracts: [
            'High-resolution imaging reveals extensive blue regions with spectral signatures consistent with liquid water. These features cover approximately 71% of Earth\'s surface, representing the first confirmed extraterrestrial oceans.',
            'Analysis of flyby imagery shows large, interconnected water bodies with varying albedo patterns. The presence of wave patterns and coastal interfaces suggests dynamic hydrologic processes.',
            'Spectroscopic measurements confirm the liquid state of Earth\'s blue regions. The absorption features at 1.1, 1.4, and 1.9 micrometers are characteristic of H2O, distinguishing these from other potential blue surface materials.',
            'Preliminary mapping indicates Earth\'s water is concentrated in several major basins, separated by land masses. The distribution suggests a complex history of tectonic and climatic processes.',
            'The discovery of liquid water on Earth\'s surface has profound implications for our understanding of planetary habitability. These oceans may represent a unique feature in our solar system.'
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
            'BREAKTHROUGH: CONTINENTS DISCOVERED ON EARTH',
            'AMAZING: EARTH\'S LAND MASSES VISIBLE FROM SPACE',
            'EARTH\'S SECRET: VAST LANDMASS HIDDEN BENEATH CLOUDS',
            'CONFIRMED: EARTH IS NOT A WATER WORLD - LAND EXISTS'
        ],
        paperTitles: [
            'Geomorphic Analysis of Earth\'s Continental Landmasses',
            'Terrestrial Lithosphere: Composition and Structure',
            'Spatial Distribution of Earth\'s Continental Features',
            'The Silicate Surface: Spectral Analysis of Earth\'s Land Areas',
            'Continental Crust on Earth: Evidence for Planetary Differentiation'
        ],
        paperAbstracts: [
            'Imaging data reveals distinct continental landmasses with varied albedo and texture. These features appear to be composed of silicate minerals, similar to Martian highlands but with different spectral properties.',
            'The continental regions of Earth show complex topography with mountain ranges, plains, and other geomorphic features. Their distribution suggests plate tectonic activity.',
            'Spectral analysis of Earth\'s land areas reveals a composition rich in feldspar, quartz, and other felsic minerals. This differs significantly from the basaltic composition of Martian surfaces.',
            'The land masses on Earth are concentrated in several major continental blocks, separated by ocean basins. This distribution is unlike any other planetary body in our solar system.',
            'Preliminary analysis suggests Earth\'s continental crust is thicker and less dense than oceanic crust, indicating significant planetary differentiation.'
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
            'INCREDIBLE: TOWERING PEAKS DISCOVERED ON EARTH',
            'BREAKING: EARTH HAS MOUNTAIN RANGES - TECTONIC ACTIVITY SUSPECTED',
            'SHOCKING: EARTH\'S MOUNTAINS DWARF OLYMPUS MONS',
            'REVELATION: EARTH\'S SURFACE IS NOT FLAT - MAJOR ELEVATION VARIATIONS'
        ],
        paperTitles: [
            'Topographic Analysis of Earth\'s Mountain Systems',
            'Orogenic Processes on Earth: Evidence from Remote Sensing',
            'The Height of Earth\'s Mountains: A Comparative Planetology Study',
            'Tectonic Implications of Earth\'s Mountain Ranges',
            'Vertical Relief on Earth: Preliminary Photogrammetric Analysis'
        ],
        paperAbstracts: [
            'Stereo imaging reveals mountain ranges on Earth with elevations exceeding 8 kilometers above mean surface level. These features show evidence of active tectonic processes.',
            'The linear arrangement and scale of Earth\'s mountain systems suggest they are formed by plate tectonics. This represents a fundamental difference from Martian mountain formation.',
            'Photogrammetric analysis of shadow lengths indicates Earth\'s highest peaks reach elevations comparable to or exceeding those of Martian volcanoes. The steep slopes suggest recent or ongoing uplift.',
            'The distribution of mountain ranges on Earth correlates with zones of seismic activity, providing strong evidence for active plate tectonics.',
            'Preliminary measurements suggest Earth\'s mountain systems are younger and more dynamically evolving than those on Mars, indicating a more geologically active planet.'
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
            'BREAKING: DYNAMIC WEATHER SYSTEMS OBSERVED ON EARTH',
            'AMAZING: EARTH\'S ATMOSPHERE IS ACTIVE AND TURBULENT',
            'REVOLUTIONARY: EARTH HAS WEATHER - CLOUDS CHANGE IN REAL TIME',
            'INCREDIBLE: WHITE STREAKS REVEAL EARTH\'S ATMOSPHERIC DYNAMISM'
        ],
        paperTitles: [
            'Atmospheric Dynamics on Earth: Observations of Cloud Systems',
            'Tropospheric Circulation Patterns on Earth',
            'Cloud Morphology and Distribution on Earth',
            'The Active Atmosphere: Time-Resolved Observations of Earth\'s Weather',
            'Radiative Transfer in Earth\'s Cloud Systems'
        ],
        paperAbstracts: [
            'Time-lapse imaging reveals dynamic cloud systems moving across Earth\'s surface at speeds of 10-100 km/h. These features show complex patterns of formation, evolution, and dissipation.',
            'The global distribution of clouds on Earth shows distinct patterns, with concentration along the equator and in mid-latitudes. This suggests a complex atmospheric circulation system.',
            'Cloud albedo measurements indicate these features are composed of water ice and/or liquid water droplets. Their presence confirms an active hydrologic cycle.',
            'The rapid movement and evolution of cloud systems on Earth indicates a turbulent atmosphere with significant convective activity.',
            'Preliminary analysis suggests Earth\'s clouds play a major role in the planet\'s energy balance and climate system.'
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
            'BREAKING: MASSIVE ICE DEPOSITS DISCOVERED ON EARTH',
            'STUNNING: EARTH\'S POLAR REGIONS COVERED IN BRIGHT WHITE',
            'REVOLUTIONARY: EARTH\'S ICE CAPS MAY HOLD CLIMATE RECORDS',
            'INCREDIBLE: POLAR ICE SUGGESTS EARTH\'S CLIMATE VARIABILITY'
        ],
        paperTitles: [
            'Cryospheric Features of Earth: Polar Ice Cap Analysis',
            'The White Poles: Composition and Extent of Earth\'s Ice Caps',
            'Polar Albedo on Earth: Implications for Climate',
            'Cryospheric Dynamics on Earth: Preliminary Observations',
            'Ice on Earth: Spectral Analysis and Distribution'
        ],
        paperAbstracts: [
            'High-albedo regions at both poles of Earth are confirmed to be ice caps, covering approximately 10% of the planet\'s surface. Spectral analysis suggests a composition of water ice.',
            'The polar ice caps on Earth show seasonal variations in extent, with winter expansion and summer retreat. This indicates an active climate system.',
            'The high reflectivity of Earth\'s polar regions suggests these ice caps play a significant role in the planet\'s energy balance.',
            'Preliminary measurements indicate Earth\'s ice caps have a thickness of several kilometers, representing a major reservoir of water.',
            'The presence of ice at both poles, despite Earth\'s relatively warm climate, suggests complex atmospheric and oceanic circulation patterns.'
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
            'BREAKING: EARTH HAS CITIES - ADVANCED CIVILIZATION CONFIRMED',
            'HISTORIC: GEOMETRIC PATTERNS DETECTED ON EARTH\'S SURFACE',
            'SHOCKING: EARTH INHABITED BY INTELLIGENT BEINGS',
            'REVOLUTIONARY: ARTIFICIAL LIGHTS OBSERVED ON EARTH AT NIGHT'
        ],
        paperTitles: [
            'Detection of Technosignatures on Earth: Evidence for Intelligent Life',
            'Urban Patterns on Earth: Analysis of Artificial Surface Modifications',
            'Nocturnal Illumination on Earth: Evidence of Advanced Civilization',
            'Geometric Surface Features on Earth: Possible Anthropogenic Origin',
            'The Search for Intelligence: Confirmation on Earth'
        ],
        paperAbstracts: [
            'High-resolution imaging reveals geometric patterns and structures on Earth\'s surface that are inconsistent with natural processes. These features show clear evidence of intelligent design.',
            'Night-time observations of Earth reveal extensive artificial illumination, concentrated in specific regions. This provides definitive evidence of an advanced technological civilization.',
            'The distribution and morphology of artificial structures on Earth suggests a global civilization with significant technological capabilities.',
            'Spectral analysis of surface materials in urban areas reveals compositions inconsistent with natural geological processes, including metals, concrete, and other manufactured materials.',
            'The discovery of technosignatures on Earth represents the first confirmed detection of intelligent life beyond Mars. This has profound implications for our understanding of life in the universe.'
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
            'BREAKING: ORGANIC COMPOUNDS DETECTED ON EARTH\'S SURFACE',
            'REVOLUTIONARY: EARTH MAY HAVE LIFE - GREEN SIGNATURES OBSERVED',
            'INCREDIBLE: SEASONAL CHANGES IN EARTH\'S GREEN COVER',
            'SHOCKING: EARTH\'S SURFACE SHOWS SIGNS OF BIOLOGICAL ACTIVITY'
        ],
        paperTitles: [
            'Spectral Signatures of Photosynthetic Activity on Earth',
            'The Green Planet: Evidence for Terrestrial Biosphere',
            'Seasonal Variations in Earth\'s Surface Albedo: Biological Implications',
            'Vegetation Index Analysis of Earth\'s Land Surface',
            'Remote Detection of Life on Earth: Spectroscopic Evidence'
        ],
        paperAbstracts: [
            'Multispectral imaging reveals regions on Earth with strong absorption features in the red and blue wavelengths, characteristic of photosynthetic pigments. This provides strong evidence for surface vegetation.',
            'The green coloration of certain land areas on Earth shows seasonal variations, with growth in warm periods and dormancy in cold periods. This cyclical pattern is consistent with biological activity.',
            'Analysis of Earth\'s surface reflectance shows a strong correlation between green regions and areas with favorable temperature and precipitation conditions.',
            'The Normalized Difference Vegetation Index (NDVI) calculated from multispectral data indicates widespread photosynthetic activity across Earth\'s land surfaces.',
            'The presence of green, photosynthetically active regions on Earth suggests a biosphere of unprecedented scale and complexity.'
        ],
        favor: 6,
        color: '#228b22'
    }
};

// Atmosphere data
const ATMOSPHERE_COMPOSITION = {
    nitrogen: { percentage: 78, detection: 'Spectroscopic absorption at 3.3 micrometers' },
    oxygen: { percentage: 21, detection: 'Strong absorption feature at 0.76 micrometers (A-band)' },
    argon: { percentage: 0.93, detection: 'Minor absorption lines in infrared' },
    carbonDioxide: { percentage: 0.04, detection: 'Strong absorption at 4.26 and 15 micrometers' },
    waterVapor: { percentage: 'variable', detection: 'Absorption features throughout infrared spectrum' },
    traceGases: ['neon', 'helium', 'methane', 'krypton', 'hydrogen']
};

// ============================================
// Mission Types
// ============================================

let scene, camera, renderer, earth, controls, atmosphereMesh, cloudsMesh;
let raycaster, mouse;
let earthTexture, blurryEarthTexture, partialEarthTexture, cloudTexture;
let textureLoader;

// Mission types with their properties
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
    
    // Randomly detect which hemisphere was imaged
    gameState.flybyUnblurSide = Math.random() < 0.5 ? 'left' : 'right';
    
    const possibleFeatures = ['ocean', 'continental', 'mountains', 'clouds', 'polarIce'];
    const numFeatures = Math.floor(Math.random() * 2) + 3;
    
    const shuffled = [...possibleFeatures].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numFeatures, shuffled.length); i++) {
        discoveries.push(shuffled[i]);
    }
    
    if (Math.random() < 0.1) {
        discoveries.push('cities');
    }
    
    if (Math.random() < 0.3) {
        discoveries.push('vegetation');
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
        abstract: 'Magnetometer readings during the flyby reveal a strong dipolar magnetic field with a surface strength of approximately 25-65 microteslas. This field is consistent with a geodynamo generated by convection in a liquid iron-nickel outer core, similar to but stronger than theoretical models for Mars.'
    });
    
    for (const feature of discoveries) {
        const featureData = DISCOVERY_FEATURES[feature];
        const randomHeadline = featureData.headlines[Math.floor(Math.random() * featureData.headlines.length)];
        const randomPaper = {
            title: featureData.paperTitles[Math.floor(Math.random() * featureData.paperTitles.length)],
            abstract: featureData.paperAbstracts[Math.floor(Math.random() * featureData.paperAbstracts.length)]
        };
        headlines.push(randomHeadline);
        papers.push(randomPaper);
    }
    
    return { headlines, papers };
}

// ============================================
// Geologic Data Templates
// ============================================

const GEOLOGY_TEMPLATES = {
    ocean: {
        name: 'Ocean Basin',
        rockType: 'Basalt',
        description: 'Deep ocean floor with pillow basalt formations',
        color: '#1a3a8f'
    },
    continental: {
        name: 'Continental Crust',
        rockType: 'Granite/Gneiss',
        description: 'Ancient crystalline rocks with complex deformation',
        color: '#8b4513'
    },
    mountains: {
        name: 'Mountain Range',
        rockType: 'Metamorphic',
        description: 'Highly deformed rocks with evidence of tectonic forces',
        color: '#5a3a22'
    },
    sedimentary: {
        name: 'Sedimentary Basin',
        rockType: 'Limestone/Sandstone',
        description: 'Layered rocks with fossil fragments',
        color: '#d2b48c'
    },
    volcanic: {
        name: 'Volcanic Arc',
        rockType: 'Andesite',
        description: 'Intermediate composition lavas with volcanic inclusions',
        color: '#8b0000'
    },
    desert: {
        name: 'Desert',
        rockType: 'Sandstone/Evaporites',
        description: 'Arid environment with wind-deposited sediments',
        color: '#daa520'
    },
    ice: {
        name: 'Polar Region',
        rockType: 'Ice/Glacial Deposits',
        description: 'Ice sheets with embedded rock fragments',
        color: '#add8e6'
    }
};

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
        return GEOLOGY_TEMPLATES.ocean;
    }
    
    if (lat > 65) {
        return GEOLOGY_TEMPLATES.ice;
    }
    
    const mountainRanges = [
        { latMin: 25, latMax: 40, lngMin: 70, lngMax: 100 },
        { latMin: -55, latMax: 10, lngMin: 280, lngMax: 330 },
        { latMin: 35, latMax: 60, lngMin: 220, lngMax: 250 },
        { latMin: 40, latMax: 50, lngMin: 5, lngMax: 20 },
        { latMin: 30, latMax: 37, lngMin: 340, lngMax: 360 }
    ];
    
    for (const range of mountainRanges) {
        if (lat >= range.latMin && lat <= range.latMax && 
            lng >= range.lngMin && lng <= range.lngMax) {
            return GEOLOGY_TEMPLATES.mountains;
        }
    }
    
    const volcanicArcs = [
        { latMin: -15, latMax: 60, lngMin: 120, lngMax: 280 }
    ];
    
    for (const arc of volcanicArcs) {
        if (lat >= arc.latMin && lat <= arc.latMax && 
            lng >= arc.lngMin && lng <= arc.lngMax) {
            if (Math.random() < 0.1) {
                return GEOLOGY_TEMPLATES.volcanic;
            }
        }
    }
    
    const deserts = [
        { latMin: 15, latMax: 30, lngMin: 340, lngMax: 20 },
        { latMin: -35, latMax: -15, lngMin: 110, lngMax: 150 }
    ];
    
    for (const desert of deserts) {
        if (lat >= desert.latMin && lat <= desert.latMax && 
            lng >= desert.lngMin && lng <= desert.lngMax) {
            return GEOLOGY_TEMPLATES.desert;
        }
    }
    
    if (Math.random() < 0.2) {
        return GEOLOGY_TEMPLATES.sedimentary;
    }
    
    return GEOLOGY_TEMPLATES.continental;
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
    
    addLogEntry(
        '🛰️ Flyby Mission Launched',
        'info',
        'Spacecraft on trajectory for high-speed Earth pass. Imaging and sensor data will be collected during closest approach...',
        null, null, null
    );
    
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
            addLogEntry(
                headlines[i],
                'discovery',
                null,
                null,
                papers[i].title,
                papers[i].abstract
            );
        }
        
        let favorGained = 5;
        discoveries.forEach(d => {
            favorGained += DISCOVERY_FEATURES[d].favor;
        });
        gameState.budget += favorGained;
        
        updateUI();
    }, 2000);
}

function generateFlybyPhotos() {
    const photos = [];
    const centerLat = (Math.random() * 140 - 70);
    const centerLng = (Math.random() * 360 - 180);
    const hemisphere = centerLng < 0 ? 'west' : 'east';
    
    for (let i = 0; i < 3; i++) {
        const latOffset = (Math.random() * 20 - 10);
        const lngOffset = (Math.random() * 20 - 10);
        
        const lat = Math.max(-80, Math.min(80, centerLat + latOffset));
        const lng = (centerLng + lngOffset + 540) % 360 - 180;
        
        const features = detectFeaturesInPhoto(lat, lng);
        const thumbColor = getLocationColor(lat, lng, hemisphere);
        
        const photo = {
            id: `flyby-${i}`,
            lat: lat,
            lng: lng,
            features: features,
            description: generatePhotoDescription(features, lat, lng),
            thumbnail: thumbColor
        };
        
        photos.push(photo);
    }
    
    return photos;
}

function detectFeaturesInPhoto(lat, lng) {
    const features = [];
    const geology = classifyGeology(lat, lng);
    
    if (geology === GEOLOGY_TEMPLATES.ocean) {
        features.push('ocean');
    } else {
        features.push('continental');
    }
    
    if (Math.abs(lat) > 60) {
        features.push('polarIce');
    }
    
    if (Math.random() < 0.4) {
        features.push('clouds');
    }
    
    if (Math.random() < 0.3) {
        features.push('mountains');
    }
    
    if (Math.random() < 0.05) {
        features.push('cities');
    }
    if (Math.random() < 0.15) {
        features.push('vegetation');
    }
    
    return features;
}

function getLocationColor(lat, lng, hemisphere) {
    const geology = classifyGeology(lat, lng);
    
    if (geology === GEOLOGY_TEMPLATES.ocean) {
        const blueVariation = Math.random() * 30 - 15;
        return `rgb(${Math.max(0, 20 + blueVariation)}, ${Math.max(0, 60 + blueVariation)}, ${Math.min(255, 140 + blueVariation)})`;
    }
    
    if (geology === GEOLOGY_TEMPLATES.ice) {
        return '#e6f7ff';
    }
    
    if (geology === GEOLOGY_TEMPLATES.mountains) {
        return '#654321';
    }
    
    if (geology === GEOLOGY_TEMPLATES.desert) {
        return '#d2b48c';
    }
    
    const greenIntensity = Math.random() * 100 + 50;
    const brownIntensity = Math.random() * 100 + 50;
    return `rgb(${Math.min(255, brownIntensity)}, ${Math.min(255, greenIntensity)}, ${Math.random() * 50})`;
}

function generatePhotoDescription(features, lat, lng) {
    const descriptions = [];
    
    if (features.includes('ocean')) {
        descriptions.push('Vast blue expanse');
    }
    if (features.includes('continental')) {
        descriptions.push('Brown and green land masses');
    }
    if (features.includes('mountains')) {
        descriptions.push('Towering peaks');
    }
    if (features.includes('clouds')) {
        descriptions.push('White cloud formations');
    }
    if (features.includes('polarIce')) {
        descriptions.push('Bright white ice cap');
    }
    if (features.includes('vegetation')) {
        descriptions.push('Green vegetation');
    }
    if (features.includes('cities')) {
        descriptions.push('Geometric patterns');
    }
    
    const resolution = ['low-resolution', 'moderate-resolution', 'high-resolution'][Math.floor(Math.random() * 3)];
    const lighting = ['well-lit', 'partially shadowed', 'dramatically lit'][Math.floor(Math.random() * 3)];
    
    return `Flyby Photo: ${lat.toFixed(1)}°${lat > 0 ? 'N' : 'S'}, ${lng.toFixed(1)}°${lng > 0 ? 'E' : 'W'} - ${resolution}, ${lighting}. ${descriptions.join(', ')}.`;
}

function displayFlybyResults(photos, discoveries, headlines, papers) {
    const flybyResultsDiv = document.getElementById('flyby-results');
    const flybyPhotosDiv = document.getElementById('flyby-photos');
    const flybyAtmosphereDiv = document.getElementById('flyby-atmosphere');
    const flybyMagneticDiv = document.getElementById('flyby-magnetic');
    
    flybyPhotosDiv.innerHTML = '<h4>Flyby Images:</h4>';
    flybyAtmosphereDiv.innerHTML = '';
    flybyMagneticDiv.innerHTML = '';
    
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
            <li>Water Vapor (H₂O): ${ATMOSPHERE_COMPOSITION.waterVapor.percentage}</li>
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
    updateEarthTexture();
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
    
    // Create Earth with textures
    createEarth();
    
    window.addEventListener('resize', onWindowResize);
    globeContainer.addEventListener('click', onGlobeClick);
    
    animate();
}

function createEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Create a placeholder material with a blue-ish color
    // This will be replaced once textures load
    const placeholderMaterial = new THREE.MeshPhongMaterial({
        color: 0x224488,
        shininess: 0
    });
    
    // Create Earth mesh
    earth = new THREE.Mesh(geometry, placeholderMaterial);
    scene.add(earth);
    
    // Store for later
    earth.userData = {
        geometry: geometry,
        placeholderMaterial: placeholderMaterial
    };
    
    // Load textures
    loadTextures();
    
    // Add atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);
    
    // Add clouds (initially hidden)
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

function loadTextures() {
    // First, create a canvas-based blurry Earth texture as fallback
    // This will be shown while the real texture loads
    blurryEarthTexture = createBlurryPlaceholderTexture();
    earth.material.map = blurryEarthTexture;
    earth.material.needsUpdate = true;
    
    // Load Blue Marble Earth texture
    textureLoader.load(
        EARTH_TEXTURE_URL,
        (texture) => {
            earthTexture = texture;
            earthTexture.anisotropy = 16;
            earthTexture.colorSpace = THREE.SRGBColorSpace;
            
            // Create blurry version from the real texture
            blurryEarthTexture = createBlurryFromTexture(earthTexture);
            
            // Set initial state
            gameState.earthTextureState = 'blurry';
            earth.material.map = blurryEarthTexture;
            earth.material.needsUpdate = true;
            
            gameState.texturesLoaded = true;
            console.log('Earth textures loaded');
        },
        undefined,
        (error) => {
            console.error('Error loading Earth texture:', error);
            // Use the placeholder
            blurryEarthTexture = createBlurryPlaceholderTexture();
            earth.material.map = blurryEarthTexture;
            earth.material.needsUpdate = true;
            gameState.texturesLoaded = true;
        }
    );
    
    // Load cloud texture
    textureLoader.load(
        CLOUD_TEXTURE_URL,
        (texture) => {
            cloudTexture = texture;
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

function createBlurryPlaceholderTexture() {
    // Create a canvas with a recognizable Earth-like pattern
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fill with a space background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Earth disk (equirectangular projection)
    // We'll create a simplified Earth with continents
    
    // Create a gradient for the base
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a2e5a');
    gradient.addColorStop(0.5, '#1a4e8a');
    gradient.addColorStop(1, '#0a2e5a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simplified continents (very blurry)
    ctx.fillStyle = 'rgba(80, 120, 60, 0.3)';
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.2, canvas.height * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eurasia
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.65, canvas.height * 0.4, canvas.width * 0.25, canvas.height * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Americas
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.35, canvas.height * 0.45, canvas.width * 0.18, canvas.height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply blur
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Heavy blur
    for (let y = 2; y < canvas.height - 2; y++) {
        for (let x = 2; x < canvas.width - 2; x++) {
            const idx = (y * canvas.width + x) * 4;
            const samples = [];
            
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const sx = x + dx;
                    const sy = y + dy;
                    const sidx = (sy * canvas.width + sx) * 4;
                    samples.push([data[sidx], data[sidx + 1], data[sidx + 2]]);
                }
            }
            
            let r = 0, g = 0, b = 0;
            samples.forEach(s => {
                r += s[0]; g += s[1]; b += s[2];
            });
            r /= samples.length;
            g /= samples.length;
            b /= samples.length;
            
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
        }
    }
    
    // Add noise
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 20 - 10;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return new THREE.CanvasTexture(canvas);
}

function createBlurryFromTexture(sourceTexture) {
    if (!sourceTexture || !sourceTexture.image) {
        return createBlurryPlaceholderTexture();
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw the source image scaled down (creates blur)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceTexture.image, 0, 0, canvas.width, canvas.height);
    
    // Apply additional blur
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;
            const samples = [];
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const sx = Math.max(0, Math.min(canvas.width - 1, x + dx));
                    const sy = Math.max(0, Math.min(canvas.height - 1, y + dy));
                    const sidx = (sy * canvas.width + sx) * 4;
                    samples.push([data[sidx], data[sidx + 1], data[sidx + 2]]);
                }
            }
            
            let r = 0, g = 0, b = 0;
            samples.forEach(s => {
                r += s[0]; g += s[1]; b += s[2];
            });
            r /= samples.length;
            g /= samples.length;
            b /= samples.length;
            
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
        }
    }
    
    // Add subtle noise to simulate telescope limitations
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 10 - 5;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createPartialTextureWithSide(sourceTexture, side) {
    if (!sourceTexture || !sourceTexture.image) {
        return createBlurryPlaceholderTexture();
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Draw the full image
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sourceTexture.image, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply differential blur based on side
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            
            const relativeX = x / canvas.width;
            const isClearSide = side === 'right' ? relativeX > 0.5 : relativeX < 0.5;
            
            if (!isClearSide) {
                // Heavy blur for the blurry side
                const blurRadius = 6;
                const samples = [];
                const halfRadius = Math.min(blurRadius, 10);
                for (let dy = -halfRadius; dy <= halfRadius; dy++) {
                    for (let dx = -halfRadius; dx <= halfRadius; dx++) {
                        const sx = Math.max(0, Math.min(canvas.width - 1, x + dx));
                        const sy = Math.max(0, Math.min(canvas.height - 1, y + dy));
                        const sidx = (sy * canvas.width + sx) * 4;
                        samples.push([data[sidx], data[sidx + 1], data[sidx + 2]]);
                    }
                }
                
                let r = 0, g = 0, b = 0;
                samples.forEach(s => {
                    r += s[0]; g += s[1]; b += s[2];
                });
                r /= samples.length;
                g /= samples.length;
                b /= samples.length;
                
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
            }
            // Clear side remains at original resolution
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
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
    if (!gameState.texturesLoaded && !earthTexture) {
        // Textures still loading, skip update
        return;
    }
    
    switch (gameState.earthTextureState) {
        case 'blurry':
            if (blurryEarthTexture) {
                earth.material.map = blurryEarthTexture;
            }
            break;
        case 'partial':
            if (earthTexture) {
                const partialTex = createPartialTextureWithSide(earthTexture, gameState.flybyUnblurSide);
                earth.material.map = partialTex;
            }
            break;
        case 'detailed':
            if (earthTexture) {
                earth.material.map = earthTexture;
            }
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

// ============================================
// Animation Loop
// ============================================

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    earth.rotation.y += 0.001;
    
    // Slowly rotate clouds if visible
    if (cloudsMesh.visible && cloudTexture) {
        cloudsMesh.rotation.y += 0.0005;
    }
    
    renderer.render(scene, camera);
}

// ============================================
// Initialize Game
// ============================================

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
