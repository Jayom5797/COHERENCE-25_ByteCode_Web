// Initialize 3D Map
let mumbaiMap;
let trafficMap;
let is3DMode = false;
let trafficLayer;
let transitLayer;
let directionsService;
let directionsRenderer;
let mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
let chargingPointsLayer = null;
let chargingPointsMarkers = [];
let keyLocations = {
    airport: { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji International Airport' },
    downtown: { lat: 19.0760, lng: 72.8777, name: 'Downtown Mumbai' },
    port: { lat: 18.9322, lng: 72.8347, name: 'Mumbai Port' }
};

// Make initMap function globally available
window.initializeMaps = function() {
    try {
        console.log('Starting map initialization...');
        
        // Vasai West coordinates
        const vasaiWest = { lat: 19.3917, lng: 72.8397 };
        
        // Create Traffic Map with explicit dimensions
        const mapOptions = {
            center: vasaiWest,
            zoom: 14,
            mapTypeId: 'roadmap',
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            backgroundColor: '#ffffff'
        };

        // Initialize 3D Map for city overview with enhanced options
        const mumbai3DMapOptions = {
            center: vasaiWest,
            zoom: 14,
            mapTypeId: 'satellite',
            tilt: 0,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
            },
            streetViewControl: true,
            fullscreenControl: false,
            backgroundColor: '#ffffff'
        };

        // Ensure the map containers exist
        const mapContainer = document.getElementById('map');
        const mumbai3DMapContainer = document.getElementById('mumbai3DMap');
        
        if (!mapContainer) {
            console.error('Traffic map container not found');
            return;
        }
        if (!mumbai3DMapContainer) {
            console.error('3D map container not found');
            return;
        }

        console.log('Creating map instances...');
        
        // Create both map instances
        trafficMap = new google.maps.Map(mapContainer, mapOptions);
        mumbaiMap = new google.maps.Map(mumbai3DMapContainer, mumbai3DMapOptions);

        console.log('Maps created successfully');

        // Initialize traffic and transit layers
        trafficLayer = new google.maps.TrafficLayer();
        transitLayer = new google.maps.TransitLayer();
        
        // Initialize directions service and renderer
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: trafficMap,
            suppressMarkers: true
        });

        // Set up map controls
        setupMapControls();
        
        // Initialize traffic data
        initializeTrafficData();

        // Add 3D view controls
        setup3DControls();

        // Initialize city overview data
        updateCityOverview();

        console.log('Maps initialized successfully');
    } catch (error) {
        console.error('Error initializing maps:', error);
    }
};

// Add new function for 3D controls
function setup3DControls() {
    try {
        console.log('Setting up 3D map controls...');
        
        if (!mumbaiMap) {
            console.error('3D map not initialized');
            return;
        }

        // Get the existing toggle3D button from the DOM
        const toggle3DButton = document.getElementById('toggle3D');
        const resetViewButton = document.getElementById('resetView');

        if (!toggle3DButton || !resetViewButton) {
            console.error('3D control buttons not found in DOM');
            return;
        }

        // Add click event listeners
        toggle3DButton.addEventListener('click', function() {
            is3DMode = !is3DMode;
            if (is3DMode) {
                mumbaiMap.setTilt(45);
                this.classList.add('active');
            } else {
                mumbaiMap.setTilt(0);
                this.classList.remove('active');
            }
        });

        resetViewButton.addEventListener('click', function() {
            mumbaiMap.setCenter({ lat: 19.3917, lng: 72.8397 });
            mumbaiMap.setZoom(14);
            mumbaiMap.setTilt(0);
            is3DMode = false;
            toggle3DButton.classList.remove('active');
        });

        console.log('3D map controls set up successfully');
    } catch (error) {
        console.error('Error setting up 3D map controls:', error);
    }
}

