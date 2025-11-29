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
    },

            // ---------- Format tarikh dari ISO string (Google Sheets) ke DD/MM/YYYY ----------
            formatTarikhMAT: function(dateString) {
                if (!dateString) return '-';
                
                try {
                    // Remove time and timezone info (2026-04-11T16:00:00.000Z -> 2026-04-11)
                    const dateOnly = dateString.split('T')[0];
                    
                    // Parse and format to DD/MM/YYYY
                    const [year, month, day] = dateOnly.split('-');
                    return `${day}/${month}/${year}`;
                } catch (e) {
                    return dateString; // Return original if error
                }
            },
            
            // ---------- Normalize time value coming from Sheet/frontend ----------
            // Accepts "HH:MM", "HH.MM", numbers (Excel serial or HHMM like 930 or 1887.07).
            // Returns string "HH:MM" or '' when not possible.
            normalizeTime: function(value) {
                if (value === null || value === undefined || value === '') return '';
        
                // If already "HH:MM" string
                if (typeof value === 'string') {
                    const s = value.replace(/^'/, '').trim();
                    if (/^\d{1,2}:\d{2}$/.test(s)) return s;
                    if (/^\d{1,2}\.\d{2}$/.test(s)) return s.replace('.', ':');
                    if (/^\d{3,4}$/.test(s)) {
                        const n = s.padStart(4, '0');
                        return n.slice(0,2) + ':' + n.slice(2);
                    }
                    // If string like "18.5" -> interpret as hours.decimal
                    if (/^\d{1,2}(\.\d+)?$/.test(s)) {
                        const num = parseFloat(s);
                        if (!isNaN(num)) {
                            const hh = Math.floor(num);
                            const mm = Math.round((num - hh) * 60);
                            return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
                        }
                    }
                    return s;
                }
        
                // If number
                if (typeof value === 'number' && !isNaN(value)) {
                    // Case A: Excel time fraction 0 < value < 1
                    if (value > 0 && value < 1) {
                        const totalMinutes = Math.round(value * 24 * 60);
                        const hh = Math.floor(totalMinutes / 60);
                        const mm = totalMinutes % 60;
                        return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
                    }
        
                    // Case B: number like 18.5 -> hours.fraction
                    if (value >= 0 && value < 24 && Math.floor(value) !== value) {
                        const hh = Math.floor(value);
                        const mm = Math.round((value - hh) * 60);
                        return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
                    }
        
                    // Case C: number like 930 or 1887.07 -> treat as HHMM.frac
                    // Split integer and fractional parts
                    const intPart = Math.floor(value);
                    const fracPart = Math.abs(value - intPart);
        
                    // hours/minutes from intPart (HHMM)
                    const hhFromInt = Math.floor(intPart / 100);
                    let mmFromInt = intPart % 100;
        
                    // fractional part: interpret as "xx.yy" -> yy as extra minutes (approx)
                    const fracAsMinutes = Math.round(fracPart * 100);
        
                    // total minutes then normalize (handles mm >= 60)
                    let totalMinutes = hhFromInt * 60 + mmFromInt + fracAsMinutes;
        
                    // If intPart is small (<= 24) and seems like plain hour, handle as hh:00
                    if (intPart >= 0 && intPart <= 24 && intPart.toString().length <= 2) {
                        totalMinutes = intPart * 60 + Math.round(fracPart * 60);
                    }
        
                    // If intPart looks like obvious HHMM (>=100), we already converted
                    const finalH = Math.floor(totalMinutes / 60) % 24;
                    const finalM = totalMinutes % 60;
        
                    return String(finalH).padStart(2,'0') + ':' + String(finalM).padStart(2,'0');
                }
        
                // Fallback
                return String(value);
            },


    // ---------- Format tarikh Melayu (SIMPLE - no timezone issues) ----------
        formatMalayDate: function(dateInput) {
            if (!dateInput) return '';
            try {
                // Extract date string only (remove time if exists)
                const dateStr = String(dateInput).split('T')[0];
                
                // Split YYYY-MM-DD
                const parts = dateStr.split('-');
                if (parts.length !== 3) return '';
                
                const year = parts[0];
                const monthNum = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                
                const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 
                               'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
                
                const monthName = months[monthNum - 1] || '';
                
                return `${day} ${monthName} ${year}`;
            } catch (e) {
                return '';
            }
        },
        
        formatMalayDay: function(dateInput) {
            if (!dateInput) return '';
            try {
                // Extract date string only
                const dateStr = String(dateInput).split('T')[0];
                
                // Split YYYY-MM-DD
                const parts = dateStr.split('-');
                if (parts.length !== 3) return '';
                
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
                const day = parseInt(parts[2], 10);
                
                // Only use Date object for day calculation (but force local)
                const d = new Date(year, month, day);
                
                const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
                return days[d.getDay()];
            } catch (e) {
                return '';
            }
        },
    
       // ---------- Format masa untuk display (12-jam, Melayu) ----------
    // Input boleh: "HH:MM", "HH.MM", "930", 18.5, 0.75 (Excel fraction), 1887.07, Date object
    // Output contoh: "7.00 Malam", "2.30 Petang", "12.00 Tengah Hari"
    formatMalayTime: function(timeInput) {
        if (timeInput === null || timeInput === undefined || timeInput === '') return '';

        try {
            let hh = null;
            let mm = 0;

            // If Date object
            if (timeInput instanceof Date) {
                hh = timeInput.getHours();
                mm = timeInput.getMinutes();
            } else if (typeof timeInput === 'string') {
                const s = timeInput.trim();

                // Common "HH:MM"
                if (/^\d{1,2}:\d{1,2}$/.test(s)) {
                    const parts = s.split(':');
                    hh = parseInt(parts[0], 10);
                    mm = parseInt(parts[1], 10);
                }
                // "HH.MM" (tukar titik kepada ':')
                else if (/^\d{1,2}\.\d{1,2}$/.test(s)) {
                    const parts = s.split('.');
                    hh = parseInt(parts[0], 10);
                    mm = parseInt(parts[1], 10);
                }
                // Plain digits "930" or "0930" -> HHMM
                else if (/^\d{1,4}$/.test(s)) {
                    const padded = s.padStart(4, '0');
                    hh = parseInt(padded.slice(0,2), 10);
                    mm = parseInt(padded.slice(2), 10);
                }
                // Decimal hours "18.5" or "7.25"
                else if (/^\d+(\.\d+)?$/.test(s)) {
                    const num = parseFloat(s);
                    hh = Math.floor(num);
                    mm = Math.round((num - hh) * 60);
                } else {
                    // fallback: try Date parser
                    const d = new Date(s);
                    if (!isNaN(d.getTime())) {
                        hh = d.getHours();
                        mm = d.getMinutes();
                    } else {
                        return String(s);
                    }
                }
            } else if (typeof timeInput === 'number' && !isNaN(timeInput)) {
                const v = timeInput;
                // Excel fraction between 0 and 1
                if (v > 0 && v < 1) {
                    const totalMinutes = Math.round(v * 24 * 60);
                    hh = Math.floor(totalMinutes / 60) % 24;
                    mm = totalMinutes % 60;
                }
                // decimal hours like 18.5
                else if (v >= 0 && v < 24 && v !== Math.floor(v)) {
                    hh = Math.floor(v);
                    mm = Math.round((v - hh) * 60);
                }
                // treat as HHMM or HHMM.frac (e.g. 930 or 1887.07)
                else {
                    const intPart = Math.floor(Math.abs(v));
                    const fracPart = Math.abs(v) - intPart;
                    hh = Math.floor(intPart / 100);
                    mm = intPart % 100;
                    // fractional tail like .07 -> treat as extra minutes (7)
                    const fracAsMinutes = Math.round(fracPart * 100);
                    mm = mm + fracAsMinutes;
                }
            } else {
                return '';
            }

            // Normalise minutes overflowing 60
            if (mm >= 60) {
                hh = hh + Math.floor(mm / 60);
                mm = mm % 60;
            }
            hh = ((hh % 24) + 24) % 24; // normalise hour into 0-23

            // Determine Malay period (12-hour labels)
            let period = '';
                if (hh === 0) {
                    period = 'Tengah Malam';
                } else if (hh < 12) {
                    period = 'Pagi';
                } else if (hh === 12) {
                    period = 'Tengah Hari';
                } else {
                    // hh > 12 (13-23)
                    period = 'Petang';
                }

            // Convert to 12-hour display hour
            let displayHour = hh % 12;
            if (displayHour === 0) displayHour = 12;

            // Use dot notation for minutes (e.g. 7.00)
            const minuteStr = String(mm).padStart(2, '0');
            return `${displayHour}.${minuteStr} ${period}`;
        } catch (e) {
            return '';
        }
    },

    
        formatMalayDateTime: function(dateTimeInput) {
        if (!dateTimeInput) return '';
        try {
            // Pass raw string directly to avoid Date object timezone conversion
            const datePart = this.formatMalayDate(dateTimeInput);
            const timePart = this.formatMalayTime(dateTimeInput);
            
            if (!datePart && !timePart) return '';
            if (!timePart) return datePart;
            if (!datePart) return timePart;
            
            return datePart + ', ' + timePart;
        } catch (e) {
            return '';
        }
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







