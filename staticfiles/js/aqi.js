// AQI Integration
async function fetchAQIData() {
    const aqiSection = document.querySelector('.aqi-section');
    aqiSection.classList.add('loading');
    try {
        const apiKey = "f2c5df84dc7ca2ceaeacf09cf8ae8f41";
        const lat = 19.0760;
        const lon = 72.8777;
        const data = await fetchWithRetry(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        return data;
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
        console.error('Invalid AQI data format');
        return;
    }

    const components = data.list[0].components;
    const aqiValue = calculateAQI(components);
    
    // Update AQI value
    const valueElement = document.querySelector('.aqi-value .value');
    if (valueElement) {
        valueElement.textContent = aqiValue;
    }

    // Update AQI status and class
    const status = getAQIStatus(aqiValue);
    const statusElement = document.querySelector('.aqi-status');
    if (statusElement) {
        statusElement.textContent = status;
    }
    
    // Update AQI section class
    const aqiSection = document.querySelector('.aqi-section');
    if (aqiSection) {
        aqiSection.className = 'grid-item aqi-section aqi-' + getAQIClass(aqiValue);
    }

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

// Initialize AQI data
async function initializeAQI() {
    try {
        const aqiData = await fetchAQIData();
        if (aqiData) {
            updateAQIDisplay(aqiData);
        }
        // Update AQI data every 5 minutes
        setInterval(async () => {
            const updatedData = await fetchAQIData();
            if (updatedData) {
                updateAQIDisplay(updatedData);
            }
        }, 300000);
    } catch (error) {
        console.error('Error initializing AQI:', error);
    }
}

// Export functions for use in other files
window.initializeAQI = initializeAQI; 