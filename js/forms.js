// forms.js - PIBG @ SPS (UPDATED WITH DATE RESTRICTIONS & AUTO-FILL)
// --------------------------------------------------

const FormUI = {

    schoolStartDate: null, // Will be loaded from config

    init: function () {
        this.renderForm();
        this.populateYearDropdown();
        this.setupSchoolLookup();
        this.setupDateRestrictions();
        this.loadSystemConfig();
    },

    loadSystemConfig: async function() {
        try {
            const res = await Util.postJSON({
                type: 'getConfig',
                payload: { key: 'SCHOOL_START_DATE' }
            });
            
            if (res.ok && res.value) {
                this.schoolStartDate = res.value;
                console.log('School start date loaded:', this.schoolStartDate);
            }
        } catch (err) {
            console.error('Failed to load config:', err);
        }
    },

    renderForm: function () {
        document.getElementById("form-container").innerHTML = `
            <div class="space-y-6">

                <!-- Maklumat Sekolah -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3 flex items-center">
                        <i class="fas fa-school text-blue-600 mr-2"></i>
                        Maklumat Sekolah
                    </h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Kod Sekolah <span class="text-red-500">*</span></label>
                            <input id="f-kod" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                                   placeholder="Contoh: CBA0001" maxlength="7">
                            <p class="text-xs text-gray-600 mt-1">Masukkan kod sekolah anda</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Emel Sekolah <span class="text-red-500">*</span></label>
                            <input id="f-email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                                   placeholder="sekolah@moe.edu.my">
                        </div>
                        
                        <!-- Auto-filled fields -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Nama Sekolah</label>
                            <input id="f-nama-sekolah" readonly class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700" 
                                   placeholder="(Auto-fill)">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Kategori</label>
                            <input id="f-kategori" readonly class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700" 
                                   placeholder="(Auto-fill)">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Daerah</label>
                            <input id="f-daerah" readonly class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700" 
                                   placeholder="(Auto-fill)">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Tahun <span class="text-red-500">*</span></label>
                            <select id="f-tahun" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                                <option value="">-- Pilih Tahun --</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Maklumat Surat Permohonan -->
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3 flex items-center">
                        <i class="fas fa-envelope text-green-600 mr-2"></i>
                        Maklumat Surat Permohonan
                    </h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">No. Rujukan Surat <span class="text-red-500">*</span></label>
                            <input id="f-rujukan" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" 
                                   placeholder="Contoh: PIBG/001/2025">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Tarikh Surat <span class="text-red-500">*</span></label>
                            <input id="f-tarikhsurat" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                        </div>
                    </div>
                </div>

                <!-- Maklumat Permohonan MAT -->
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3 flex items-center">
                        <i class="fas fa-calendar-alt text-purple-600 mr-2"></i>
                        Maklumat Permohonan MAT
                    </h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Tarikh Cadangan MAT <span class="text-red-500">*</span></label>
                            <input id="f-tarikhmat" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder="Klik untuk pilih tarikh" readonly>
                            <p class="text-xs text-gray-600 mt-1">
                                ⚠️ Mesti 30 hari sebelum tarikh MAT<br>
                                ⚠️ Dalam 90 hari dari tarikh buka sekolah<br>
                                ⚠️ Hanya Sabtu (minggu genap) atau Ahad
                            </p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Masa MAT <span class="text-red-500">*</span></label>
                            <input id="f-masamat" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">Tempat MAT <span class="text-red-500">*</span></label>
                            <input id="f-tempatmat" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" 
                                   placeholder="Contoh: Dewan Sekolah">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Nama Perasmi <span class="text-red-500">*</span></label>
                            <input id="f-perasmi" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Jawatan Perasmi <span class="text-red-500">*</span></label>
                            <input id="f-jawatan" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" 
                                   placeholder="Contoh: Pengarah JPN Pahang">
                        </div>
                    </div>
                </div>

                <!-- Maklumat Penghubung -->
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3 flex items-center">
                        <i class="fas fa-user text-yellow-600 mr-2"></i>
                        Maklumat Penghubung
                    </h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Nama Penghubung <span class="text-red-500">*</span></label>
                            <input id="f-penghubung" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">No. Telefon <span class="text-red-500">*</span></label>
                            <input id="f-telefon" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500" 
                                   placeholder="Contoh: 012-3456789">
                        </div>
                    </div>
                </div>

                <!-- Dokumen Upload -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3 flex items-center">
                        <i class="fas fa-file-pdf text-red-600 mr-2"></i>
                        Muat Naik Dokumen (PDF sahaja) <span class="text-red-500">*</span>
                    </h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">1. Surat Permohonan</label>
                            <input id="f-surat" type="file" accept="application/pdf" class="w-full text-sm border border-gray-300 rounded-lg p-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">2. Minit Mesyuarat JK</label>
                            <input id="f-minit" type="file" accept="application/pdf" class="w-full text-sm border border-gray-300 rounded-lg p-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">3. Kertas Cadangan</label>
                            <input id="f-kertas" type="file" accept="application/pdf" class="w-full text-sm border border-gray-300 rounded-lg p-2">
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end">
                    <button id="btn-hantar" class="btn-primary px-8 py-3 rounded-lg font-semibold flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                        <i class="fas fa-paper-plane"></i>
                        Hantar Permohonan
                    </button>
                </div>

                <!-- Result -->
                <div id="form-result" class="mt-4"></div>
            </div>
        `;

        document.getElementById("btn-hantar").onclick = () => this.submitForm();
    },
    
    populateYearDropdown: function() {
        const yearSelect = document.getElementById('f-tahun');
        const currentYear = new Date().getFullYear();
        
        for (let i = 0; i < 5; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    },
    
    setupSchoolLookup: function() {
        const kodInput = document.getElementById('f-kod');
        
        kodInput.addEventListener('blur', async function() {
            const kod = this.value.trim().toUpperCase();
            
            if (!kod) return;
            
            // Clear previous data
            document.getElementById('f-nama-sekolah').value = '';
            document.getElementById('f-kategori').value = '';
            document.getElementById('f-daerah').value = '';
            
            Util.toast('Mencari maklumat sekolah...', 'info', 1000);
            
            try {
                const res = await Util.postJSON({
                    type: 'lookupSchool',
                    payload: { schoolCode: kod }
                });
                
                if (res.ok && res.data) {
                    document.getElementById('f-nama-sekolah').value = res.data.NamaSekolah || '';
                    document.getElementById('f-kategori').value = res.data.Kategori || '';
                    document.getElementById('f-daerah').value = res.data.Daerah || '';
                    Util.toast('Maklumat sekolah ditemui!', 'success');
                } else {
                    Util.toast('Kod sekolah tidak dijumpai dalam pangkalan data.', 'error');
                }
            } catch (err) {
                Util.toast('Gagal dapatkan maklumat sekolah.', 'error');
            }
        });
    },

    setupDateRestrictions: async function() {
        // Load school start date
        let schoolStartDate = null;
        try {
            const res = await Util.postJSON({
                type: 'getConfig',
                payload: { key: 'SCHOOL_START_DATE' }
            });
            
            if (res.ok && res.value) {
                schoolStartDate = new Date(res.value + 'T00:00:00');
            }
        } catch (err) {
            console.error('Config load error:', err);
        }
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 30);
        
        let maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 120);
        
        if (schoolStartDate && !isNaN(schoolStartDate.getTime())) {
            const max90 = new Date(schoolStartDate);
            max90.setDate(max90.getDate() + 90);
            maxDate = max90;
        }
        
        // Initialize Flatpickr
        flatpickr("#f-tarikhmat", {
            minDate: minDate,
            maxDate: maxDate,
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d M Y",
            locale: {
                months: {
                    shorthand: ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGO', 'SEP', 'OKT', 'NOV', 'DIS'],
                    longhand: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
                },
                weekdays: {
                    shorthand: ['AHD', 'ISN', 'SEL', 'RAB', 'KHA', 'JUM', 'SAB'],
                    longhand: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']
                }
            },
            
            disable: [
                function(date) {
                    const day = date.getDay();
                    if (day >= 1 && day <= 5) return true;
                    if (day === 6) {
                        const d = date.getDate();
                        const first = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
                        const week = Math.ceil((d + first) / 7);
                        if (![2, 4].includes(week)) return true;
                    }
                    return false;
                }
            ],
            
            onChange: function(selectedDates, dateStr) {
                if (selectedDates.length > 0) {
                    const day = selectedDates[0].getDay();
                    const nama = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'][day];
                    Util.toast('✓ ' + nama + ', ' + dateStr, 'success', 2000);
                }
            }
        });
    },

    submitForm: async function () {
        // Get all values
        const kod = document.getElementById("f-kod").value.trim();
        const email = document.getElementById("f-email").value.trim();
        const namaSekolah = document.getElementById("f-nama-sekolah").value.trim();
        const kategori = document.getElementById("f-kategori").value.trim();
        const daerah = document.getElementById("f-daerah").value.trim();
        const tahun = document.getElementById("f-tahun").value.trim();
        const rujukan = document.getElementById("f-rujukan").value.trim();
        const tarikhSurat = document.getElementById("f-tarikhsurat").value;
        const tarikhMAT = document.getElementById("f-tarikhmat").value;
        const masaMAT = document.getElementById("f-masamat").value;
        const tempatMAT = document.getElementById("f-tempatmat").value.trim();
        const perasmi = document.getElementById("f-perasmi").value.trim();
        const jawatan = document.getElementById("f-jawatan").value.trim();
        const penghubung = document.getElementById("f-penghubung").value.trim();
        const telefon = document.getElementById("f-telefon").value.trim();

        const fSurat = document.getElementById("f-surat").files[0];
        const fMinit = document.getElementById("f-minit").files[0];
        const fKertas = document.getElementById("f-kertas").files[0];

        // Validate
        if (!kod || !email || !namaSekolah || !tahun || !rujukan || !tarikhSurat || !tarikhMAT || 
            !masaMAT || !tempatMAT || !perasmi || !jawatan || !penghubung || !telefon) {
            return Util.toast("Sila lengkapkan semua ruangan bertanda *", "error");
        }

        if (!fSurat || !fMinit || !fKertas) {
            return Util.toast("Semua 3 dokumen PDF wajib dimuat naik.", "error");
        }

        // Show loading SEBELUM start process
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) loadingEl.style.display = 'flex';
        
        Util.toast("Memproses permohonan...", "info", 2000);

        try {
            // Convert files to base64
            const bSurat = await Util.fileToBase64(fSurat);
            const bMinit = await Util.fileToBase64(fMinit);
            const bKertas = await Util.fileToBase64(fKertas);

            // Build payload
            const body = {
                type: "new",
                payload: {
                    schoolCode: kod,
                    schoolName: namaSekolah,
                    kategori: kategori,
                    daerah: daerah,
                    tahun: tahun,
                    schoolEmail: email,
                    rujukanSurat: rujukan,
                    tarikhRujukanSurat: tarikhSurat,
                    tarikhMAT: tarikhMAT,
                    masaMAT: masaMAT,
                    tempatMAT: tempatMAT,
                    namaPerasmi: perasmi,
                    jawatanPerasmi: jawatan,
                    namaPenghubung: penghubung,
                    noTelefon: telefon
                },
                filesBase64: {
                    suratRasmi: bSurat,
                    minitMesyuarat: bMinit,
                    kertasCadangan: bKertas
                }
            };

            const res = await Util.postJSON(body);

            // Hide loading
            if (loadingEl) loadingEl.style.display = 'none';

            if (!res.ok) {
                return Util.toast(res.message || "Gagal hantar permohonan.", "error", 5000);
            }

            Util.toast("Permohonan berjaya dihantar!", "success");

            // Clear form
            document.getElementById("f-kod").value = '';
            document.getElementById("f-email").value = '';
            document.getElementById("f-nama-sekolah").value = '';
            document.getElementById("f-kategori").value = '';
            document.getElementById("f-daerah").value = '';
            document.getElementById("f-tahun").value = '';
            document.getElementById("f-rujukan").value = '';
            document.getElementById("f-tarikhsurat").value = '';
            document.getElementById("f-tarikhmat").value = '';
            document.getElementById("f-masamat").value = '';
            document.getElementById("f-tempatmat").value = '';
            document.getElementById("f-perasmi").value = '';
            document.getElementById("f-jawatan").value = '';
            document.getElementById("f-penghubung").value = '';
            document.getElementById("f-telefon").value = '';
            document.getElementById("f-surat").value = '';
            document.getElementById("f-minit").value = '';
            document.getElementById("f-kertas").value = '';

            // Show success message
            document.getElementById("form-result").innerHTML = `
                <div class="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div class="flex items-center gap-3 mb-3">
                        <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                        <div>
                            <h4 class="font-semibold text-lg text-green-800">Permohonan Diterima</h4>
                            <p class="text-sm text-green-700">Permohonan anda telah berjaya dihantar untuk semakan.</p>
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-lg">
                        <div class="text-sm">
                            <div class="flex justify-between py-2 border-b">
                                <span class="font-medium">ID Permohonan:</span>
                                <span class="font-mono font-bold text-blue-600">${res.reqId}</span>
                            </div>
                            <div class="py-2">
                                <p class="text-gray-600">Sila simpan ID Permohonan ini untuk semakan status.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            // Hide loading on error
            if (loadingEl) loadingEl.style.display = 'none';
            Util.toast("Error: " + error.message, "error", 5000);
        }
    }

};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => FormUI.init());
