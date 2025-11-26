// tp.js
// --------------------------------------------------
// Dashboard Timbalan Pengarah (Kelulusan + Generate Surat + Config)
// --------------------------------------------------

const TPUI = {

    init: function () {
        const role = Util.getRole();
        if (role === "tp") {
            document.getElementById("tp-login").classList.add("hidden");
            document.getElementById("tp-dashboard").classList.remove("hidden");
            this.loadDashboard();
        }
    },

    loadDashboard: function () {
        const el = document.getElementById("tp-dashboard");

        el.innerHTML = `
            <div class="bg-white p-4 rounded shadow-sm">
                
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold">Dashboard TP</h3>
                    <button id="tp-logout" class="px-3 py-1 bg-red-600 text-white rounded">Logout</button>
                </div>

                <!-- CONFIG PANEL -->
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold mb-3 flex items-center">
                        <i class="fas fa-cog mr-2"></i>
                        Tetapan Sistem
                    </h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Tarikh Mula Persekolahan</label>
                            <input id="tp-school-start" type="date" class="border rounded px-3 py-2 w-full">
                            <p class="text-xs text-gray-600 mt-1">Permohonan MAT mesti dalam 90 hari dari tarikh ini</p>
                        </div>
                        <div class="flex items-end">
                            <button id="tp-save-config" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-save mr-1"></i>
                                Simpan Tetapan
                            </button>
                        </div>
                    </div>
                    <div id="tp-config-status" class="mt-2 text-sm"></div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="mb-3">
                    <button id="tp-refresh" class="px-3 py-1 border rounded hover:bg-gray-100">
                        <i class="fas fa-sync mr-1"></i>
                        Refresh
                    </button>
                    <button id="tp-approve" class="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        <i class="fas fa-check mr-1"></i>
                        Luluskan
                    </button>
                    <button id="tp-generate" class="ml-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                        <i class="fas fa-file-pdf mr-1"></i>
                        Generate Surat
                    </button>
                </div>

                <!-- TABLE -->
                <div class="overflow-x-auto">
                    <table class="w-full text-sm border-collapse">
                        <thead>
                            <tr class="text-left border-b bg-gray-50">
                                <th class="py-2 px-2">Pilih</th>
                                <th class="py-2 px-2">ReqID</th>
                                <th class="py-2 px-2">Sekolah</th>
                                <th class="py-2 px-2">Tarikh MAT</th>
                                <th class="py-2 px-2">Status</th>
                                <th class="py-2 px-2">Dokumen</th>
                            </tr>
                        </thead>
                        <tbody id="tp-list"></tbody>
                    </table>
                </div>
            </div>
        `;

        // Event handlers
        document.getElementById("tp-refresh").onclick = () => this.loadList();
        document.getElementById("tp-logout").onclick = () => AuthUI.logout();
        document.getElementById("tp-approve").onclick = () => this.approveSelected();
        document.getElementById("tp-generate").onclick = () => this.generateSelected();
        document.getElementById("tp-save-config").onclick = () => this.saveConfig();
        
        // Load data
        this.loadConfig();
        this.loadList();
    },

    loadConfig: async function() {
        const token = Util.getToken();
        if (!token) return;
        
        try {
            const res = await Util.postJSON({
                type: 'getConfig',
                payload: { key: 'SCHOOL_START_DATE' }
            });
            
            if (res.ok && res.value) {
                document.getElementById('tp-school-start').value = res.value;
                document.getElementById('tp-config-status').innerHTML = 
                    '<span class="text-green-600"><i class="fas fa-check-circle"></i> Tarikh semasa: ' + res.value + '</span>';
            } else {
                document.getElementById('tp-config-status').innerHTML = 
                    '<span class="text-gray-600"><i class="fas fa-info-circle"></i> Tiada tarikh ditetapkan</span>';
            }
        } catch (err) {
            console.error('Failed to load config:', err);
        }
    },

    saveConfig: async function() {
        const token = Util.getToken();
        if (!token) return Util.toast('Sila log masuk.', 'error');
        
        const startDate = document.getElementById('tp-school-start').value;
        
        if (!startDate) {
            return Util.toast('Sila pilih tarikh mula persekolahan.', 'error');
        }
        
        Util.toast('Menyimpan tetapan...', 'info', 1500);
        
        const res = await Util.postJSON({
            type: 'setConfig',
            authToken: token,
            payload: {
                key: 'SCHOOL_START_DATE',
                value: startDate
            }
        });
        
        if (!res.ok) {
            return Util.toast(res.message || 'Gagal simpan tetapan', 'error');
        }
        
        Util.toast('✓ Tetapan berjaya disimpan!', 'success');
        
        document.getElementById('tp-config-status').innerHTML = 
            '<span class="text-green-600"><i class="fas fa-check-circle"></i> Tarikh semasa: ' + startDate + '</span>';
    },

    loadList: async function () {
        Util.toast("Memuat senarai kelulusan...", "info", 1000);

        const token = Util.getToken();
        const res = await Util.postJSON({
            type: "list",
            authToken: token,
            payload: { status: "UntukTP" }
        });

        if (!res.ok) {
            Util.toast(res.message, "error");
            return;
        }

        this.renderList(res.data);
    },

    renderList: function (data) {
        const out = document.getElementById("tp-list");

        if (!data || !data.length) {
            out.innerHTML = `
                <tr><td colspan="6" class="py-3 text-gray-600 text-center">Tiada permohonan untuk TP.</td></tr>
            `;
            return;
        }

        let html = "";

        data.forEach(r => {
            const req = r["ReqID"];
            const sekolah = r["NamaSekolah"];
            const tarikh = r["TarikhMAT"];
            const status = r["Status"];

            const surat = r["FileSuratPermohonan"];
            const minit = r["FileMinitMesyJK"];
            const kertas = r["FileKertasCadangan"];

            html += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-2">
                        <input type="checkbox" class="tp-check" value="${req}">
                    </td>
                    <td class="py-2 px-2 font-mono text-xs">${req}</td>
                    <td class="py-2 px-2">${sekolah}</td>
                    <td class="py-2 px-2">${tarikh}</td>
                    <td class="py-2 px-2">
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">${status}</span>
                    </td>
                    <td class="py-2 px-2">
                        <a href="${surat}" class="text-blue-600 underline text-xs" target="_blank">Surat</a> |
                        <a href="${minit}" class="text-blue-600 underline text-xs" target="_blank">Minit</a> |
                        <a href="${kertas}" class="text-blue-600 underline text-xs" target="_blank">Kertas</a>
                    </td>
                </tr>
            `;
        });

        out.innerHTML = html;
    },

    approveSelected: async function () {
        const ids = [...document.querySelectorAll(".tp-check:checked")].map(i => i.value);
        if (!ids.length) return Util.toast("Tiada permohonan dipilih.", "error");

        if (!confirm("Sahkan lulus " + ids.length + " permohonan terpilih?")) return;

        const token = Util.getToken();
        const res = await Util.postJSON({
            type: "approve",
            authToken: token,
            payload: { reqIds: ids, action: "lulus" }
        });

        if (!res.ok) return Util.toast(res.message, "error");

        Util.toast("✓ Permohonan diluluskan!", "success");
        this.loadList();
    },

    generateSelected: async function () {
        const ids = [...document.querySelectorAll(".tp-check:checked")].map(i => i.value);
        if (!ids.length) return Util.toast("Tiada permohonan dipilih.", "error");

        if (!confirm("Jana surat kelulusan untuk " + ids.length + " permohonan?")) return;

        Util.toast("Menjana surat...", "info", 3000);

        const token = Util.getToken();
        const res = await Util.postJSON({
            type: "generateLetters",
            authToken: token,
            payload: { reqIds: ids }
        });

        if (!res.ok) return Util.toast(res.message, "error");

        Util.toast("✓ Surat berjaya dijana!", "success");

        // Show results
        let resultHtml = '<div class="mt-3 p-3 bg-green-50 rounded"><h5 class="font-semibold mb-2">Surat Dijana:</h5><ul class="text-sm">';
        res.letters.forEach(l => {
            resultHtml += `<li class="mb-1">• ${l.reqId}: <a href="${l.letterUrl}" target="_blank" class="text-blue-600 underline">Lihat Surat</a></li>`;
        });
        resultHtml += '</ul></div>';

        const container = document.getElementById("tp-dashboard");
        container.insertAdjacentHTML('beforeend', resultHtml);

        this.loadList();
    }

};

// Auto init
document.addEventListener("DOMContentLoaded", () => TPUI.init());
