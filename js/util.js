// util.js
// --------------------------------------------------
// Fungsi bantuan global untuk frontend PIBG @ SPS
// --------------------------------------------------

const Util = {

    // ---------- Toast Notification ----------
    toast: function (msg, type = "info", timeout = 4000) {
        const colors = {
            info: "bg-blue-600",
            success: "bg-green-600",
            error: "bg-red-600",
            warn: "bg-yellow-600"
        };

        const box = document.createElement("div");
        box.className = `fixed bottom-5 right-5 text-white px-4 py-2 rounded shadow-lg text-sm z-50 ${colors[type] || colors.info}`;
        box.textContent = msg;
        document.body.appendChild(box);

        setTimeout(() => box.remove(), timeout);
    },

    // ---------- Convert File to Base64 ----------
    fileToBase64: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(",")[1];
                resolve({ name: file.name, type: file.type, data: base64 });
            };
            reader.onerror = () => reject("Gagal baca fail.");
            reader.readAsDataURL(file);
        });
    },
   // ---------- HTTP POST Helper ----------
    postJSON: async function (body) {
        const url = (CONFIG.API_PROXY_URL && CONFIG.API_PROXY_URL.length) ? CONFIG.API_PROXY_URL : CONFIG.APPS_SCRIPT_URL;
        const timeout = CONFIG.REQUEST_TIMEOUT || 30000;
    
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
    
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                    // jika anda mahu tambah API key: "x-api-key": "SOME_KEY"
                },
                body: JSON.stringify(body),
                signal: controller.signal,
                // credentials: "omit" (default) — kita tidak menggunakan cookies
            });
    
            clearTimeout(id);
    
            // Jika worker/proxy atau Apps Script return non-JSON (error page),
            // tangani dengan try/catch
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                // jika status bukan ok, kembalikan objek error
                if (!res.ok && json && json.message) {
                    return { ok: false, message: json.message, status: res.status, raw: json };
                }
                return json;
            } catch (err) {
                // bukan JSON
                return { ok: false, message: "Server returned non-JSON response", status: res.status, rawText: text };
            }
    
        } catch (e) {
            if (e.name === "AbortError") {
                return { ok:false, message:"Request timeout (" + timeout + "ms)" };
            }
            console.error("postJSON error:", e);
            return { ok:false, message:"Gagal sambungan ke server." };
        }
    },

    // ---------- Simpan Token Login ----------
    saveToken: function (token, role) {
        sessionStorage.setItem(CONFIG.TOKEN_KEY, token);
        sessionStorage.setItem(CONFIG.ROLE_KEY, role);
    },

    getToken: function () {
        return sessionStorage.getItem(CONFIG.TOKEN_KEY);
    },

    getRole: function () {
        return sessionStorage.getItem(CONFIG.ROLE_KEY);
    },

    clearToken: function () {
        sessionStorage.removeItem(CONFIG.TOKEN_KEY);
        sessionStorage.removeItem(CONFIG.ROLE_KEY);
    },

    // ---------- Format tarikh (YYYY-MM-DD) ----------
    formatDate: function (d) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    }
};

// Expose to global
window.Util = Util;





