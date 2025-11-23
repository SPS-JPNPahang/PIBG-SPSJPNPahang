// config.js
// --------------------------------------------------
// Setting global untuk frontend PIBG @ SPS
// --------------------------------------------------

const CONFIG = {
    SYSTEM_NAME: "PIBG @ SPS",
    VERSION: "1.0.0",

    // MASUKKAN URL WEB APP APPS SCRIPT ANDA DI SINI
    WEBAPP_URL: "https://script.google.com/macros/s/AKfycbw0Oj9cSnlqbWO0sNFzFAdxeGx_1hMhOjJfCAF6AID672svCkBhPqonnqkw07mpmc_1Ug/exec",
    // Option 1
    "https://cors-anywhere.herokuapp.com/" + ORIGINAL_URL,
    
    // Option 2
    // "https://api.allorigins.win/raw?url=" + encodeURIComponent(ORIGINAL_URL)
    
    // Option 3
    // "https://corsproxy.io/?" + ORIGINAL_URL

    TOKEN_KEY: "PIBG_TOKEN",
    ROLE_KEY: "PIBG_ROLE",

    REQUEST_TIMEOUT: 15000 // 15s
};

// export ke global
window.CONFIG = CONFIG;


