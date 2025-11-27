// tp.js
// --------------------------------------------------
// Dashboard Timbalan Pengarah (Kelulusan + Generate Surat + Config)
// --------------------------------------------------

const TPUI = {

    init: function () {
        //const role = Util.getRole();
        //if (role === "tp") {
        //    document.getElementById("tp-login").classList.add("hidden");
        //    document.getElementById("tp-dashboard").classList.remove("hidden");
        //    this.loadDashboard();
        //}
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
                   <button id="tp-select-all" class="ml-2 px-3 py-1 border rounded hover:bg-gray-100">
                        <i class="fas fa-check-square mr-1"></i>
                        Pilih Semua
                    </button>
                    <button id="tp-approve" class="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        <i class="fas fa-check mr-1"></i>
                        Luluskan Terpilih
                    </button>
                    <button id="tp-generate" class="ml-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                        <i class="fas fa-file-pdf mr-1"></i>
                        Jana Surat Terpilih
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
        document.getElementById('tp-refresh').onclick = () => this.loadList();
        document.getElementById('tp-logout').onclick = () => AuthUI.logout();
        document.getElementById('tp-select-all').onclick = () => this.selectAll();
        document.getElementById('tp-approve').onclick = () => this.approveSelected();
        document.getElementById('tp-generate').onclick = () => this.generateSelected();
        document.getElementById('tp-save-config').onclick = () => this.saveConfig();
        
        // Load data
        this.loadConfig();
        this.loadList();
    },

    selectAll: function () {
        const checkboxes = document.querySelectorAll('.tp-check');
        const allChecked = [...checkboxes].every(cb => cb.checked);
        
        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });
        
        const btn = document.getElementById('tp-select-all');
        if (allChecked) {
            btn.innerHTML = '<i class="fas fa-check-square mr-1"></i> Pilih Semua';
        } else {
            btn.innerHTML = '<i class="fas fa-square mr-1"></i> Nyahpilih Semua';
        }
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
        if (!ids.length) return notify.warning("Sila pilih sekurang-kurangnya satu permohonan.");

        notify.confirm(
            `Anda pasti untuk meluluskan ${ids.length} permohonan terpilih?`,
            async () => {
                notify.loading("Memproses kelulusan...");
                
                const token = Util.getToken();
                const res = await Util.postJSON({
                    type: "approve",
                    authToken: token,
                    payload: { reqIds: ids, action: "lulus" }
                });

                notify.dismissLoading();

                if (!res.ok) return notify.error(res.message || "Gagal meluluskan");

                notify.success(`${ids.length} permohonan berjaya diluluskan!`);
                this.loadList();
            }
        );
    },

    generateSelected: async function () {
        const ids = [...document.querySelectorAll(".tp-check:checked")].map(i => i.value);
        if (!ids.length) return notify.warning("Sila pilih sekurang-kurangnya satu permohonan.");

        notify.confirm(
            `Jana surat kelulusan untuk ${ids.length} permohonan terpilih?`,
            async () => {
                notify.loading("Menjana surat kelulusan...");

                const token = Util.getToken();
                const res = await Util.postJSON({
                    type: "generateLetters",
                    authToken: token,
                    payload: { reqIds: ids }
                });

                notify.dismissLoading();

                if (!res.ok) return notify.error(res.message || "Gagal jana surat");

                notify.success(`${ids.length} surat kelulusan berjaya dijana!`);

                // Show results in modal
                this.showGeneratedLetters(res.letters);
                this.loadList();
            }
        );
    },

    showGeneratedLetters: function (letters) {
        let html = '<ul class="space-y-2">';
        letters.forEach(l => {
            html += `
                <li class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span class="font-mono text-xs">${l.reqId}</span>
                    <a href="${l.letterUrl}" target="_blank" class="text-blue-600 hover:underline text-sm">
                        <i class="fas fa-file-pdf"></i> Lihat Surat
                    </a>
                </li>
            `;
        });
        html += '</ul>';

        const modalHTML = `
            <div id="letters-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                    <div class="flex justify-between items-center mb-4 pb-3 border-b">
                        <h3 class="text-lg font-semibold">
                            <i class="fas fa-check-circle text-green-600"></i>
                            Surat Kelulusan Dijana
                        </h3>
                        <button id="close-letters" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-3">
                            ${letters.length} surat kelulusan telah berjaya dijana. Klik pada pautan untuk melihat surat.
                        </p>
                        ${html}
                    </div>
                    <div class="pt-3 border-t text-right">
                        <button id="close-letters-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('close-letters').onclick = () => {
            document.getElementById('letters-modal').remove();
        };
        document.getElementById('close-letters-btn').onclick = () => {
            document.getElementById('letters-modal').remove();
        };
    }

};

// Auto init
document.addEventListener("DOMContentLoaded", () => TPUI.init());


