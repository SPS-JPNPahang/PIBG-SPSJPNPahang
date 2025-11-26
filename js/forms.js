// forms.js - PIBG @ SPS (UPDATED WITH DATE RESTRICTIONS & AUTO-FILL)
// --------------------------------------------------

const FormUI = {

    schoolStartDate: null, // Will be loaded from config

    init: function () {
        this.renderForm();
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
                            <input id="f-tarikhmat" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500">
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

    setupDateRestrictions: function() {
        const tarikhMatInput = document.getElementById('f-tarikhmat');
        
        // Set min date: 30 days from today
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 30);
        
        // Set max date: 120 days from today (buffer untuk 90 hari rule)
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 120);
        
        tarikhMatInput.min = this.formatDateForInput(minDate);
        tarikhMatInput.max = this.formatDateForInput(maxDate);
        
        // Validate on change
        tarikhMatInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay();
            
            // Check if weekend
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                Util.toast('Tarikh MAT mesti pada hari tidak bekerja (Sabtu/Ahad)', 'error');
                e.target.value = '';
                return;
            }
            
            // Check if Saturday minggu genap
            if (dayOfWeek === 6) {
                const date = selectedDate.getDate();
                const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
                const weekNumber = Math.ceil((date + firstDayOfMonth) / 7);
                
                if (![2, 4].includes(weekNumber)) {
                    Util.toast('Sabtu mesti minggu ke-2 atau ke-4 sahaja', 'error');
                    e.target.value = '';
                    return;
                }
            }
            
            Util.toast('Tarikh MAT sah ✓', 'success', 2000);
        });
    },

    formatDateForInput: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    submitForm: async function () {
        // Get all values
        const kod = document.getElementById("f-kod").value.trim();
        const email = document.getElementById("f-email").value.trim();
        const namaSekolah = document.getElementById("f-nama-sekolah").value.trim();
        const kategori = document.getElementById("f-kategori").value.trim();
        const daerah = document.getElementById("f-daerah").value.trim();
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
        if (!kod || !email || !namaSekolah || !rujukan || !tarikhSurat || !tarikhMAT || 
            !masaMAT || !tempatMAT || !perasmi || !jawatan || !penghubung || !telefon) {
            return Util.toast("Sila lengkapkan semua ruangan bertanda *", "error");
        }

        if (!fSurat || !fMinit || !fKertas) {
            return Util.toast("Semua 3 dokumen PDF wajib dimuat naik.", "error");
        }

        Util.toast("Memproses permohonan...", "info", 2000);

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

        if (!res.ok) {
            return Util.toast(res.message || "Gagal hantar permohonan.", "error", 5000);
        }

        Util.toast("Permohonan berjaya dihantar!", "success");

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
    }
};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => FormUI.init());
