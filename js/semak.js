// semak.js - PIBG @ SPS (COMPLETE & FINAL with Malay Formats)
// --------------------------------------------------

const SemakUI = {

  init: function () {
    this.renderForm();
  },

  renderForm: function () {
    document.getElementById("semak-container").innerHTML = `
      <div class="space-y-4">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <i class="fas fa-search text-blue-600"></i>
            Semak Status Permohonan
          </h3>
          
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Kod Sekolah <span class="text-red-500">*</span></label>
            <input id="semak-kod" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" 
                   placeholder="Contoh: CBA0001" maxlength="7">
            <p class="text-xs text-gray-600 mt-1">Masukkan kod sekolah anda untuk semak status permohonan terkini</p>
          </div>

          <button id="btn-semak" class="w-full btn-primary px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <i class="fas fa-search"></i>
            Semak Status
          </button>
        </div>

        <div id="semak-result"></div>
      </div>
    `;

    document.getElementById("btn-semak").onclick = () => this.checkStatus();
    
    // Enter key support
    document.getElementById("semak-kod").addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkStatus();
    });
  },

  checkStatus: async function () {
    const kod = document.getElementById("semak-kod").value.trim().toUpperCase();

    if (!kod) {
      return notify.warning("Sila masukkan Kod Sekolah.");
    }

    notify.loading("Menyemak status...");

    try {
      const res = await Util.postJSON({
        type: "getStatus",
        payload: { schoolCode: kod }
      });

      notify.dismissLoading();

      if (!res.ok) {
        document.getElementById("semak-result").innerHTML = `
          <div class="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
            <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-3"></i>
            <h4 class="font-bold text-red-800 mb-2">Tiada Rekod Dijumpai</h4>
            <p class="text-red-700">${res.message || 'Kod sekolah tidak dijumpai dalam sistem.'}</p>
          </div>
        `;
        return;
      }

      this.renderResult(res.data);
    } catch (err) {
      notify.dismissLoading();
      notify.error("Ralat sambungan: " + err.message);
    }
  },

  renderResult: function (data) {
    const statusColor = {
      'Baru': 'bg-blue-100 text-blue-800 border-blue-300',
      'Query': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'UntukTP': 'bg-purple-100 text-purple-800 border-purple-300',
      'Lulus': 'bg-green-100 text-green-800 border-green-300',
      'Selesai': 'bg-gray-100 text-gray-800 border-gray-300'
    };

    const statusClass = statusColor[data.Status] || 'bg-gray-100 text-gray-800 border-gray-300';

    let html = `
      <div class="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
        <!-- Header Section -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div class="flex items-center gap-3 mb-2">
            <i class="fas fa-clipboard-check text-3xl"></i>
            <h3 class="text-2xl font-bold">Status Permohonan</h3>
          </div>
          <p class="text-blue-100">Maklumat permohonan MAT PIBG anda</p>
        </div>

        <!-- Content Section -->
        <div class="p-6">
          <!-- Status Badge -->
          <div class="mb-6 text-center">
            <span class="inline-block px-6 py-3 rounded-full text-lg font-bold border-2 ${statusClass}">
              ${data.Status}
            </span>
          </div>

          <!-- ID & School Info -->
          <div class="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm text-gray-600">ID Permohonan</p>
              <p class="font-bold text-xl text-blue-600">${data.ReqID || '-'}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Kod Sekolah</p>
              <p class="font-bold text-xl">${data.KodSekolah || '-'}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-sm text-gray-600">Nama Sekolah</p>
              <p class="font-semibold text-lg">${data.NamaSekolah || '-'}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Daerah</p>
              <p class="font-semibold">${data.Daerah || '-'}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Kategori</p>
              <p class="font-semibold">${data.Kategori || '-'}</p>
            </div>
          </div>

          <!-- MAT Info with MALAY FORMAT -->
          <div class="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div>
              <p class="text-sm text-gray-600">Tarikh Permohonan</p>
              <p class="font-semibold">${Util.formatMalayDate(data.TarikhPermohonan)}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Tarikh MAT</p>
              <p class="font-semibold">${Util.formatMalayDate(data.TarikhMAT)} (${Util.formatMalayDay(data.TarikhMAT)})</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Masa MAT</p>
              <p class="font-semibold">${Util.formatMalayTime(data.MasaMAT)}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Tempat MAT</p>
              <p class="font-semibold">${data.TempatMAT || '-'}</p>
            </div>
          </div>

          <!-- Perasmi Info -->
          <div class="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-600">Nama Perasmi</p>
              <p class="font-semibold">${data.NamaPerasmi || '-'}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Jawatan Perasmi</p>
              <p class="font-semibold">${data.JawatanPerasmi || '-'}</p>
            </div>
          </div>

          <!-- Documents -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i class="fas fa-file-pdf text-red-600"></i>
              Dokumen Permohonan
            </h4>
            <div class="space-y-2">
              ${data.FileSuratPermohonan ? `
              <a href="${data.FileSuratPermohonan}" target="_blank" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline">
                <i class="fas fa-file-pdf"></i>
                <span>Surat Permohonan</span>
              </a>` : ''}
              ${data.FileMinitMesyJK ? `
              <a href="${data.FileMinitMesyJK}" target="_blank" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline">
                <i class="fas fa-file-pdf"></i>
                <span>Minit Mesyuarat JK</span>
              </a>` : ''}
              ${data.FileKertasCadangan ? `
              <a href="${data.FileKertasCadangan}" target="_blank" class="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline">
                <i class="fas fa-file-pdf"></i>
                <span>Kertas Cadangan</span>
              </a>` : ''}
            </div>
          </div>
    `;

    // Query Alert
    if (data.Status === 'Query' && data.CatatanQuery) {
      html += `
          <div class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div class="flex items-start gap-3">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mt-1"></i>
              <div class="flex-1">
                <h4 class="font-bold text-yellow-800 mb-2">Permohonan Perlu Dikemaskini</h4>
                <p class="text-sm text-yellow-900 mb-3">${data.CatatanQuery}</p>
                <button onclick="SemakUI.showResubmitForm('${data.KodSekolah}')" class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold">
                  <i class="fas fa-upload"></i> Muat Naik Dokumen Baharu
                </button>
              </div>
            </div>
          </div>
      `;
    }

    // Surat Kelulusan (if Lulus)
    if (data.Status === 'Lulus' && data.SuratKelulusan) {
      html += `
          <div class="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <h4 class="font-bold text-green-800 mb-3 flex items-center gap-2">
              <i class="fas fa-check-circle"></i>
              Surat Kelulusan Tersedia
            </h4>
            <p class="text-sm text-gray-700 mb-3">Permohonan anda telah diluluskan. Sila muat turun surat kelulusan di bawah.</p>
            <a href="${data.SuratKelulusan}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <i class="fas fa-file-pdf"></i>
              Lihat / Muat Turun Surat Kelulusan
            </a>
          </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    document.getElementById("semak-result").innerHTML = html;
  },

  showResubmitForm: function (schoolCode) {
    const modalHTML = `
      <div id="resubmit-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 class="text-lg font-semibold">Kemaskini Dokumen Query</h3>
            <button id="close-resubmit" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="alert alert-info mb-4" style="background: #DBEAFE; border: 1px solid #3B82F6; padding: 12px; border-radius: 6px;">
            <i class="fas fa-info-circle" style="color: #1D4ED8;"></i>
            <span style="color: #1E40AF;">Sila muat naik KETIGA-TIGA dokumen (PDF sahaja). Data permohonan sedia ada akan kekal.</span>
          </div>

          <form id="resubmit-form">
            <input type="hidden" id="resubmit-kod" value="${schoolCode}">

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">1. Surat Permohonan (Baharu) <span class="text-red-600">*</span></label>
                <input type="file" id="resubmit-surat" accept="application/pdf" required class="w-full text-sm border border-gray-300 rounded-lg p-2">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">2. Minit Mesyuarat JK (Baharu) <span class="text-red-600">*</span></label>
                <input type="file" id="resubmit-minit" accept="application/pdf" required class="w-full text-sm border border-gray-300 rounded-lg p-2">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">3. Kertas Cadangan (Baharu) <span class="text-red-600">*</span></label>
                <input type="file" id="resubmit-kertas" accept="application/pdf" required class="w-full text-sm border border-gray-300 rounded-lg p-2">
              </div>
            </div>

            <div class="mt-6 pt-4 border-t flex gap-3">
              <button type="button" id="cancel-resubmit" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                <i class="fas fa-upload"></i> Hantar Semula
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('close-resubmit').onclick = () => {
      document.getElementById('resubmit-modal').remove();
    };
    document.getElementById('cancel-resubmit').onclick = () => {
      document.getElementById('resubmit-modal').remove();
    };

    document.getElementById('resubmit-form').onsubmit = async (e) => {
      e.preventDefault();
      await this.handleResubmit();
    };
  },

  handleResubmit: async function () {
    const schoolCode = document.getElementById('resubmit-kod').value;
    const fSurat = document.getElementById('resubmit-surat').files[0];
    const fMinit = document.getElementById('resubmit-minit').files[0];
    const fKertas = document.getElementById('resubmit-kertas').files[0];

    if (!fSurat || !fMinit || !fKertas) {
      return notify.error('Sila pilih ketiga-tiga fail PDF.');
    }

    notify.loading('Memuat naik dokumen baharu...');

    try {
      const suratObj = await Util.fileToBase64(fSurat);
      const minitObj = await Util.fileToBase64(fMinit);
      const kertasObj = await Util.fileToBase64(fKertas);

      const normalizeBase64 = (x) => {
        if (!x) return '';
        if (typeof x === 'string') return x.replace(/^data:.*;base64,/, '').replace(/\s+/g, '');
        if (typeof x === 'object' && x.data) return String(x.data).replace(/\s+/g, '');
        return '';
      };

      const bSurat = normalizeBase64(suratObj);
      const bMinit = normalizeBase64(minitObj);
      const bKertas = normalizeBase64(kertasObj);

      const res = await Util.postJSON({
        type: 'queryResubmit',
        payload: { schoolCode },
        filesBase64: {
          suratRasmi: { name: suratObj.name, data: bSurat },
          minitMesyuarat: { name: minitObj.name, data: bMinit },
          kertasCadangan: { name: kertasObj.name, data: bKertas }
        }
      });

      notify.dismissLoading();

      if (!res.ok) {
        return notify.error(res.message || 'Gagal kemaskini dokumen.');
      }

      document.getElementById('resubmit-modal').remove();
      notify.success('Dokumen berjaya dikemaskini! Status bertukar ke BARU.');

      // Refresh status
      setTimeout(() => this.checkStatus(), 1500);

    } catch (err) {
      notify.dismissLoading();
      notify.error('Ralat: ' + err.message);
    }
  }

};

// Auto initialize
document.addEventListener("DOMContentLoaded", () => SemakUI.init());
