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
    earthTextureState: 'blurry' // 'blurry', 'partial', 'detailed'
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

let scene, camera, renderer, earth, controls, atmosphereMesh;
let raycaster, mouse;

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
    // This will be called after flyby to determine what was discovered
    const discoveries = [];
    
    // Always detect atmosphere
    gameState.atmosphereData = {
        thickness: '~100 km',
        composition: ATMOSPHERE_COMPOSITION,
        pressure: '~1013 hPa at surface',
        temperature: '-60°C to +30°C range'
    };
    
    // Always detect magnetic field
    gameState.magneticFieldDetected = true;
    
    // Randomly detect features based on what's visible in the flyby photos
    const possibleFeatures = ['ocean', 'continental', 'mountains', 'clouds', 'polarIce'];
    const numFeatures = Math.floor(Math.random() * 2) + 3; // 3-4 features
    
    // Shuffle and pick
    const shuffled = [...possibleFeatures].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numFeatures, shuffled.length); i++) {
        discoveries.push(shuffled[i]);
    }
    
    // 10% chance of detecting cities (very rare, requires right conditions)
    if (Math.random() < 0.1) {
        discoveries.push('cities');
    }
    
    // 30% chance of detecting vegetation
    if (Math.random() < 0.3) {
        discoveries.push('vegetation');
    }
    
    return discoveries;
}

