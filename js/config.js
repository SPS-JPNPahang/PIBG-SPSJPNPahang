// config.js (UPDATED)
// --------------------------------------------------
// Setting global untuk frontend PIBG @ SPS
// --------------------------------------------------

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0Oj9cSnlqbWO0sNFzFAdxeGx_1hMhOjJfCAF6AID672svCkBhPqonnqkw07mpmc_1Ug/exec"; // original
// --- GANTIKAN nilai ini selepas anda deploy Worker ---
const API_PROXY_URL = "https://your-worker-subdomain.workers.dev"; // <-- ganti selepas deploy

const CONFIG = {
    SYSTEM_NAME: "PIBG @ SPS",
    VERSION: "1.0.0",

    // URL untuk dipanggil oleh frontend. Worker (proxy) diutamakan.
    APPS_SCRIPT_URL: APPS_SCRIPT_URL,
    API_PROXY_URL: API_PROXY_URL,

    TOKEN_KEY: "PIBG_TOKEN",
    ROLE_KEY: "PIBG_ROLE",
    REQUEST_TIMEOUT: 15000 // ms
};

window.CONFIG = CONFIG;
