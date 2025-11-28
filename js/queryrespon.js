/**
 * ========================================
 * QUERY RESPONSE MODULE
 * ========================================
 * Public interface for schools to respond to pegawai queries
 * by uploading revised documents and providing response notes
 * 
 * Features:
 * - Check query status by school code
 * - Upload 1-3 revised PDF files (flexible)
 * - Write response notes for pegawai
 * - Automatic status change: Query → Baru
 * - File overwrite strategy (not versioning)
 */

const QueryResponUI = {
  
  /**
   * Render main UI
   */
  renderUI: function() {
    const container = document.getElementById('queryrespon-container');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            <i class="fas fa-reply text-yellow-600"></i>
            Respon Query Pegawai
          </h2>
          <p class="text-gray-600">
            Kemaskini dokumen dan berikan catatan balasan untuk query daripada pegawai
          </p>
        </div>

        <!-- Info Alert -->
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div class="flex items-start">
            <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div class="text-sm text-blue-800">
              <p class="font-semibold mb-1">Maklumat:</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li>Hanya permohonan dengan status <span class="font-semibold">Query</span> boleh dikemaskini</li>
                <li>Upload dokumen yang perlu diperbaiki sahaja (tidak wajib semua)</li>
                <li>Tulis catatan untuk membantu pegawai fahami perubahan yang dibuat</li>
                <li>Status akan bertukar kepada <span class="font-semibold">Baru</span> selepas submit</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Step 1: Check Query Status -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
            <span class="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Semak Status Query
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Kod Sekolah <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="qr-schoolcode"
                placeholder="Contoh: PEA0001"
                maxlength="7"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none uppercase"
              />
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-school"></i> 
                Masukkan kod sekolah anda (7 aksara)
              </p>
            </div>

            <button
              onclick="QueryResponUI.checkQuery()"
              class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <i class="fas fa-search mr-2"></i>
              Semak Status Query
            </button>
          </div>
        </div>

        <!-- Query Details (hidden initially) -->
        <div id="qr-details" class="hidden"></div>

      </div>
    `;
  },

  /**
   * Check if school has Query status
   */
  checkQuery: async function() {
    const schoolCode = document.getElementById('qr-schoolcode').value.trim().toUpperCase();

    if (!schoolCode) {
      return notify.warning('Sila masukkan kod sekolah.');
    }

    if (schoolCode.length !== 7) {
      return notify.warning('Kod sekolah mestilah 7 aksara.');
    }

    try {
      notify.loading('Menyemak status query...');

      const res = await Util.postJSON({
        type: 'queryResponCheck',
        payload: { schoolCode: schoolCode }
      });

      notify.close();

      if (res.ok) {
        this.displayQueryDetails(res.data);
      } else {
        notify.info(res.message || 'Tiada query ditemui untuk kod sekolah ini.');
        document.getElementById('qr-details').classList.add('hidden');
      }

    } catch (err) {
      notify.close();
      notify.error('Ralat semasa menyemak status: ' + err.message);
    }
  },

  /**
   * Display query details and upload form
   */
  displayQueryDetails: function(data) {
    const detailsDiv = document.getElementById('qr-details');
    if (!detailsDiv) return;

    detailsDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        
        <!-- Query Alert -->
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-yellow-500 text-xl mt-1 mr-3"></i>
            <div class="flex-1">
              <p class="font-semibold text-yellow-800 mb-2">Query dari Pegawai:</p>
              <div class="text-sm text-yellow-900 space-y-1">
                <p><strong>Permohonan ID:</strong> ${data.ReqID || '-'}</p>
                <p><strong>Tarikh MAT:</strong> ${data.TarikhMAT || '-'}</p>
                <p class="mt-3 p-3 bg-yellow-100 rounded border border-yellow-200">
                  <strong>Catatan:</strong><br>
                  ${data.CatatanQuery || 'Tiada catatan'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Response Notes -->
        <div class="mb-6">
          <h3 class="font-semibold text-lg mb-3 flex items-center gap-2">
            <span class="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Catatan Balasan untuk Pegawai
          </h3>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <p class="text-sm text-blue-900 flex items-start gap-2">
              <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <span>
                Nyatakan tindakan yang telah anda ambil untuk mengatasi isu yang dibangkitkan oleh pegawai.
              </span>
            </p>
          </div>

          <textarea 
            id="qr-catatan" 
            rows="4" 
            placeholder="Contoh: Minit Mesyuarat telah dikemaskini dengan tandatangan penuh Pengerusi dan Setiausaha. Surat Permohonan menggunakan kop surat rasmi sekolah."
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none resize-none"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">
            <i class="fas fa-pencil-alt"></i> 
            Optional - Bantu pegawai memahami perubahan yang dibuat
          </p>
        </div>

        <!-- Step 3: Upload Files -->
        <div class="mb-6">
          <h3 class="font-semibold text-lg mb-3 flex items-center gap-2">
            <span class="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Muat Naik Dokumen Kemaskini
          </h3>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-yellow-900 flex items-start gap-2">
              <i class="fas fa-lightbulb text-yellow-600 mt-0.5"></i>
              <span>
                <strong>Hanya upload fail yang perlu dikemaskini sahaja.</strong> 
                Fail lama akan diganti dengan fail baru yang anda upload.
              </span>
            </p>
          </div>

          <div class="space-y-4">
            <!-- Surat Permohonan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Surat Permohonan (PDF)
              </label>
              <input
                type="file"
                id="qr-surat"
                accept="application/pdf"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
              />
            </div>

            <!-- Minit Mesyuarat -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Minit Mesyuarat JK PIBG (PDF)
              </label>
              <input
                type="file"
                id="qr-minit"
                accept="application/pdf"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
              />
            </div>

            <!-- Kertas Cadangan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Kertas Cadangan (PDF)
              </label>
              <input
                type="file"
                id="qr-kertas"
                accept="application/pdf"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            onclick="QueryResponUI.renderUI()"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <i class="fas fa-times mr-2"></i>
            Batal
          </button>
          <button
            onclick="QueryResponUI.submitResponse('${data.KodSekolah}')"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <i class="fas fa-paper-plane mr-2"></i>
            Hantar Respons & Kemaskini
          </button>
        </div>

      </div>
    `;

    detailsDiv.classList.remove('hidden');

    // Scroll to details
    detailsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /**
   * Submit response with files and notes
   */
  submitResponse: async function(schoolCode) {
    const fSurat = document.getElementById('qr-surat').files[0];
    const fMinit = document.getElementById('qr-minit').files[0];
    const fKertas = document.getElementById('qr-kertas').files[0];

    // Validate: at least one file must be uploaded
    if (!fSurat && !fMinit && !fKertas) {
      return notify.warning('Sila upload sekurang-kurangnya SATU dokumen untuk kemaskini permohonan.');
    }

    const catatan = document.getElementById('qr-catatan').value.trim();

    // Optional: Make catatan mandatory (uncomment if needed)
    // if (!catatan) {
    //   return notify.warning('Sila masukkan catatan balasan untuk pegawai.');
    // }

    try {
      notify.loading('Sedang memproses respons anda...');

      // Convert files to base64
      const filesBase64 = {};

      if (fSurat) {
        filesBase64.surat = {
          name: fSurat.name,
          mimeType: fSurat.type,
          data: await Util.fileToBase64(fSurat)
        };
      }

      if (fMinit) {
        filesBase64.minit = {
          name: fMinit.name,
          mimeType: fMinit.type,
          data: await Util.fileToBase64(fMinit)
        };
      }

      if (fKertas) {
        filesBase64.kertas = {
          name: fKertas.name,
          mimeType: fKertas.type,
          data: await Util.fileToBase64(fKertas)
        };
      }

      // Submit to backend
      const catatan = document.getElementById('qr-catatan').value.trim();

      const res = await Util.postJSON({
        type: 'queryResponSubmit',
        payload: { 
          schoolCode: schoolCode,
          catatanSekolah: catatan
        },
        filesBase64: filesBase64
      });

      notify.close();

      if (res.ok) {
        notify.success(res.message || 'Respons berjaya dihantar! Status permohonan telah dikemaskini kepada Baru.');
        
        // Reset form
        this.renderUI();

      } else {
        notify.error(res.message || 'Ralat semasa menghantar respons.');
      }

    } catch (err) {
      notify.close();
      notify.error('Ralat semasa memproses: ' + err.message);
    }
  }

};

// Auto-render on tab switch
document.addEventListener('DOMContentLoaded', function() {
  const queryResponTab = document.querySelector('[data-tab="queryrespon"]');
  if (queryResponTab) {
    queryResponTab.addEventListener('click', function() {
      QueryResponUI.renderUI();
    });
  }
});