// City Overview Data
function updateCityOverview() {
    try {
        console.log('Updating city overview data...');
        
        // Update population
        const populationElement = document.getElementById('population');
        if (populationElement) {
            populationElement.textContent = "12.5M";
        } else {
            console.warn('Population element not found');
        }

        // Update green coverage (simulated data)
        const greenCoverageElement = document.getElementById('greenCoverage');
        if (greenCoverageElement) {
            const greenCoverage = calculateGreenCoverage();
            greenCoverageElement.textContent = greenCoverage;
        } else {
            console.warn('Green coverage element not found');
        }

        // Update solar energy (simulated data)
        const solarEnergyElement = document.getElementById('solarEnergy');
        if (solarEnergyElement) {
            const solarEnergy = calculateSolarEnergy();
            solarEnergyElement.textContent = solarEnergy;
        } else {
            console.warn('Solar energy element not found');
        }

        // Update water level and pressure (simulated data)
        const waterLevelElement = document.getElementById('water-level');
        const waterPressureElement = document.getElementById('water-level-pressure');
        
        if (waterLevelElement) {
            waterLevelElement.textContent = "25 feet";
        } else {
            console.warn('Water level element not found');
        }
        
        if (waterPressureElement) {
            waterPressureElement.textContent = "25%";
        } else {
            console.warn('Water pressure element not found');
        }

        console.log('City overview data updated successfully');
    } catch (error) {
        console.error('Error updating city overview:', error);
    }
}

function calculateGreenCoverage() {
    const month = new Date().getMonth();
    let baseCoverage = 35; // Default coverage
    
    // Adjust based on season
    if (month >= 6 && month <= 9) {
        baseCoverage += 5; // Monsoon season
    } else if (month >= 10 && month <= 1) {
        baseCoverage -= 2; // Winter season
    }
    
    return Math.round(baseCoverage) + '%';
}

function calculateSolarEnergy() {
    const hour = new Date().getHours();
    let solarEnergy = 0;
    
    if (hour >= 10 && hour <= 16) {
        solarEnergy = 85; // Peak hours
    } else if (hour >= 6 && hour < 10) {
        solarEnergy = 45; // Morning hours
    } else if (hour > 16 && hour <= 20) {
        solarEnergy = 25; // Evening hours
    }
    
    return solarEnergy + '%';
}

// Utility function for API calls with retry
async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
}

