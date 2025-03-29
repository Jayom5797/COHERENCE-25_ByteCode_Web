// Initialize Google Maps
function initMap() {
    const mumbai = { lat: 19.0760, lng: 72.8777 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: mumbai,
        mapTypeId: "terrain",
    });

    // Add a marker for Mumbai
    const marker = new google.maps.Marker({
        position: mumbai,
        map: map,
        title: "Mumbai"
    });
}

// Initialize all dashboard components
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AQI
    if (typeof initializeAQI === 'function') {
        initializeAQI();
    }
    
    // Initialize other components here
}); 