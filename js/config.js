// config.js
// --------------------------------------------------
// Setting global untuk frontend PIBG @ SPS
// --------------------------------------------------

const ORIGINAL_URL = "https://script.google.com/macros/s/AKfycbw0Oj9cSnlqbWO0sNFzFAdxeGx_1hMhOjJfCAF6AID672svCkBhPqonnqkw07mpmc_1Ug/exec";

const CONFIG = {
    SYSTEM_NAME: "PIBG @ SPS",
    VERSION: "1.0.0",
    
    // PILIH SALAH SATU PROXY (uncomment 1 line sahaja):
    
    // Option 1: CORS Anywhere
    WEBAPP_URL: "https://cors-anywhere.herokuapp.com/" + ORIGINAL_URL,
    
    // Option 2: AllOrigins
    // WEBAPP_URL: "https://api.allorigins.win/raw?url=" + encodeURIComponent(ORIGINAL_URL),
    
    // Option 3: CorsProxy.io
    // WEBAPP_URL: "https://corsproxy.io/?" + ORIGINAL_URL,
    
    TOKEN_KEY: "PIBG_TOKEN",
    ROLE_KEY: "PIBG_ROLE",
    REQUEST_TIMEOUT: 15000
};

// export ke global
window.CONFIG = CONFIG;
