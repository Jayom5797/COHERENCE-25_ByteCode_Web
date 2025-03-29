// Common dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any common dashboard features
    initializeCommonFeatures();
});

function initializeCommonFeatures() {
    // Add any common dashboard initialization code here
    console.log('Dashboard initialized');
}

// Utility function for making API calls with retry
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
} 