function generateHeadlines(discoveries) {
    const headlines = [];
    const papers = [];
    
    // Atmosphere headline
    headlines.push('BREAKING: EARTH HAS THICK ATMOSPHERE - COMPOSITION UNLIKE MARS');
    papers.push({
        title: 'Atmospheric Composition of Earth: First In-Situ Measurements from Flyby',
        abstract: `Spectroscopic analysis during the flyby reveals Earth's atmosphere is composed primarily of nitrogen (${ATMOSPHERE_COMPOSITION.nitrogen.percentage}%) and oxygen (${ATMOSPHERE_COMPOSITION.oxygen.percentage}%), with trace amounts of argon, carbon dioxide, and water vapor. The total surface pressure is approximately ${gameState.atmosphereData.pressure}, significantly higher than Mars' ${Math.random() < 0.5 ? 'thin' : 'nearly nonexistent'} atmosphere.`
    });
    
    // Magnetic field headline
    headlines.push('STUNNING: EARTH HAS POWERFUL MAGNETIC FIELD - PLANETARY DYNAMO CONFIRMED');
    papers.push({
        title: 'Detection of a Global Magnetic Field on Earth: Evidence for a Liquid Core',
        abstract: 'Magnetometer readings during the flyby reveal a strong dipolar magnetic field with a surface strength of approximately 25-65 microteslas. This field is consistent with a geodynamo generated by convection in a liquid iron-nickel outer core, similar to but stronger than theoretical models for Mars.'
    });
    
    // Feature-specific headlines
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

// Geologic data templates for different terrain types
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

// Simplified geologic classification based on latitude/longitude
function classifyGeology(lat, lng) {
    // Normalize coordinates
    lat = Math.abs(lat);
    lng = lng < 0 ? lng + 360 : lng;
    
    // Ocean detection (simplified - oceans cover ~71% of Earth)
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

function launchFlyby() {
    if (gameState.budget < MISSION_TYPES.flyby.cost) {
        addLogEntry('Insufficient budget for Flyby mission', 'error');
        return;
    }
    
    gameState.budget -= MISSION_TYPES.flyby.cost;
    gameState.missionsLaunched++;
    gameState.flybyComplete = true;
    
    // Simulate the flyby - it takes a moment
    addLogEntry(
        '🛰️ Flyby Mission Launched',
        'info',
        'Spacecraft on trajectory for high-speed Earth pass. Imaging and sensor data will be collected during closest approach...',
        null, null, null
    );
    
    // Simulate the flyby taking some time
    setTimeout(() => {
        // Generate 3 random clustered photos
        gameState.flybyPhotos = generateFlybyPhotos();
        
        // Analyze results
        const discoveries = analyzeFlybyResults();
        const { headlines, papers } = generateHeadlines(discoveries);
        
        // Update Earth texture - half unblurred
        gameState.earthTextureState = 'partial';
        updateEarthTexture();
        
        // Display results
        displayFlybyResults(gameState.flybyPhotos, discoveries, headlines, papers);
        
        // Add comprehensive log entry
        addLogEntry(
            '🛰️ Flyby Mission Complete',
            'success',
            `Flyby successful! Collected data from ${gameState.flybyPhotos.length} imaging passes. Half of Earth's surface now at improved resolution. Atmosphere and magnetic field data received.`,
            headlines[0],
            papers[0].title,
            papers[0].abstract
        );
        
        // Add additional entries for each discovery
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
        
        // Award favor for discoveries
        let favorGained = 5; // Base for flyby
        discoveries.forEach(d => {
            favorGained += DISCOVERY_FEATURES[d].favor;
        });
        gameState.budget += favorGained;
        
        updateUI();
    }, 2000);
}

function generateFlybyPhotos() {
    const photos = [];
    
    // Generate a random cluster point (this will be the center of our 3 photos)
    const centerLat = (Math.random() * 140 - 70); // -70 to 70 degrees
    const centerLng = (Math.random() * 360 - 180); // -180 to 180 degrees
    
    // Generate 3 photos clustered around this point
    for (let i = 0; i < 3; i++) {
        // Small random offset from center (within ~10 degrees)
        const latOffset = (Math.random() * 20 - 10);
        const lngOffset = (Math.random() * 20 - 10);
        
        const lat = Math.max(-80, Math.min(80, centerLat + latOffset));
        const lng = (centerLng + lngOffset + 540) % 360 - 180; // Wrap around
        
        // Determine what's visible in this photo
        const features = detectFeaturesInPhoto(lat, lng);
        
        // Generate a realistic-looking photo description
        const photo = {
            id: `flyby-${i}`,
            lat: lat,
            lng: lng,
            features: features,
            description: generatePhotoDescription(features, lat, lng),
            thumbnail: generatePhotoThumbnail(features)
        };
        
        photos.push(photo);
    }
    
    return photos;
}

function detectFeaturesInPhoto(lat, lng) {
    const features = [];
    
    // Check if this is over ocean
    const geology = classifyGeology(lat, lng);
    if (geology === GEOLOGY_TEMPLATES.ocean) {
        features.push('ocean');
    } else {
        features.push('continental');
    }
    
    // Check for other features based on location
    if (Math.abs(lat) > 60) {
        features.push('polarIce');
    }
    
    // Random chance for other features
    if (Math.random() < 0.4) {
        features.push('clouds');
    }
    
    if (Math.random() < 0.3) {
        features.push('mountains');
    }
    
    // Very low chance for cities or vegetation in first flyby
    if (Math.random() < 0.05) {
        features.push('cities');
    }
    if (Math.random() < 0.15) {
        features.push('vegetation');
    }
    
    return features;
}

function generatePhotoDescription(features, lat, lng) {
    const descriptions = [];
    
    if (features.includes('ocean')) {
        descriptions.push('Vast blue expanse with wave patterns visible');
    }
    if (features.includes('continental')) {
        descriptions.push('Brown and green land masses with complex topography');
    }
    if (features.includes('mountains')) {
        descriptions.push('Towering peaks casting long shadows');
    }
    if (features.includes('clouds')) {
        descriptions.push('White cloud formations swirling across the surface');
    }
    if (features.includes('polarIce')) {
        descriptions.push('Bright white ice cap with fractured patterns');
    }
    if (features.includes('vegetation')) {
        descriptions.push('Green regions suggesting possible biological activity');
    }
    if (features.includes('cities')) {
        descriptions.push('Geometric patterns and artificial structures visible');
    }
    
    const resolution = ['low-resolution', 'moderate-resolution', 'high-resolution'][Math.floor(Math.random() * 3)];
    const lighting = ['well-lit', 'partially shadowed', 'dramatically lit'][Math.floor(Math.random() * 3)];
    
    return `Flyby Photo: ${lat.toFixed(1)}°${lat > 0 ? 'N' : 'S'}, ${lng.toFixed(1)}°${lng > 0 ? 'E' : 'W'} - ${resolution}, ${lighting}. ${descriptions.join(', ')}.`;
}

function generatePhotoThumbnail(features) {
    // Create a simple CSS gradient that represents the photo
    const colors = [];
    
    if (features.includes('ocean')) {
        colors.push('#1a3a8f 40%');
    }
    if (features.includes('continental')) {
        colors.push('#8b4513 30%');
    }
    if (features.includes('vegetation')) {
        colors.push('#228b22 20%');
    }
    if (features.includes('polarIce')) {
        colors.push('#add8e6 50%');
    }
    if (features.includes('clouds')) {
        colors.push('#ffffff 30%');
    }
    if (features.includes('mountains')) {
        colors.push('#5a3a22 10%');
    }
    
    // If no specific features, use a default
    if (colors.length === 0) {
        colors.push('#1a3a8f 50%, #8b4513 50%');
    }
    
    return `linear-gradient(135deg, ${colors.join(', ')})`;
}

function displayFlybyResults(photos, discoveries, headlines, papers) {
    const flybyResultsDiv = document.getElementById('flyby-results');
    const flybyPhotosDiv = document.getElementById('flyby-photos');
    const flybyAtmosphereDiv = document.getElementById('flyby-atmosphere');
    const flybyMagneticDiv = document.getElementById('flyby-magnetic');
    
    // Clear previous results
    flybyPhotosDiv.innerHTML = '<h4>Flyby Images:</h4>';
    flybyAtmosphereDiv.innerHTML = '';
    flybyMagneticDiv.innerHTML = '';
    
    // Display photos
    photos.forEach(photo => {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'flyby-photo';
        photoDiv.style.background = photo.thumbnail;
        photoDiv.innerHTML = `
            <div class="photo-title">Photo #${photo.id.split('-')[1]}</div>
            <div class="photo-location">Lat: ${photo.lat.toFixed(1)}°, Lng: ${photo.lng.toFixed(1)}°</div>
            <div class="photo-desc">${photo.description}</div>
            <div class="photo-features">Features: ${photo.features.join(', ')}</div>
        `;
        flybyPhotosDiv.appendChild(photoDiv);
    });
    
    // Display atmosphere data
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
    
    // Display magnetic field data
    flybyMagneticDiv.innerHTML = `
        <h4>Magnetic Field Detection:</h4>
        <p><strong>Status:</strong> ✓ DETECTED</p>
        <p><strong>Type:</strong> Global dipolar field</p>
        <p><strong>Surface Strength:</strong> 25-65 microteslas</p>
        <p><strong>Implications:</strong> Liquid iron-nickel outer core confirmed</p>
        <p><strong>Comparison:</strong> ~100x stronger than Mars' residual crustal magnetism</p>
    `;
    
    // Show the results section
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
    
    // Orbiter reveals coarse geologic map globally
    gameState.geologyRevealed = true;
    gameState.earthTextureState = 'detailed';
    
    // Update the Earth's texture to show geology
    updateEarthTexture();
    
    addLogEntry(
        '🌍 Orbiter Mission Launched',
        'success',
        'Revealed coarse geologic map of Earth. Major landforms and rock type distributions now visible.',
        'BREAKING: EARTH HAS DIVERSE TERRAIN - NOT JUST BASALT!',
        'Global Geologic Survey from Orbit: First Evidence of Continental Crust',
        'Preliminary analysis reveals Earth has both oceanic and continental crust types, with mountain ranges, sedimentary basins, and volcanic arcs. This diversity is unlike anything observed on the Moon or Mars.'
    );
    
    // Award favor for discovery
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
        'BREAKING: EARTH\'S SURFACE COMPOSITION REVEALED',
        'First Direct Measurement of Terrestrial Surface Materials',
        `The impact probe returned samples of ${geology.rockType}, confirming the presence of ${geology.name} in this region. Chemical analysis is underway.`
    );
    
    // Award favor based on discovery
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
        'SUCCESS: FIRST SOFT LANDING ON EARTH',
        'In-Situ Analysis of Terrestrial Surface Materials',
        `The lander has successfully touched down and conducted preliminary analysis. The surface is composed of ${geology.rockType}, with ${geology.description}. Initial measurements suggest this region is part of Earth's ${geology.name}.`
    );
    
    // Award favor
    gameState.budget += 4; // Extra point for successful landing
    
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
        'HISTORIC: DEEP CORE SAMPLES RETRIEVED FROM EARTH',
        'Radiometric Dating and Geochemical Analysis of Terrestrial Materials',
        `The advanced lander has conducted a comprehensive analysis of Earth's surface and subsurface. ${enhancedDescription} Radiometric dating confirms the age of these formations, providing critical constraints on Earth's geologic history.`
    );
    
    // Award favor
    gameState.budget += 6; // Extra points for advanced mission
    
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
    
    // Create Earth with initial blurry texture
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
    
    // Create initial telescopic texture (very blurry)
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
        opacity: 0.15,
        side: THREE.BackSide
    });
    atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);
    
    // Add star background
    createStars();
}

