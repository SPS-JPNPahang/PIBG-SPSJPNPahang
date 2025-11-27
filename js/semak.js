// semak.js
// --------------------------------------------------
// Modul semakan awam - Support School Code & Query Resubmit
// --------------------------------------------------

const SemakUI = {

  init: function () {
    this.render();
  },

  render: function () {
    const el = document.getElementById("semak-container");
    el.innerHTML = `
      <div class="bg-white p-4 rounded shadow-sm max-w-xl">
        <h3 class="font-semibold mb-2">Semakan & Kemaskini Permohonan</h3>
        <p class="text-sm text-gray-600 mb-3">Masukkan Kod Sekolah anda untuk semak status atau kemaskini permohonan Query.</p>

        <div class="mb-3">
          <label class="block text-sm font-medium mb-1">Kod Sekolah</label>
          <input id="s-schoolcode" placeholder="Contoh: AEA1234" class="border rounded px-3 py-2 w-full" />
          <p class="text-xs text-gray-500 mt-1">Masukkan kod sekolah 7 aksara (contoh: AEA1234)</p>
        </div>

        <button id="s-btn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          <i class="fas fa-search"></i> Semak Status
        </button>

        <div id="s-result" class="mt-4"></div>
      </div>
    `;

    document.getElementById("s-btn").onclick = () => this.check();
    document.getElementById("s-schoolcode").addEventListener("keypress", (ev) => {
      if (ev.key === 'Enter') this.check();
    });
  },

  check: async function () {
    const schoolCode = document.getElementById("s-schoolcode").value.trim().toUpperCase();
    const out = document.getElementById("s-result");
    out.innerHTML = '';

    if (!schoolCode) {
      return notify.warning("Sila masukkan Kod Sekolah.");
    }

    notify.loading("Mencari permohonan...");

    const res = await Util.postJSON({
      type: "getStatus",
      payload: { schoolCode }
    });

    notify.dismissLoading();

    if (!res || !res.ok) {
      notify.error(res.message || "Rekod tidak ditemui.");
      out.innerHTML = `
        <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <i class="fas fa-exclamation-circle"></i> Tiada permohonan dijumpai untuk kod sekolah: <strong>${schoolCode}</strong>
        </div>
      `;
      return;
    }

    const data = res.data;
    this.renderResult(data, out);
  },

  renderResult: function (data, container) {
    const status = data.Status || '';
    const isQuery = status === 'Query';

    // Status badge color
    let statusColor = 'bg-blue-100 text-blue-800';
    if (status === 'Baru') statusColor = 'bg-green-100 text-green-800';
    if (status === 'Query') statusColor = 'bg-yellow-100 text-yellow-800';
    if (status === 'UntukTP') statusColor = 'bg-purple-100 text-purple-800';
    if (status === 'Lulus') statusColor = 'bg-green-100 text-green-800';

    const html = [];
    html.push(`<div class="p-4 bg-white border rounded shadow-sm">`);

    // Status Header
    html.push(`
      <div class="flex items-center justify-between mb-3 pb-3 border-b">
        <div>
          <h4 class="font-semibold text-lg">Status Permohonan</h4>
          <p class="text-xs text-gray-600">${data.ReqID}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-semibold ${statusColor}">${status}</span>
      </div>
    `);

    // Query Alert (if applicable)
    if (isQuery && data.CatatanQuery) {
      html.push(`
        <div class="alert alert-warning mb-3" style="background: #FEF3C7; border: 1px solid #FCD34D; padding: var(--spacing-sm); border-radius: var(--border-radius);">
          <div style="display: flex; align-items: start; gap: var(--spacing-sm);">
            <i class="fas fa-exclamation-triangle" style="color: #D97706; margin-top: 2px;"></i>
            <div style="flex: 1;">
              <strong style="color: #92400E;">Permohonan memerlukan kemaskini:</strong>
              <p style="margin-top: 4px; color: #78350F;">${data.CatatanQuery}</p>
              ${data.KodQuery ? `<p class="text-xs mt-1" style="color: #78350F;">Kod Query: <strong>${data.KodQuery}</strong></p>` : ''}
            </div>
          </div>
        </div>
      `);
    }

    // School Info
    html.push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">`);
    const fields = [
      { k: "KodSekolah", l: "Kod Sekolah" },
      { k: "NamaSekolah", l: "Nama Sekolah" },
      { k: "Daerah", l: "Daerah" },
      { k: "TarikhMAT", l: "Tarikh MAT" },
      { k: "HariMAT", l: "Hari MAT" },
      { k: "MasaMAT", l: "Masa MAT" },
      { k: "TempatMAT", l: "Tempat MAT" },
      { k: "NamaPerasmi", l: "Nama Perasmi" }
    ];

    fields.forEach(f => {
      const val = data[f.k] || '-';
      html.push(`
        <div>
          <span class="text-gray-600">${f.l}</span>
          <div class="font-medium">${val}</div>
        </div>
      `);
    });
    html.push(`</div>`);

    // Documents
    html.push(`<div class="mt-3 pt-3 border-t">`);
    html.push(`<div class="font-semibold mb-2">Dokumen</div>`);
    const files = [
      { key: "FileSuratPermohonan", label: "Surat Permohonan" },
      { key: "FileMinitMesyJK", label: "Minit Mesyuarat JK" },
      { key: "FileKertasCadangan", label: "Kertas Cadangan" },
      { key: "SuratKelulusan", label: "Surat Kelulusan" }
    ];

    files.forEach(f => {
      const v = data[f.key] || '';
      if (v) {
        html.push(`<div class="mt-1"><a class="text-blue-600 underline hover:text-blue-800" href="${v}" target="_blank"><i class="fas fa-file-pdf"></i> ${f.label}</a></div>`);
      }
    });
    html.push(`</div>`);

    // Query Resubmit Button
    if (isQuery) {
      html.push(`
        <div class="mt-4 pt-3 border-t">
          <button id="btn-resubmit" class="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            <i class="fas fa-upload"></i> Kemaskini & Hantar Semula Dokumen
          </button>
          <p class="text-xs text-gray-600 mt-2">
            <i class="fas fa-info-circle"></i> 
            Sistem akan menggunakan maklumat sedia ada. Anda hanya perlu muat naik 3 dokumen PDF yang telah diperbaiki.
          </p>
        </div>
      `);
    }

    html.push(`</div>`); // end container

    container.innerHTML = html.join('');

    // Attach resubmit handler if Query
    if (isQuery) {
      document.getElementById("btn-resubmit").onclick = () => {
        this.showResubmitForm(data.KodSekolah);
      };
    }

    notify.success("Permohonan dijumpai!");
  },

  showResubmitForm: function (schoolCode) {
    const modalHTML = `
      <div id="resubmit-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="padding: 20px;">
        <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 class="text-lg font-semibold">Kemaskini Permohonan Query</h3>
            <button id="close-resubmit" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="alert alert-info mb-4" style="background: #DBEAFE; border: 1px solid #3B82F6; padding: 12px; border-radius: 6px;">
            <i class="fas fa-info-circle" style="color: #1D4ED8;"></i>
            <span style="color: #1E40AF;">Maklumat permohonan akan kekal sama. Anda hanya perlu muat naik dokumen PDF yang telah diperbaiki.</span>
          </div>

          <form id="resubmit-form">
            <input type="hidden" id="resubmit-schoolcode" value="${schoolCode}">

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">1. Surat Permohonan (PDF) <span class="text-red-600">*</span></label>
                <input type="file" id="resubmit-surat" accept=".pdf" required class="w-full border rounded px-3 py-2 text-sm">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">2. Minit Mesyuarat JK (PDF) <span class="text-red-600">*</span></label>
                <input type="file" id="resubmit-minit" accept=".pdf" required class="w-full border rounded px-3 py-2 text-sm">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">3. Kertas Cadangan (PDF) <span class="text-red-600">*</span></label>
                <input type="file" id="resubmit-kertas" accept=".pdf" required class="w-full border rounded px-3 py-2 text-sm">
              </div>
            </div>

            <div class="mt-4 pt-3 border-t flex gap-2">
              <button type="button" id="cancel-resubmit" class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <i class="fas fa-check"></i> Hantar Semula
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close handlers
    document.getElementById("close-resubmit").onclick = () => {
      document.getElementById("resubmit-modal").remove();
    };
    document.getElementById("cancel-resubmit").onclick = () => {
      document.getElementById("resubmit-modal").remove();
    };

    // Submit handler
    document.getElementById("resubmit-form").onsubmit = async (e) => {
      e.preventDefault();
      await this.handleResubmit();
    };
  },

  handleResubmit: async function () {
    const schoolCode = document.getElementById("resubmit-schoolcode").value;
    const fileSurat = document.getElementById("resubmit-surat").files[0];
    const fileMinit = document.getElementById("resubmit-minit").files[0];
    const fileKertas = document.getElementById("resubmit-kertas").files[0];

    if (!fileSurat || !fileMinit || !fileKertas) {
      return notify.error("Sila muat naik semua 3 dokumen PDF.");
    }

    notify.loading("Memproses kemaskini dokumen...");

    try {
      const suratBase64 = await Util.fileToBase64(fileSurat);
      const minitBase64 = await Util.fileToBase64(fileMinit);
      const kertasBase64 = await Util.fileToBase64(fileKertas);

      const res = await Util.postJSON({
        type: "queryResubmit",
        payload: { schoolCode },
        filesBase64: {
          suratRasmi: suratBase64,
          minitMesyuarat: minitBase64,
          kertasCadangan: kertasBase64
        }
      });

      notify.dismissLoading();

      if (!res.ok) {
        return notify.error(res.message || "Gagal kemaskini permohonan.");
      }

      // Close modal
      document.getElementById("resubmit-modal").remove();

      notify.success("Permohonan berjaya dikemaskini dan dihantar semula!", { timeout: 5000 });

      // Refresh status
      setTimeout(() => {
        this.check();
      }, 1500);

    } catch (err) {
      notify.dismissLoading();
      notify.error("Ralat: " + err.toString());
    }
  }

};

// auto init
document.addEventListener("DOMContentLoaded", () => SemakUI.init());
