// tp.js
// --------------------------------------------------
// Dashboard Timbalan Pengarah (Kelulusan + Generate Surat)
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

                <div class="mb-3">
                    <button id="tp-refresh" class="px-3 py-1 border rounded">Refresh</button>
                    <button id="tp-approve" class="ml-2 px-3 py-1 bg-green-600 text-white rounded">Luluskan</button>
                    <button id="tp-generate" class="ml-2 px-3 py-1 bg-purple-600 text-white rounded">Generate Surat</button>
                </div>

                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="text-left border-b">
                            <th class="py-2">Pilih</th>
                            <th>ReqID</th>
                            <th>Sekolah</th>
                            <th>Tarikh MAT</th>
                            <th>Status</th>
                            <th>Dokumen</th>
                        </tr>
                    </thead>
                    <tbody id="tp-list"></tbody>
                </table>
            </div>
        `;

        document.getElementById("tp-refresh").onclick = () => this.loadList();
        document.getElementById("tp-logout").onclick = () => AuthUI.logout();
        document.getElementById("tp-approve").onclick = () => this.approveSelected();
        document.getElementById("tp-generate").onclick = () => this.generateSelected();

        this.loadList();
    },

    loadList: async function () {
        Util.toast("Memuat senarai kelulusan...", "info");

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

    // -------------------------------------------------------
    // PAPAR TABLE
    // -------------------------------------------------------
    renderList: function (data) {
        const out = document.getElementById("tp-list");

        if (!data || !data.length) {
            out.innerHTML = `
                <tr><td colspan="6" class="py-3 text-gray-600">Tiada permohonan untuk TP.</td></tr>
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
                <tr class="border-b">
                    <td class="py-2">
                        <input type="checkbox" class="tp-check" value="${req}">
                    </td>
                    <td class="py-2 font-mono">${req}</td>
                    <td class="py-2">${sekolah}</td>
                    <td class="py-2">${tarikh}</td>
                    <td class="py-2">${status}</td>
                    <td class="py-2">
                        <a href="${surat}" class="text-blue-600 underline" target="_blank">Surat</a> |
                        <a href="${minit}" class="text-blue-600 underline" target="_blank">Minit</a> |
                        <a href="${kertas}" class="text-blue-600 underline" target="_blank">Kertas</a>
                    </td>
                </tr>
            `;
        });

        out.innerHTML = html;
    },

    // -------------------------------------------------------
    // TP — LULUS PERMOHONAN
    // -------------------------------------------------------
    approveSelected: async function () {
        const ids = [...document.querySelectorAll(".tp-check:checked")].map(i => i.value);
        if (!ids.length) return Util.toast("Tiada permohonan dipilih.", "error");

        if (!confirm("Sahkan lulus permohonan terpilih?")) return;

        const token = Util.getToken();
        const res = await Util.postJSON({
            type: "approve",
            authToken: token,
            payload: { reqIds: ids }
        });

        if (!res.ok) return Util.toast(res.message, "error");

        Util.toast("Permohonan diluluskan!", "success");
        this.loadList();
    },

    // -------------------------------------------------------
    // TP — JANA SURAT KELULUSAN
    // -------------------------------------------------------
    generateSelected: async function () {
        const ids = [...document.querySelectorAll(".tp-check:checked")].map(i => i.value);
        if (!ids.length) return Util.toast("Tiada permohonan dipilih.", "error");

        const templateId = prompt("Masukkan Template ID Google Docs (Surat Kelulusan):");
        if (!templateId) return Util.toast("Template ID diperlukan.", "error");

        Util.toast("Menjana surat...", "info");

        const token = Util.getToken();
        const res = await Util.postJSON({
            type: "generateLetters",
            authToken: token,
            payload: { reqIds: ids, templateId }
        });

        if (!res.ok) return Util.toast(res.message, "error");

        Util.toast("Surat berjaya dijana!", "success");

        this.loadList();
    }

};

// Auto init
document.addEventListener("DOMContentLoaded", () => TPUI.init());
