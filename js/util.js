// util.js
// --------------------------------------------------
// Fungsi bantuan global untuk frontend PIBG @ SPS
// --------------------------------------------------

const Util = {

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
        const url = (CONFIG.API_PROXY_URL && CONFIG.API_PROXY_URL.length) 
            ? CONFIG.API_PROXY_URL 
            : CONFIG.APPS_SCRIPT_URL;
        const timeout = CONFIG.REQUEST_TIMEOUT || 60000;

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(id);

            const text = await res.text();
            try {
                const json = JSON.parse(text);
                if (!res.ok && json && json.message) {
                    return { ok: false, message: json.message, status: res.status, raw: json };
                }
                return json;
            } catch (err) {
                return { 
                    ok: false, 
                    message: "Respons server tidak sah", 
                    status: res.status, 
                    rawText: text 
                };
            }

        } catch (e) {
            if (e.name === "AbortError") {
                return { 
                    ok: false, 
                    message: "Permintaan tamat masa (" + timeout + "ms). Sila cuba lagi." 
                };
            }
            console.error("postJSON error:", e);
            return { 
                ok: false, 
                message: "Gagal menyambung ke pelayan. Sila semak sambungan internet anda." 
            };
        }
    },

    // ---------- Token Management ----------
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
    },

    // ---------- Format tarikh untuk display (DD/MM/YYYY) ----------
    formatDateDisplay: function (dateStr) {
        if (!dateStr) return '-';
        const [yyyy, mm, dd] = dateStr.split('-');
        return `${dd}/${mm}/${yyyy}`;
    },

    // ---------- Format masa untuk display ----------
    formatDateTime: function (timestamp) {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        return `${Util.formatDateDisplay(Util.formatDate(d))} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
};

// ==========================================
// iziToast Notification System - IMPROVED
// ==========================================

const notify = {
  
    // Success notification - Lebih mesra pengguna
    success: function(message, options = {}) {
        const title = options.title || 'Berjaya!';
        iziToast.success({
            title: title,
            message: message,
            position: 'topRight',
            timeout: 4000,
            progressBar: true,
            progressBarColor: 'rgba(255, 255, 255, 0.7)',
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fas fa-check-circle',
            iconColor: '#fff',
            backgroundColor: '#10B981',
            titleColor: '#fff',
            titleSize: '18px',
            messageColor: '#fff',
            messageSize: '14px',
            displayMode: 'replace',
            ...options
        });
    },
  
    // Error notification - Lebih jelas & helpful
    error: function(message, options = {}) {
        const title = options.title || 'Ralat!';
        iziToast.error({
            title: title,
            message: message,
            position: 'topRight',
            timeout: 6000,
            progressBar: true,
            progressBarColor: 'rgba(255, 255, 255, 0.7)',
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fas fa-exclamation-circle',
            iconColor: '#fff',
            backgroundColor: '#DC2626',
            titleColor: '#fff',
            titleSize: '18px',
            messageColor: '#fff',
            messageSize: '14px',
            displayMode: 'replace',
            ...options
        });
    },
  
    // Warning notification - Amaran yang menarik perhatian
    warning: function(message, options = {}) {
        const title = options.title || 'Perhatian!';
        iziToast.warning({
            title: title,
            message: message,
            position: 'topRight',
            timeout: 5000,
            progressBar: true,
            progressBarColor: 'rgba(255, 255, 255, 0.7)',
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fas fa-exclamation-triangle',
            iconColor: '#fff',
            backgroundColor: '#F59E0B',
            titleColor: '#fff',
            titleSize: '18px',
            messageColor: '#fff',
            messageSize: '14px',
            displayMode: 'replace',
            ...options
        });
    },
  
    // Info notification - Maklumat penting
    info: function(message, options = {}) {
        const title = options.title || 'Maklumat';
        iziToast.info({
            title: title,
            message: message,
            position: 'topRight',
            timeout: 4500,
            progressBar: true,
            progressBarColor: 'rgba(255, 255, 255, 0.7)',
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fas fa-info-circle',
            iconColor: '#fff',
            backgroundColor: '#0066FF',
            titleColor: '#fff',
            titleSize: '18px',
            messageColor: '#fff',
            messageSize: '14px',
            displayMode: 'replace',
            ...options
        });
    },
  
    // Loading notification - Untuk proses yang mengambil masa
    loading: function(message) {
        iziToast.show({
            id: 'loading-toast',
            title: 'Sila Tunggu',
            message: message || 'Sedang memproses permohonan anda...',
            position: 'topCenter',
            timeout: false,
            close: false,
            progressBar: false,
            icon: 'fas fa-spinner fa-spin',
            iconColor: '#fff',
            backgroundColor: '#3282B8',
            titleColor: '#fff',
            titleSize: '18px',
            messageColor: '#fff',
            messageSize: '14px',
            transitionIn: 'fadeInDown',
            overlay: true,
            overlayClose: false
        });
    },
  
    // Dismiss loading
    dismissLoading: function() {
        const loadingToast = document.querySelector('#loading-toast');
        if (loadingToast) {
            iziToast.hide({}, loadingToast);
        }
    },
  
    // Question/Confirm dialog - Untuk confirmation
    confirm: function(message, onYes, onNo, options = {}) {
        const title = options.title || 'Pengesahan Diperlukan';
        iziToast.question({
            timeout: false,
            close: false,
            overlay: true,
            overlayClose: false,
            displayMode: 'once',
            id: 'confirm-dialog',
            zindex: 9999,
            title: title,
            message: message,
            position: 'center',
            icon: 'fas fa-question-circle',
            backgroundColor: '#0F4C75',
            titleColor: '#fff',
            titleSize: '20px',
            messageColor: '#fff',
            messageSize: '16px',
            iconColor: '#FFE66D',
            maxWidth: '500px',
            buttons: [
                [
                    '<button style="background: #10B981; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; margin-right: 8px;"><i class="fas fa-check"></i> Ya, Teruskan</button>', 
                    function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        if (onYes) onYes();
                    }, 
                    true
                ],
                [
                    '<button style="background: #6B7280; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;"><i class="fas fa-times"></i> Batal</button>', 
                    function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        if (onNo) onNo();
                    }
                ]
            ],
            ...options
        });
    },

   // Custom notification dengan kod sekolah & ReqID
        successWithRef: function(kodSekolah, reqID) {
            iziToast.success({
                title: 'Permohonan Berjaya Dihantar! 🎉',
                message: `<div style="margin-top: 8px;">
                            <strong style="font-size: 15px;">Kod Sekolah:</strong> 
                            <span style="font-size: 18px; font-weight: bold;">${kodSekolah}</span><br>
                            <strong style="font-size: 15px;">ID Permohonan:</strong> 
                            <span style="font-size: 18px; font-weight: bold; letter-spacing: 1px;">${reqID}</span><br>
                            <span style="font-size: 13px; margin-top: 6px; display: block;">Permohonan anda akan diproses dalam masa terdekat. Terima kasih.</span>
                          </div>`,
            position: 'topCenter',
            timeout: 10000,
            progressBar: true,
            progressBarColor: 'rgba(255, 255, 255, 0.7)',
            transitionIn: 'bounceInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fas fa-file-check',
            iconColor: '#fff',
            backgroundColor: '#059669',
            titleColor: '#fff',
            titleSize: '20px',
            messageColor: '#fff',
            maxWidth: '450px',
            layout: 2
        });
    }
};

// ==========================================
// Backward Compatibility
// ==========================================

// Support old toast function
Util.toast = function(msg, type = "info", timeout = 4000) {
    const typeMap = {
        info: 'info',
        success: 'success',
        error: 'error',
        warn: 'warning'
    };
    notify[typeMap[type] || 'info'](msg);
};

// Support old showNotification function
function showNotification(type, message) {
    if (notify[type]) {
        notify[type](message);
    } else {
        notify.info(message);
    }
}

// Expose to global
window.Util = Util;
window.notify = notify;