// Weather API Integration
async function fetchWeatherData() {
    const weatherInfo = document.querySelector('.weather-info');
    weatherInfo.classList.add('loading');
    try {
        const apiKey = "f2c5df84dc7ca2ceaeacf09cf8ae8f41";
        const city = "Mumbai";
        return await fetchWithRetry(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    } catch (error) {
        console.error('Weather data fetch failed:', error);
        weatherInfo.classList.add('error');
        return null;
    } finally {
        weatherInfo.classList.remove('loading');
    }
}

function updateWeatherInfo(data) {
    if (!data) return;
    
    // Update temperature
    const temperature = Math.round(data.main.temp);
    document.querySelector('.temperature').textContent = `${temperature}°C`;
    
    // Update weather description and icon
    const weatherMain = data.weather[0].main.toLowerCase();
    const weatherDesc = data.weather[0].description.toLowerCase();
    document.querySelector('.weather-desc').textContent = weatherDesc;
    
    // Update weather icon
    const weatherIcon = document.querySelector('.weather-info i');
    
    const iconMap = {
        'clear': 'fa-sun',
        'clouds': weatherDesc.includes('few') ? 'fa-cloud-sun' : 'fa-cloud',
        'rain': 'fa-cloud-rain',
        'snow': 'fa-snowflake',
        'thunderstorm': 'fa-bolt',
        'mist': 'fa-smog',
        'haze': 'fa-smog',
        'smoke': 'fa-smog',
        'drizzle': 'fa-cloud-rain',
        'fog': 'fa-smog',
        'dust': 'fa-smog',
        'sand': 'fa-smog',
        'ash': 'fa-smog',
        'squall': 'fa-wind',
        'tornado': 'fa-tornado'
    };
    
    weatherIcon.className = `fas ${iconMap[weatherMain] || 'fa-cloud'}`;
}

// AQI Integration
async function fetchAQIData() {
    const aqiSection = document.querySelector('.aqi-section');
    aqiSection.classList.add('loading');
    try {
        const apiKey = "f2c5df84dc7ca2ceaeacf09cf8ae8f41";
        const lat = 19.0760;
        const lon = 72.8777;
        return await fetchWithRetry(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    } catch (error) {
        console.error('AQI data fetch failed:', error);
        aqiSection.classList.add('error');
        return null;
    } finally {
        aqiSection.classList.remove('loading');
    }
}

function updateAQIDisplay(data) {
    if (!data || !data.list || !data.list[0] || !data.list[0].components) {
        throw new Error('Invalid AQI data format');
    }

    const components = data.list[0].components;
    const aqiValue = calculateAQI(components);
    
    // Update AQI value
    document.querySelector('.aqi-value .value').textContent = aqiValue;

    // Update AQI status and class
    const status = getAQIStatus(aqiValue);
    document.querySelector('.aqi-status').textContent = status;
    
    // Update AQI section class
    const aqiSection = document.querySelector('.aqi-section');
    aqiSection.className = 'grid-item aqi-section aqi-' + getAQIClass(aqiValue);

    // Update pollutant values
    const metrics = {
        'PM2.5': components.pm2_5,
        'PM10': components.pm10,
        'NO2': components.no2
    };

    // Update each pollutant value
    Object.entries(metrics).forEach(([pollutant, value]) => {
        const metricElements = document.querySelectorAll('.aqi-metric');
        metricElements.forEach(element => {
            const label = element.querySelector('.metric-label');
            if (label && label.textContent === pollutant) {
                const valueElement = element.querySelector('.metric-value');
                if (valueElement) {
                    valueElement.textContent = `${Math.round(value)} µg/m³`;
                }
            }
        });
    });
}

function calculateAQI(components) {
    const pm25 = components.pm2_5;
    const pm10 = components.pm10;
    const no2 = components.no2;

    const pm25Index = calculatePM25Index(pm25);
    const pm10Index = calculatePM10Index(pm10);
    const no2Index = calculateNO2Index(no2);

    return Math.max(pm25Index, pm10Index, no2Index);
}

function calculatePM25Index(pm25) {
    if (pm25 <= 12) return Math.round((50/12) * pm25);
    if (pm25 <= 35.4) return Math.round(50 + (50/23.4) * (pm25 - 12));
    if (pm25 <= 55.4) return Math.round(100 + (50/20) * (pm25 - 35.4));
    if (pm25 <= 150.4) return Math.round(150 + (50/95) * (pm25 - 55.4));
    if (pm25 <= 250.4) return Math.round(200 + (50/100) * (pm25 - 150.4));
    return Math.round(300 + (100/149.6) * (pm25 - 250.4));
}

function calculatePM10Index(pm10) {
    if (pm10 <= 54) return Math.round((50/54) * pm10);
    if (pm10 <= 154) return Math.round(50 + (50/100) * (pm10 - 54));
    if (pm10 <= 254) return Math.round(100 + (50/100) * (pm10 - 154));
    if (pm10 <= 354) return Math.round(150 + (50/100) * (pm10 - 254));
    if (pm10 <= 424) return Math.round(200 + (50/70) * (pm10 - 354));
    return Math.round(300 + (100/75) * (pm10 - 424));
}

function calculateNO2Index(no2) {
    if (no2 <= 53) return Math.round((50/53) * no2);
    if (no2 <= 100) return Math.round(50 + (50/47) * (no2 - 53));
    if (no2 <= 360) return Math.round(100 + (50/260) * (no2 - 100));
    if (no2 <= 649) return Math.round(150 + (50/289) * (no2 - 360));
    if (no2 <= 1249) return Math.round(200 + (50/600) * (no2 - 649));
    return Math.round(300 + (100/750) * (no2 - 1249));
}

function getAQIStatus(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

function getAQIClass(aqi) {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitivity';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
}

// Initialize all data
async function initializeData() {
    try {
        // Fetch weather data
        const weatherData = await fetchWeatherData();
        updateWeatherInfo(weatherData);

        // Fetch AQI data
        const aqiData = await fetchAQIData();
        updateAQIDisplay(aqiData);
        
        // Update time
        updateTime();
        setInterval(updateTime, 60000); // Update every minute

        // Set up intervals for data updates
        setInterval(() => fetchWeatherData().then(updateWeatherInfo), 60000); // Every 1 minute
        setInterval(() => fetchAQIData().then(updateAQIDisplay), 60000); // Every 1 minute
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Time update functionality
function updateTime() {
    const now = new Date();
    
    // Update time
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    document.querySelector('.current-time').textContent = timeString;
    
    // Update date
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.querySelector('.current-date').textContent = dateString;
}

function setupMapControls() {
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        trafficMap.setZoom(trafficMap.getZoom() + 1);
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        trafficMap.setZoom(trafficMap.getZoom() - 1);
    });

    // Center map
    document.getElementById('centerMap').addEventListener('click', () => {
        trafficMap.setCenter(mumbaiCenter);
        trafficMap.setZoom(12);
    });

    // Toggle traffic layer
    document.getElementById('toggleTraffic').addEventListener('click', function() {
        if (trafficLayer.getMap()) {
            trafficLayer.setMap(null);
            this.classList.remove('active');
        } else {
            trafficLayer.setMap(trafficMap);
            this.classList.add('active');
        }
    });

    // Toggle transit layer
    document.getElementById('toggleTransit').addEventListener('click', function() {
        if (transitLayer.getMap()) {
            transitLayer.setMap(null);
            this.classList.remove('active');
        } else {
            transitLayer.setMap(trafficMap);
            this.classList.add('active');
        }
    });

    // Toggle EV charging points
    document.getElementById('toggleCharging').addEventListener('click', function() {
        if (chargingPointsLayer) {
            clearChargingPoints();
            this.classList.remove('active');
        } else {
            searchChargingPoints();
            this.classList.add('active');
        }
    });
}

function searchChargingPoints() {
    try {
        // Use the new Places API
        const service = new google.maps.places.PlacesService(trafficMap);
        const request = {
            location: trafficMap.getCenter(),
            radius: '5000',
            type: ['charging_station']
        };

        // First try to use the new Places API
        if (google.maps.places.Place) {
            const places = new google.maps.places.Place({
                location: request.location,
                radius: request.radius,
                type: request.type
            });

            places.search().then(results => {
                displayChargingPoints(results);
            }).catch(error => {
                console.error('Error searching for charging points:', error);
                displayStaticChargingPoints();
            });
        } else {
            // Fallback to the legacy PlacesService if the new API is not available
            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displayChargingPoints(results);
                } else {
                    console.error('Error searching for charging points:', status);
                    displayStaticChargingPoints();
                }
            });
        }
    } catch (error) {
        console.error('Error in searchChargingPoints:', error);
        displayStaticChargingPoints();
    }
}

