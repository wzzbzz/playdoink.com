// Configuration
const CONFIG = {
    // API Base URL - change this for production
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://127.0.0.1:8000'
        : 'https://app.playdoink.com',
    
    // Frontend Base URL - for magic links
    FRONTEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080'
        : 'https://playdoink.com'
};
