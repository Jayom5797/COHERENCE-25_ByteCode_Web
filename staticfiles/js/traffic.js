// Traffic route functionality
function updateRouteInfo(routeName) {
    try {
        // Find the route element by checking the text content
        const routeElements = document.querySelectorAll('.traffic-route');
        const targetRoute = Array.from(routeElements).find(element => {
            const nameElement = element.querySelector('.route-name');
            return nameElement && nameElement.textContent.trim() === routeName;
        });

        if (targetRoute) {
            // Update the route information
            targetRoute.classList.add('active');
            // Add any additional route update logic here
        } else {
            console.warn(`Route not found: ${routeName}`);
        }
    } catch (error) {
        console.error('Error updating route info:', error);
    }
}

// Initialize traffic routes
function initializeTrafficRoutes() {
    try {
        const routes = [
            'Downtown Mumbai',
            'Chhatrapati Shivaji International Airport',
            'Mumbai Port'
        ];

        routes.forEach(route => {
            updateRouteInfo(route);
        });
    } catch (error) {
        console.error('Error initializing traffic routes:', error);
    }
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTrafficRoutes();
});

// Export functions for use in other files
window.initializeTrafficRoutes = initializeTrafficRoutes;
window.updateRouteInfo = updateRouteInfo; 