function displayChargingPoints(places) {
    // Clear existing markers if any
    clearChargingPoints();

    // Create markers for each charging point
    places.forEach(place => {
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: trafficMap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF0000',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            title: place.name
        });

        // Add info window with place details
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0;">${place.name}</h3>
                    <p style="margin: 0;">${place.vicinity}</p>
                    ${place.rating ? `<p style="margin: 5px 0;">Rating: ${place.rating} ⭐</p>` : ''}
                    <button onclick="getDirections('${place.geometry.location.lat()},${place.geometry.location.lng()}')" 
                            style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        Get Directions
                    </button>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(trafficMap, marker);
        });

        chargingPointsMarkers.push(marker);
    });

    chargingPointsLayer = true;
}

function displayStaticChargingPoints() {
    // Clear existing markers if any
    clearChargingPoints();

    // Static charging points data for Mumbai
    const staticChargingPoints = [
        {
            name: 'Tata Power Charging Station',
            position: { lat: 19.0760, lng: 72.8777 },
            vicinity: 'Bandra West',
            rating: 4.5
        },
        {
            name: 'Reliance EV Charging',
            position: { lat: 19.0896, lng: 72.8656 },
            vicinity: 'Andheri East',
            rating: 4.2
        },
        {
            name: 'Mahindra EV Station',
            position: { lat: 18.9322, lng: 72.8347 },
            vicinity: 'Colaba',
            rating: 4.0
        }
    ];

    // Create markers for each charging point
    staticChargingPoints.forEach(point => {
        const marker = new google.maps.Marker({
            position: point.position,
            map: trafficMap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF0000',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            title: point.name
        });

        // Add info window with place details
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0;">${point.name}</h3>
                    <p style="margin: 0;">${point.vicinity}</p>
                    ${point.rating ? `<p style="margin: 5px 0;">Rating: ${point.rating} ⭐</p>` : ''}
                    <button onclick="getDirections('${point.position.lat},${point.position.lng}')" 
                            style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                        Get Directions
                    </button>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(trafficMap, marker);
        });

        chargingPointsMarkers.push(marker);
    });

    chargingPointsLayer = true;
}

function clearChargingPoints() {
    chargingPointsMarkers.forEach(marker => marker.setMap(null));
    chargingPointsMarkers = [];
    chargingPointsLayer = null;
}

function getDirections(destination) {
    const origin = new google.maps.LatLng(mumbaiCenter.lat, mumbaiCenter.lng);
    const dest = destination.split(',').map(coord => parseFloat(coord));
    const destinationLatLng = new google.maps.LatLng(dest[0], dest[1]);

    const request = {
        origin: origin,
        destination: destinationLatLng,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Error getting directions:', status);
        }
    });
}

function initializeTrafficData() {
    // Update traffic data every 5 minutes
    updateTrafficData();
    setInterval(updateTrafficData, 300000);
}