function createTelescopicTexture() {
    // Create a canvas to draw our very low-res Earth
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a very simplified, blurry Earth
    // Background (space)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 200, 100);
    
    // Earth disk
    ctx.beginPath();
    ctx.arc(100, 50, 45, 0, Math.PI * 2);
    ctx.clip();
    
    // Very blurry base (simulating what we knew about Mars in the 1950s)
    // Ocean base
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 200, 100);
    
    // Very faint continent shapes
    ctx.fillStyle = 'rgba(58, 89, 58, 0.3)';
    
    // Africa (barely visible)
    ctx.beginPath();
    ctx.ellipse(100, 50, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eurasia (barely visible)
    ctx.beginPath();
    ctx.ellipse(130, 40, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Americas (barely visible)
    ctx.beginPath();
    ctx.ellipse(70, 45, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply heavy blur - this simulates early telescope images
    // First, draw to a temporary canvas at higher res for blurring
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200 * 8;
    tempCanvas.height = 100 * 8;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0, 200 * 8, 100 * 8);
    
    // Apply blur by drawing scaled down multiple times
    for (let i = 0; i < 3; i++) {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = tempCanvas.width / 2;
        blurCanvas.height = tempCanvas.height / 2;
        const blurCtx = blurCanvas.getContext('2d');
        blurCtx.imageSmoothingEnabled = true;
        blurCtx.imageSmoothingQuality = 'high';
        blurCtx.drawImage(tempCanvas, 0, 0, blurCanvas.width, blurCanvas.height);
        
        tempCanvas.width = blurCanvas.width;
        tempCanvas.height = blurCanvas.height;
        tempCtx.drawImage(blurCanvas, 0, 0);
    }
    
    // Draw final blurred image to our canvas
    canvas.width = 200;
    canvas.height = 100;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tempCanvas, 0, 0, 200, 100);
    
    // Add noise to simulate old telescope
    const imageData = ctx.getImageData(0, 0, 200, 100);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // Add significant noise
        const noise = Math.random() * 40 - 20;
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

function createPartialTexture() {
    // Create a texture that's half blurry, half slightly less blurry
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Draw base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 400, 200);
    
    // Earth disk
    ctx.beginPath();
    ctx.arc(200, 100, 180, 0, Math.PI * 2);
    ctx.clip();
    
    // Background
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 400, 200);
    
    // Draw continents with slightly better resolution on one hemisphere
    // The right side (0-180 longitude) will be slightly clearer
    
    // Left side (blurry - what we started with)
    ctx.fillStyle = 'rgba(58, 89, 58, 0.25)';
    ctx.beginPath();
    ctx.ellipse(120, 100, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(160, 80, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right side (slightly clearer - flyby results)
    ctx.fillStyle = 'rgba(58, 89, 58, 0.45)';
    ctx.beginPath();
    ctx.ellipse(280, 100, 45, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(240, 120, 35, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some hint of oceans
    ctx.fillStyle = 'rgba(26, 58, 143, 0.3)';
    ctx.beginPath();
    ctx.arc(200, 100, 150, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply blur - less on the right side
    const imageData = ctx.getImageData(0, 0, 400, 200);
    const data = imageData.data;
    
    for (let y = 0; y < 200; y++) {
        for (let x = 0; x < 400; x++) {
            const idx = (y * 400 + x) * 4;
            
            // Calculate blur amount based on position
            // Right side (x > 200) gets less blur
            const blurAmount = x < 200 ? 0.8 : 0.4;
            
            // Simple box blur
            const samples = [];
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const sx = Math.max(0, Math.min(399, x + dx));
                    const sy = Math.max(0, Math.min(199, y + dy));
                    const sidx = (sy * 400 + sx) * 4;
                    samples.push([data[sidx], data[sidx + 1], data[sidx + 2]]);
                }
            }
            
            // Average with blur amount
            let r = 0, g = 0, b = 0;
            samples.forEach(s => {
                r += s[0]; g += s[1]; b += s[2];
            });
            r = (r / samples.length) * blurAmount + data[idx] * (1 - blurAmount);
            g = (g / samples.length) * blurAmount + data[idx + 1] * (1 - blurAmount);
            b = (b / samples.length) * blurAmount + data[idx + 2] * (1 - blurAmount);
            
            data[idx] = Math.min(255, Math.max(0, r));
            data[idx + 1] = Math.min(255, Math.max(0, g));
            data[idx + 2] = Math.min(255, Math.max(0, b));
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
    switch (gameState.earthTextureState) {
        case 'blurry':
            earth.material.map = createTelescopicTexture();
            break;
        case 'partial':
            earth.material.map = createPartialTexture();
            break;
        case 'detailed':
            earth.material.map = createGeologyTexture();
            break;
    }
    earth.material.needsUpdate = true;
    
    // Update atmosphere visibility based on flyby completion
    if (gameState.atmosphereData) {
        atmosphereMesh.material.opacity = 0.25;
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
                
                // For flyby and orbiter, just launch immediately
                if (type === 'flyby' || type === 'orbiter') {
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
        'Mission Briefing',
        'info',
        'As a Martian scientist, you have been placed in charge of the first comprehensive exploration program of Earth. Our current knowledge is limited to blurry optical images and occultation data suggesting the presence of an atmosphere. The Martian President has declared: "We choose to go to the Earth" - and you are the one who will make it happen.',
        'MARTIAN PRESIDENT: "WE CHOOSE TO GO TO THE EARTH"',
        'Initial Reconnaissance Report: The Blue Planet',
        'Preliminary telescopic observations reveal Earth to be a blue world with white polar caps and faint dark surface features. Occultation data during solar transits indicates the presence of a substantial atmosphere, with estimated surface pressure orders of magnitude higher than Mars. The nature of the dark features remains unknown - they could be oceans, forests, or some other surface material. Polar caps appear to be ice, suggesting the presence of water on this planet.'
    );
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', init);
