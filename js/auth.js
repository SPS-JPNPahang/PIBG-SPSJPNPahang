// auth.js
// --------------------------------------------------
// Unified Login - Auto-detect Pegawai or TP role
// --------------------------------------------------

const AuthUI = {

    init: function () {
        this.renderUnifiedLogin();
    },

    // ------------------------------
    // UI → Single Unified Login
    // ------------------------------
    renderUnifiedLogin: function () {
        const loginEl = document.getElementById("unified-login");
        if (loginEl) {
            loginEl.innerHTML = this.getLoginHTML();
            this.attachLoginHandler();
        }
    },

    // ------------------------------
    // HTML Template for Login Form
    // ------------------------------
    getLoginHTML: function () {
        return `
            <div class="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
                <div class="mb-6 text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
                        <i class="fas fa-lock text-white text-2xl"></i>
                    </div>
                    <h3 class="font-semibold text-xl text-gray-800">Portal Pegawai</h3>
                    <p class="text-sm text-gray-500 mt-1">Sila masukkan kata laluan anda</p>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-key text-gray-400"></i> Kata Laluan
                    </label>
                    <input type="password" 
                           placeholder="Masukkan kata laluan"
                           id="unified-password"
                           class="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>

                <button id="unified-login-btn" 
                        class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium shadow-md hover:shadow-lg">
                    <i class="fas fa-sign-in-alt"></i> Log Masuk
                </button>

                <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div class="flex items-start gap-2">
                        <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
                        <p class="text-xs text-blue-800">
                            Sistem akan mengenal pasti peranan anda secara automatik berdasarkan kata laluan yang dimasukkan.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // ------------------------------
    // Attach Login Handler
    // ------------------------------
    attachLoginHandler: function () {
        const passwordInput = document.getElementById("unified-password");
        const loginBtn = document.getElementById("unified-login-btn");

        if (!passwordInput || !loginBtn) return;

        // Click handler
        loginBtn.onclick = () => this.handleLogin(passwordInput);

        // Enter key handler
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handleLogin(passwordInput);
            }
        });
    },

    // ------------------------------
    // Handle Login Logic
    // ------------------------------
    handleLogin: async function (passwordInput) {
        const password = passwordInput.value.trim();

        if (!password) {
            return notify.warning("Sila masukkan kata laluan.");
        }

        notify.loading("Mengesahkan...");

        // Try Pegawai first
        let res = await Util.postJSON({
            type: "login",
            payload: { role: "pegawai", password }
        });

        let detectedRole = null;

        if (res.ok) {
            detectedRole = "pegawai";
        } else {
            // Try TP
            res = await Util.postJSON({
                type: "login",
                payload: { role: "tp", password }
            });

            if (res.ok) {
                detectedRole = "tp";
            }
        }

        notify.dismissLoading();

        // Login failed for both roles
        if (!detectedRole) {
            passwordInput.value = ""; // Clear password
            return notify.error("Kata laluan tidak sah.");
        }

        // Login success
        Util.saveToken(res.token, detectedRole);

        // Hide login panel
        const loginPanel = document.getElementById("unified-login-panel");
        if (loginPanel) loginPanel.classList.add("hidden");

        // Show appropriate dashboard
        const dashboardId = detectedRole === "pegawai" ? "pegawai-dashboard" : "tp-dashboard";
        const dashboard = document.getElementById(dashboardId);
        if (dashboard) dashboard.classList.remove("hidden");

        const roleTitle = detectedRole === "pegawai" ? "Pegawai Penyemak" : "Timbalan Pengarah";
        notify.success(`Selamat datang, ${roleTitle}!`);

        // Load appropriate dashboard
        if (detectedRole === "pegawai" && typeof PegawaiUI !== "undefined") {
            PegawaiUI.loadDashboard();
        } else if (detectedRole === "tp" && typeof TPUI !== "undefined") {
            TPUI.loadDashboard();
        }
    },

    // ------------------------------
    // Logout
    // ------------------------------
    logout: function () {
        // Clear tokens
        Util.clearToken();
        
        // Clear session storage completely
        sessionStorage.clear();
        
        // Clear any cached data
        if (window.localStorage) {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.ROLE_KEY);
        }
        
        // Hide all dashboards
        const pegawaiDash = document.getElementById("pegawai-dashboard");
        const tpDash = document.getElementById("tp-dashboard");
        
        if (pegawaiDash) pegawaiDash.classList.add("hidden");
        if (tpDash) tpDash.classList.add("hidden");
        
        // Show login panel
        const loginPanel = document.getElementById("unified-login-panel");
        if (loginPanel) loginPanel.classList.remove("hidden");
        
        // Clear password field
        const passwordInput = document.getElementById("unified-password");
        if (passwordInput) passwordInput.value = "";
        
        notify.info("Anda telah log keluar.");
    }
};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => AuthUI.init());
