// Configuration
const CONFIG = {
    // API Base URL - Doink's Symfony backend
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://127.0.0.1:8000'  // Symfony backend
        : 'https://app.playdoink.com',  // Production
    
    // Frontend Base URL - for magic links
    FRONTEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080'
        : 'https://playdoink.com'
};
