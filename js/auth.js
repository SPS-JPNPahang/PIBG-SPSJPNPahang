// auth.js
// --------------------------------------------------
// Login Pegawai & Login TP menggunakan Apps Script
// --------------------------------------------------

const AuthUI = {

    init: function () {
        this.renderPegawaiLogin();
        this.renderTPLogin();
    },

    // ------------------------------
    // UI → Pegawai Login
    // ------------------------------
    renderPegawaiLogin: function () {
        const el = document.getElementById("pegawai-login");
        el.innerHTML = `
            <div class="p-4 bg-white rounded shadow max-w-sm">
                <h3 class="font-semibold mb-2">Log Masuk Pegawai</h3>
                <input id="peg-pass" type="password" placeholder="Kata Laluan Pegawai"
                    class="border rounded px-3 py-2 w-full mb-3" />

                <button id="btn-peg-login"
                    class="w-full bg-blue-600 text-white px-4 py-2 rounded">
                    Log Masuk
                </button>
            </div>
        `;

        document.getElementById("btn-peg-login").onclick = async () => {
            const password = document.getElementById("peg-pass").value.trim();

            const res = await Util.postJSON({
                type: "login",
                payload: { role:"pegawai", password }
            });

            if (!res.ok) return Util.toast(res.message, "error");

            Util.saveToken(res.token, "pegawai");

            document.getElementById("pegawai-login").classList.add("hidden");
            document.getElementById("pegawai-dashboard").classList.remove("hidden");

            Util.toast("Selamat datang, Pegawai.", "success");

            // Muatkan dashboard
            if (typeof PegawaiUI !== "undefined") {
                PegawaiUI.loadDashboard();
            }
        };
    },

    // ------------------------------
    // UI → TP Login
    // ------------------------------
    renderTPLogin: function () {
        const el = document.getElementById("tp-login");
        el.innerHTML = `
            <div class="p-4 bg-white rounded shadow max-w-sm">
                <h3 class="font-semibold mb-2">Log Masuk Timbalan Pengarah</h3>
                <input id="tp-pass" type="password" placeholder="Kata Laluan TP"
                    class="border rounded px-3 py-2 w-full mb-3" />

                <button id="btn-tp-login"
                    class="w-full bg-purple-700 text-white px-4 py-2 rounded">
                    Log Masuk
                </button>
            </div>
        `;

        document.getElementById("btn-tp-login").onclick = async () => {
            const password = document.getElementById("tp-pass").value.trim();

            const res = await Util.postJSON({
                type: "login",
                payload: { role:"tp", password }
            });

            if (!res.ok) return Util.toast(res.message, "error");

            Util.saveToken(res.token, "tp");

            document.getElementById("tp-login").classList.add("hidden");
            document.getElementById("tp-dashboard").classList.remove("hidden");

            Util.toast("Selamat datang, TP.", "success");

            if (typeof TPUI !== "undefined") {
                TPUI.loadDashboard();
            }
        };
    },

    // ------------------------------
    // Logout (pegawai / TP)
    // ------------------------------
    logout: function () {
        Util.clearToken();
        Util.toast("Anda telah log keluar.", "info");
        location.reload();
    }
};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => AuthUI.init());
