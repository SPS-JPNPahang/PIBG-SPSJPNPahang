// forms.js - PIBG @ SPS (COMPLETE & FINAL)
// --------------------------------------------------

const FormUI = {

    schoolStartDate: null,

    init: function () {
        this.renderForm();
        this.populateYearDropdown();
        this.setupSchoolLookup();
        this.setupDateRestrictions();
        this.loadSystemConfig();
        this.setTarikhPermohonan();
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

    setTarikhPermohonan: function() {
        const today = new Date();
        const todayStr = today.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const el = document.getElementById('f-tarikhpermohonan');
        if (el) el.value = todayStr;
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
                            <label class="block text-sm font-medium mb-1">Poskod</label>
                            <input id="f-poskod" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                                   placeholder="Cth: 24500">
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
                            <label class="block text-sm font-medium mb-1">Tarikh Permohonan</label>
                            <input id="f-tarikhpermohonan" type="text" readonly class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-semibold" value="">
                            <p class="text-xs text-gray-600 mt-1">📅 Tarikh permohonan (automatik)</p>
                        </div>
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
                        <div>
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
    const kod = document.getElementById("f-kod").value.trim();
    const email = document.getElementById("f-email").value.trim();
    const namaSekolah = document.getElementById("f-nama-sekolah").value.trim();
    const kategori = document.getElementById("f-kategori").value.trim();
    const daerah = document.getElementById("f-daerah").value.trim();
    const poskod = (document.getElementById("f-poskod") ? document.getElementById("f-poskod").value.trim() : '');
    const tahun = document.getElementById("f-tahun").value.trim();
    const rujukan = document.getElementById("f-rujukan").value.trim();
    const tarikhSurat = document.getElementById("f-tarikhsurat").value;
    const tarikhPermohonan = new Date().toISOString().split('T')[0];
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

    if (!kod || !email || !namaSekolah || !tahun || !rujukan || !tarikhSurat || !tarikhMAT || !masaMAT || !tempatMAT || !perasmi || !jawatan || !penghubung || !telefon) {
    return notify.error("Sila lengkapkan semua ruangan yang bertanda bintang (*)");
    }
    if (!fSurat || !fMinit || !fKertas) {
        rreturn notify.error("Ketiga-tiga dokumen PDF (Surat, Minit, Kertas Cadangan) mesti dimuat naik");
    }

    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) loadingEl.style.display = 'flex';
    notify.loading("Sedang menghantar permohonan ke pelayan...");

    try {
        // ambil base64 object dengan Util.fileToBase64 (yang return {name,type,data})
        const suratObj = await Util.fileToBase64(fSurat);
        const minitObj = await Util.fileToBase64(fMinit);
        const kertasObj = await Util.fileToBase64(fKertas);

        // normalisasi: ambil pure base64 string tanpa prefix/whitespace
        const normalizeBase64 = (x) => {
            if (!x) return '';
            if (typeof x === 'string') return x.replace(/^data:.*;base64,/, '').replace(/\s+/g, '');
            if (typeof x === 'object' && x.data) return String(x.data).replace(/\s+/g, '');
            return '';
        };

        const bSurat = normalizeBase64(suratObj);
        const bMinit = normalizeBase64(minitObj);
        const bKertas = normalizeBase64(kertasObj);

        const namaSurat = (suratObj && suratObj.name) ? suratObj.name : 'SuratPermohonan.pdf';
        const namaMinit = (minitObj && minitObj.name) ? minitObj.name : 'MinitMesyuaratJK.pdf';
        const namaKertas = (kertasObj && kertasObj.name) ? kertasObj.name : 'KertasCadangan.pdf';

        // debug logs
        console.log('UPLOAD DEBUG lengths:', {
            surat_len: bSurat.length,
            minit_len: bMinit.length,
            kertas_len: bKertas.length
        });
        console.log('UPLOAD DEBUG prefixes:', {
            surat_pref: bSurat.substring(0,40),
            minit_pref: bMinit.substring(0,40),
            kertas_pref: bKertas.substring(0,40)
        });

        const res = await Util.postJSON({
            type: "new",
            payload: {
                schoolCode: kod, 
                schoolName: namaSekolah, 
                kategori: kategori, 
                daerah: daerah,
                poskod: poskod,
                tahun: tahun, 
                schoolEmail: email, 
                rujukanSurat: rujukan, 
                tarikhRujukanSurat: tarikhSurat, 
                tarikhPermohonan: tarikhPermohonan, 
                tarikhMAT: tarikhMAT, 
                masaMAT: masaMAT, 
                tempatMAT: tempatMAT, 
                namaPerasmi: perasmi, 
                jawatanPerasmi: jawatan, 
                namaPenghubung: penghubung, 
                noTelefon: telefon
            },
            filesBase64: {
                suratRasmi: { name: namaSurat, data: bSurat },
                minitMesyuarat: { name: namaMinit, data: bMinit },
                kertasCadangan: { name: namaKertas, data: bKertas }
            }
        });

        if (loadingEl) loadingEl.style.display = 'none';
        notify.dismissLoading();
        if (!res.ok) return notify.error(res.message || "Permohonan gagal dihantar. Sila cuba lagi.");

        notify.successWithRef(kod, res.reqId);

        document.getElementById("form-result").innerHTML = `
            <div class="p-6 bg-green-50 border-2 border-green-400 rounded-lg shadow-lg mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #34d399); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-check text-white text-3xl"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-xl text-green-800">Permohonan Berjaya Dihantar!</h4>
                        <p class="text-sm text-green-700">Permohonan anda telah diterima untuk semakan</p>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-lg border-2 border-green-200 mb-4">
                    <div class="grid gap-3">
                        <div class="flex justify-between items-center py-2 border-b">
                            <span class="font-semibold text-gray-700">ID Permohonan:</span>
                            <span class="font-mono font-bold text-2xl text-blue-600">${res.reqId}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b">
                            <span class="font-semibold text-gray-700">Kod Sekolah:</span>
                            <span class="font-mono font-bold text-lg text-gray-800">${kod}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="font-semibold text-gray-700">Status:</span>
                            <span class="px-4 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">BARU - Menunggu Semakan</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                    <h5 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <i class="fas fa-info-circle"></i>
                        Langkah Seterusnya
                    </h5>
                    <ul class="text-sm text-blue-800 space-y-2 ml-6">
                        <li class="flex items-start gap-2">
                            <span class="font-bold">1.</span>
                            <span>Simpan <strong>ID Permohonan</strong> dan <strong>Kod Sekolah</strong> untuk rujukan</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="font-bold">2.</span>
                            <span>Emel pengesahan akan dihantar ke <strong>${email}</strong></span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="font-bold">3.</span>
                            <span>Anda boleh semak status permohonan menggunakan tab <strong>"Semakan"</strong></span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="font-bold">4.</span>
                            <span>Permohonan akan disemak dalam tempoh <strong>3-5 hari bekerja</strong></span>
                        </li>
                    </ul>
                </div>
                
                <div class="flex gap-3 justify-center">
                    <button onclick="window.location.reload()" class="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2">
                        <i class="fas fa-plus-circle"></i>
                        Permohonan Baru
                    </button>
                    <button onclick="document.querySelector('[data-tab=semak]').click()" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                        <i class="fas fa-search"></i>
                        Semak Status
                    </button>
                </div>
            </div>
        `;

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
        document.getElementById("f-poskod").value = '';

        window.scrollTo({top: 0, behavior: 'smooth'});
        
    } catch (error) {
    if (loadingEl) loadingEl.style.display = 'none';
    notify.dismissLoading();
    notify.error("Ralat berlaku: " + (error && error.message ? error.message : String(error)));
    }
}

};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => FormUI.init());



