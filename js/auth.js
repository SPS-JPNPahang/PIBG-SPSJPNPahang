// auth.js
// --------------------------------------------------
// Unified Login - Auto-detect Pegawai or TP role
// --------------------------------------------------

const AuthUI = {

    init: function () {
        this.renderUnifiedLogin();
    },

    // ------------------------------
    // UI → Unified Login (Pegawai & TP)
    // ------------------------------
    renderUnifiedLogin: function () {
        // Render for Pegawai tab
        const pegawaiEl = document.getElementById("pegawai-login");
        if (pegawaiEl) {
            pegawaiEl.innerHTML = this.getLoginHTML("Portal Pegawai");
            this.attachLoginHandler("pegawai-login", "pegawai-dashboard");
        }

        // Render for TP tab
        const tpEl = document.getElementById("tp-login");
        if (tpEl) {
            tpEl.innerHTML = this.getLoginHTML("Portal Timbalan Pengarah");
            this.attachLoginHandler("tp-login", "tp-dashboard");
        }
    },

    // ------------------------------
    // HTML Template for Login Form
    // ------------------------------
    getLoginHTML: function (title) {
        return `
            <div class="p-4 bg-white rounded shadow max-w-sm">
                <h3 class="font-semibold mb-3 text-lg">${title}</h3>
                
                <div class="mb-3">
                    <label class="block text-sm font-medium mb-1">Kata Laluan</label>
                    <input type="password" placeholder="Masukkan kata laluan"
                        class="login-password border rounded px-3 py-2 w-full" />
                </div>

                <button class="login-btn w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                    <i class="fas fa-sign-in-alt"></i> Log Masuk
                </button>

                <div class="mt-3 text-xs text-gray-600">
                    <i class="fas fa-info-circle"></i> 
                    Sila masukkan password anda dengan betul.
                </div>
            </div>
        `;
    },

    // ------------------------------
    // Attach Login Handler
    // ------------------------------
    attachLoginHandler: function (loginContainerId, dashboardContainerId) {
        const container = document.getElementById(loginContainerId);
        if (!container) return;

        const passwordInput = container.querySelector(".login-password");
        const loginBtn = container.querySelector(".login-btn");

        if (!passwordInput || !loginBtn) return;

        // Click handler
        loginBtn.onclick = () => this.handleLogin(passwordInput, loginContainerId, dashboardContainerId);

        // Enter key handler
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handleLogin(passwordInput, loginContainerId, dashboardContainerId);
            }
        });
    },

    // ------------------------------
    // Handle Login Logic
    // ------------------------------
    handleLogin: async function (passwordInput, loginContainerId, dashboardContainerId) {
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
            return notify.error("Kata laluan tidak sah.");
        }

        // Login success
        Util.saveToken(res.token, detectedRole);

        document.getElementById(loginContainerId).classList.add("hidden");
        document.getElementById(dashboardContainerId).classList.remove("hidden");

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
    // Logout (pegawai / TP)
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
        
        notify.info("Anda telah log keluar.");
        
        // Force reload after clearing
        setTimeout(() => {
            location.reload(true); // true = force reload from server
        }, 1000);
    }
};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => AuthUI.init());