function updateTrafficData() {
    // Get user's location (simulated for demo)
    const userLocation = mumbaiCenter;

    // Update routes to key locations
    Object.entries(keyLocations).forEach(([key, location]) => {
        calculateRoute(userLocation, location);
    });
}

function calculateRoute(origin, destination) {
    const request = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            updateRouteInfo(result, destination.name);
        }
    });
}

function updateRouteInfo(result, destinationName) {
    const route = result.routes[0].legs[0];
    const duration = route.duration_in_traffic || route.duration;
    const distance = route.distance;
    
    // Calculate traffic level based on duration ratio
    const normalDuration = route.duration.value;
    const currentDuration = duration.value;
    const ratio = currentDuration / normalDuration;
    
    let trafficLevel = 'light';
    if (ratio > 1.5) trafficLevel = 'heavy';
    else if (ratio > 1.2) trafficLevel = 'moderate';

    // Find the route card by searching through all traffic routes
    const routeCards = document.querySelectorAll('.traffic-route');
    let targetCard = null;
    
    for (const card of routeCards) {
        const routeNameElement = card.querySelector('.route-name');
        if (routeNameElement && routeNameElement.textContent.trim() === destinationName) {
            targetCard = card;
            break;
        }
    }

    if (targetCard) {
        // Update status dot
        const statusDot = targetCard.querySelector('.status-dot');
        if (statusDot) {
            statusDot.className = `status-dot status-${trafficLevel}`;
        }
        
        // Update status text
        const statusText = targetCard.querySelector('.traffic-status span:last-child');
        if (statusText) {
            statusText.textContent = trafficLevel.charAt(0).toUpperCase() + trafficLevel.slice(1) + ' Traffic';
        }

        // Update duration
        const durationText = targetCard.querySelector('.route-details i.fa-clock')?.nextSibling;
        if (durationText) {
            durationText.textContent = ` ${Math.round(duration.value / 60)} mins`;
        }

        // Update distance
        const distanceText = targetCard.querySelector('.route-details i.fa-road')?.nextSibling;
        if (distanceText) {
            distanceText.textContent = ` ${Math.round(distance.value / 1000)} km`;
        }
    } else {
        console.warn(`Could not find route card for destination: ${destinationName}`);
        // Create a new route card if it doesn't exist
        createRouteCard(destinationName, trafficLevel, duration, distance);
    }
}

function createRouteCard(destinationName, trafficLevel, duration, distance) {
    const trafficInfo = document.querySelector('.traffic-info');
    if (!trafficInfo) return;

    const routeCard = document.createElement('div');
    routeCard.className = 'traffic-route';
    routeCard.innerHTML = `
        <div class="route-header">
            <span class="route-name">${destinationName}</span>
            <div class="traffic-status">
                <span class="status-dot status-${trafficLevel}"></span>
                <span>${trafficLevel.charAt(0).toUpperCase() + trafficLevel.slice(1)} Traffic</span>
            </div>
        </div>
        <div class="route-details">
            <i class="fas fa-clock"></i> ${Math.round(duration.value / 60)} mins
            <i class="fas fa-road"></i> ${Math.round(distance.value / 1000)} km
        </div>
    `;

    trafficInfo.appendChild(routeCard);
}

// Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Add CSS styles for 3D map controls
const style = document.createElement('style');
style.textContent = `
    .map-control-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        margin: 0 5px;
        border: none;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }

    .map-control-button:hover {
        background: #f0f0f0;
    }

    .map-control-button.active {
        background: #e0e0e0;
    }

    .map-control-button i {
        font-size: 16px;
    }

    #mumbai3DMap {
        height: 300px;
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
    }

    .map-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        background: white;
        padding: 5px;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        gap: 5px;
    }

    [data-theme="dark"] .map-controls {
        background: var(--card-bg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }

    [data-theme="dark"] .map-control-button {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    [data-theme="dark"] .map-control-button:hover {
        background: var(--hover-bg);
    }

    [data-theme="dark"] .map-control-button.active {
        background: var(--primary-color);
        color: white;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeData();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Initialize map when Google Maps API is loaded
    if (typeof google !== 'undefined' && google.maps) {
        console.log('Google Maps API loaded, initializing maps...');
        initializeMaps();
    } else {
        console.log('Waiting for Google Maps API to load...');
        // Wait for Google Maps API to load
        window.initializeMaps = function() {
            console.log('Google Maps API loaded via callback, initializing maps...');
            initializeMaps();
        };
    }
});