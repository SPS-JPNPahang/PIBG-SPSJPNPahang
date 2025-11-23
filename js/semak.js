// semak.js
// --------------------------------------------------
// Modul semakan awam untuk sekolah (berdasarkan ReqID)
// --------------------------------------------------

const SemakUI = {

  init: function () {
    this.render();
  },

  render: function () {
    const el = document.getElementById("semak-container");
    el.innerHTML = `
      <div class="bg-white p-4 rounded shadow-sm max-w-xl">
        <h3 class="font-semibold mb-2">Semakan Permohonan</h3>
        <p class="text-sm text-gray-600 mb-3">Masukkan ID permohonan yang anda terima melalui emel.</p>

        <div class="flex gap-2">
          <input id="s-reqid" placeholder="Contoh: REQ-20250101123045" class="flex-1 border rounded px-3 py-2" />
          <button id="s-btn" class="bg-blue-600 text-white px-4 py-2 rounded">Semak</button>
        </div>

        <div id="s-result" class="mt-4 text-sm"></div>
      </div>
    `;

    document.getElementById("s-btn").onclick = () => this.check();
    document.getElementById("s-reqid").addEventListener("keypress", (ev) => {
      if (ev.key === 'Enter') this.check();
    });
  },

  check: async function () {
    const reqId = document.getElementById("s-reqid").value.trim();
    const out = document.getElementById("s-result");
    out.innerHTML = '';

    if (!reqId) return Util.toast("Sila masukkan ReqID.", "error");

    Util.toast("Mencari rekod...", "info");

    const res = await Util.postJSON({
      type: "getStatus",
      payload: { reqId }
    });

    if (!res || !res.ok) {
      Util.toast(res.message || "Rekod tidak ditemui.", "error");
      out.innerHTML = `<div class="p-3 bg-red-50 border border-red-200 rounded text-red-700">Rekod tidak dijumpai.</div>`;
      return;
    }

    const data = res.data;
    // data is object row from SheetService (keys = headers)
    // Render details
    const html = [];
    html.push(`<div class="p-3 bg-white border rounded shadow-sm">`);
    html.push(`<div class="font-semibold mb-2">Maklumat Permohonan</div>`);
    html.push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">`);
    const fields = [
      { k: "ReqID", l: "ID Permohonan" },
      { k: "TarikhPermohonan", l: "Tarikh Permohonan" },
      { k: "KodSekolah", l: "Kod Sekolah" },
      { k: "NamaSekolah", l: "Nama Sekolah" },
      { k: "Daerah", l: "Daerah" },
      { k: "TarikhMAT", l: "Tarikh MAT" },
      { k: "HariMAT", l: "Hari MAT" },
      { k: "MasaMAT", l: "Masa MAT" },
      { k: "TempatMAT", l: "Tempat MAT" },
      { k: "NamaPerasmi", l: "Nama Perasmi" },
      { k: "JawatanPerasmi", l: "Jawatan Perasmi" },
      { k: "Status", l: "Status" },
      { k: "EmelPemohon", l: "Emel Pemohon" }
    ];
    fields.forEach(f => {
      const val = data[f.k] === undefined || data[f.k] === null ? '' : (data[f.k].toString ? data[f.k].toString() : data[f.k]);
      html.push(`<div><span class="text-gray-600">${f.l}</span><div class="font-medium">${val}</div></div>`);
    });
    html.push(`</div>`);

    // Files
    html.push(`<div class="mt-3">`);
    html.push(`<div class="font-semibold mb-2">Dokumen</div>`);
    const files = [
      { key: "FileSuratPermohonan", label: "Surat Permohonan" },
      { key: "FileMinitMesyJK", label: "Minit Mesyuarat JK" },
      { key: "FileKertasCadangan", label: "Kertas Cadangan" },
      { key: "SuratKelulusan", label: "Surat Kelulusan (jika ada)" }
    ];

    files.forEach(f => {
      const v = data[f.key] || data[f.key.toLowerCase()] || '';
      if (v) {
        html.push(`<div class="mt-1"><a class="text-blue-600 underline" href="${v}" target="_blank" rel="noopener">${f.label} — Muat Turun / Lihat</a></div>`);
      } else {
        html.push(`<div class="mt-1 text-gray-500">${f.label} — Tiada</div>`);
      }
    });

    html.push(`</div>`); // end files
    html.push(`</div>`); // end container

    out.innerHTML = html.join('');
    Util.toast("Selesai.", "success");
  }

};

// auto init
document.addEventListener("DOMContentLoaded", () => SemakUI.init());
