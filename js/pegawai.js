// pegawai.js
// --------------------------------------------------
// Dashboard Pegawai: 3 Tables (Baru, Query, Akhir) + Sahkan Modal
// --------------------------------------------------

const PegawaiUI = {

  init: function () {
    const role = Util.getRole();
    if (role === 'pegawai' && document.getElementById('pegawai-dashboard')) {
      document.getElementById('pegawai-login').classList.add('hidden');
      document.getElementById('pegawai-dashboard').classList.remove('hidden');
      this.loadDashboard();
    }
  },

  loadDashboard: async function () {
    const container = document.getElementById('pegawai-dashboard');
    container.innerHTML = `
      <div class="bg-white p-4 rounded shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-3 border-b">
          <div>
            <h3 class="font-semibold text-lg">Dashboard Pegawai Penyemak</h3>
            <p class="text-sm text-gray-600">Pengurusan permohonan MAT PIBG</p>
          </div>
          <div class="flex gap-2">
            <button id="peg-refresh" class="px-3 py-1 border rounded hover:bg-gray-50">
              <i class="fas fa-sync"></i> Refresh
            </button>
            <button id="peg-logout" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        <!-- 3 TABLES TABS -->
        <div class="mb-4">
          <div class="flex gap-2 border-b">
            <button id="tab-baru" class="table-tab active px-4 py-2 font-medium border-b-2 border-blue-600 text-blue-600">
              <i class="fas fa-inbox"></i> Permohonan Baru <span id="count-baru" class="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">0</span>
            </button>
            <button id="tab-query" class="table-tab px-4 py-2 font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800">
              <i class="fas fa-question-circle"></i> Query <span id="count-query" class="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">0</span>
            </button>
            <button id="tab-akhir" class="table-tab px-4 py-2 font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-800">
              <i class="fas fa-check-circle"></i> Selesai <span id="count-akhir" class="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">0</span>
            </button>
          </div>
        </div>

        <!-- TABLE CONTENT CONTAINERS -->
        <div id="table-baru" class="table-content"></div>
        <div id="table-query" class="table-content hidden"></div>
        <div id="table-akhir" class="table-content hidden"></div>
      </div>
    `;

    // Event handlers
    document.getElementById('peg-refresh').onclick = () => this.loadAllTables();
    document.getElementById('peg-logout').onclick = () => AuthUI.logout();

    // Tab switching
    document.getElementById('tab-baru').onclick = () => this.switchTab('baru');
    document.getElementById('tab-query').onclick = () => this.switchTab('query');
    document.getElementById('tab-akhir').onclick = () => this.switchTab('akhir');

    // Initial load
    this.loadAllTables();
  },

  switchTab: function (tabName) {
    // Update tab buttons
    document.querySelectorAll('.table-tab').forEach(btn => {
      btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-600');
    });

    const activeTab = document.getElementById('tab-' + tabName);
    activeTab.classList.add('active', 'border-blue-600', 'text-blue-600');
    activeTab.classList.remove('border-transparent', 'text-gray-600');

    // Update content visibility
    document.querySelectorAll('.table-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById('table-' + tabName).classList.remove('hidden');
  },

  loadAllTables: async function () {
    const token = Util.getToken();
    if (!token) {
      notify.error('Sila log masuk semula.');
      return;
    }

    notify.loading('Memuat data...');

    const res = await Util.postJSON({
      type: 'list',
      authToken: token,
      payload: {}
    });

    notify.dismissLoading();

    if (!res || !res.ok) {
      notify.error(res.message || 'Gagal dapatkan senarai');
      return;
    }

    const allData = res.data || [];

    // Filter by status
    const dataBaru = allData.filter(r => r.Status === 'Baru');
    const dataQuery = allData.filter(r => r.Status === 'Query');
    const dataAkhir = allData.filter(r => r.Status === 'Lulus' || r.Status === 'Selesai' || r.Status === 'UntukTP');

    // Update counts
    document.getElementById('count-baru').textContent = dataBaru.length;
    document.getElementById('count-query').textContent = dataQuery.length;
    document.getElementById('count-akhir').textContent = dataAkhir.length;

    // Render tables (sort by latest first)
    this.renderTable('baru', dataBaru.reverse());
    this.renderTable('query', dataQuery.reverse());
    this.renderTable('akhir', dataAkhir.reverse());

    notify.success('Data dikemaskini!', { timeout: 2000 });
  },

  renderTable: function (tableName, data) {
    const container = document.getElementById('table-' + tableName);

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>Tiada permohonan dalam kategori ini.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left border-b bg-gray-50">
              <th class="py-2 px-2">ReqID</th>
              <th class="py-2 px-2">Sekolah</th>
              <th class="py-2 px-2">Daerah</th>
              <th class="py-2 px-2">Tarikh MAT</th>
              ${tableName === 'query' ? '<th class="py-2 px-2">Catatan</th>' : ''}
              ${tableName === 'akhir' ? '<th class="py-2 px-2">Status</th>' : ''}
              <th class="py-2 px-2 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach(row => {
      const reqId = row.ReqID || '';
      const sekolah = row.NamaSekolah || '';
      const kod = row.KodSekolah || '';
      const daerah = row.Daerah || '';
      const tarikh = row.TarikhMAT || '';
      const status = row.Status || '';
      const catatan = row.CatatanQuery || '';

      html += `
        <tr class="border-b hover:bg-gray-50">
          <td class="py-2 px-2 font-mono text-xs">${reqId}</td>
          <td class="py-2 px-2">
            <div class="font-medium">${sekolah}</div>
            <div class="text-xs text-gray-600">${kod}</div>
          </td>
          <td class="py-2 px-2">${daerah}</td>
          <td class="py-2 px-2">${tarikh}</td>
      `;

      if (tableName === 'query') {
        html += `<td class="py-2 px-2 text-xs">${catatan ? catatan.substring(0, 50) + '...' : '-'}</td>`;
      }

      if (tableName === 'akhir') {
        let statusBadge = 'bg-gray-100 text-gray-800';
        if (status === 'Lulus') statusBadge = 'bg-green-100 text-green-800';
        if (status === 'UntukTP') statusBadge = 'bg-purple-100 text-purple-800';
        html += `<td class="py-2 px-2"><span class="px-2 py-1 rounded text-xs ${statusBadge}">${status}</span></td>`;
      }

      html += `<td class="py-2 px-2 text-right">`;

      // Action buttons based on table
      if (tableName === 'baru') {
        html += `
          <button class="peg-view px-2 py-1 text-xs border rounded mr-1 hover:bg-gray-100" data-id="${reqId}">
            <i class="fas fa-eye"></i>
          </button>
          <button class="peg-query px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded mr-1 hover:bg-yellow-500" data-id="${reqId}">
            <i class="fas fa-question-circle"></i> Query
          </button>
          <button class="peg-sahkan px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700" data-id="${reqId}">
            <i class="fas fa-check"></i> Sahkan
          </button>
        `;
      } else if (tableName === 'query') {
        html += `
          <button class="peg-view px-2 py-1 text-xs border rounded hover:bg-gray-100" data-id="${reqId}">
            <i class="fas fa-eye"></i> Lihat
          </button>
        `;
      } else if (tableName === 'akhir') {
        html += `
          <button class="peg-view px-2 py-1 text-xs border rounded hover:bg-gray-100" data-id="${reqId}">
            <i class="fas fa-eye"></i> Lihat
          </button>
        `;
      }

      html += `</td></tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;

    // Attach event handlers
    container.querySelectorAll('.peg-view').forEach(btn => {
      btn.onclick = () => this.viewDetails(btn.dataset.id);
    });

    container.querySelectorAll('.peg-query').forEach(btn => {
      btn.onclick = () => this.openQueryModal(btn.dataset.id);
    });

    container.querySelectorAll('.peg-sahkan').forEach(btn => {
      btn.onclick = () => this.openSahkanModal(btn.dataset.id);
    });
  },

  viewDetails: async function (reqId) {
    const token = Util.getToken();
    if (!token) return notify.error('Sila log masuk.');

    notify.loading('Memuat butiran...');

    const res = await Util.postJSON({
      type: 'getStatus',
      authToken: token,
      payload: { reqId }
    });

    notify.dismissLoading();

    if (!res || !res.ok) {
      return notify.error(res.message || 'Gagal panggil server');
    }

    const data = res.data;

    const modalHTML = `
      <div id="detail-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-screen overflow-y-auto">
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 class="text-lg font-semibold">Butiran Permohonan</h3>
            <button id="close-detail" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><span class="text-gray-600">ReqID:</span><div class="font-medium">${data.ReqID}</div></div>
            <div><span class="text-gray-600">Status:</span><div class="font-medium">${data.Status}</div></div>
            <div><span class="text-gray-600">Kod Sekolah:</span><div class="font-medium">${data.KodSekolah}</div></div>
            <div><span class="text-gray-600">Nama Sekolah:</span><div class="font-medium">${data.NamaSekolah}</div></div>
            <div><span class="text-gray-600">Daerah:</span><div class="font-medium">${data.Daerah}</div></div>
            <div><span class="text-gray-600">Tarikh MAT:</span><div class="font-medium">${data.TarikhMAT}</div></div>
            <div><span class="text-gray-600">Masa:</span><div class="font-medium">${data.MasaMAT}</div></div>
            <div><span class="text-gray-600">Tempat:</span><div class="font-medium">${data.TempatMAT}</div></div>
            <div class="col-span-2"><span class="text-gray-600">Nama Perasmi:</span><div class="font-medium">${data.NamaPerasmi}</div></div>
            <div class="col-span-2"><span class="text-gray-600">Jawatan Perasmi:</span><div class="font-medium">${data.JawatanPerasmi}</div></div>
          </div>

          <div class="mt-4 pt-3 border-t">
            <h4 class="font-semibold mb-2">Dokumen</h4>
            <div class="space-y-1">
              ${data.FileSuratPermohonan ? `<div><a href="${data.FileSuratPermohonan}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-file-pdf"></i> Surat Permohonan</a></div>` : ''}
              ${data.FileMinitMesyJK ? `<div><a href="${data.FileMinitMesyJK}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-file-pdf"></i> Minit Mesyuarat JK</a></div>` : ''}
              ${data.FileKertasCadangan ? `<div><a href="${data.FileKertasCadangan}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-file-pdf"></i> Kertas Cadangan</a></div>` : ''}
            </div>
          </div>

          ${data.Status === 'Query' && data.CatatanQuery ? `
            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div class="font-semibold text-sm mb-1">Catatan Query:</div>
              <p class="text-sm">${data.CatatanQuery}</p>
            </div>
          ` : ''}

          <div class="mt-4 pt-3 border-t text-right">
            <button id="close-detail-btn" class="px-4 py-2 border rounded hover:bg-gray-50">Tutup</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('close-detail').onclick = () => {
      document.getElementById('detail-modal').remove();
    };
    document.getElementById('close-detail-btn').onclick = () => {
      document.getElementById('detail-modal').remove();
    };
  },

  openQueryModal: function (reqId) {
    const modalHTML = `
      <div id="query-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 class="text-lg font-semibold">Tandakan Query</h3>
            <button id="close-query" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <form id="query-form">
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Kod Query (Optional)</label>
              <input type="text" id="query-kod" class="w-full border rounded px-3 py-2" placeholder="Contoh: Q001">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Catatan Query <span class="text-red-600">*</span></label>
              <textarea id="query-note" rows="4" required class="w-full border rounded px-3 py-2" placeholder="Nyatakan dengan jelas apa yang perlu diperbetulkan oleh sekolah..."></textarea>
            </div>

            <div class="flex gap-2">
              <button type="button" id="cancel-query" class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Batal</button>
              <button type="submit" class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                <i class="fas fa-question-circle"></i> Hantar Query
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('close-query').onclick = () => {
      document.getElementById('query-modal').remove();
    };
    document.getElementById('cancel-query').onclick = () => {
      document.getElementById('query-modal').remove();
    };

    document.getElementById('query-form').onsubmit = async (e) => {
      e.preventDefault();
      await this.sendQuery(reqId);
    };
  },

  sendQuery: async function (reqId) {
    const note = document.getElementById('query-note').value.trim();
    const kodQuery = document.getElementById('query-kod').value.trim();

    if (!note) {
      return notify.warning('Sila masukkan catatan query.');
    }

    const token = Util.getToken();
    if (!token) return notify.error('Sila log masuk.');

    notify.loading('Menghantar query...');

    const res = await Util.postJSON({
      type: 'query',
      authToken: token,
      payload: { reqId, note, kodQuery }
    });

    notify.dismissLoading();

    if (!res || !res.ok) {
      return notify.error(res.message || 'Gagal hantar query');
    }

    document.getElementById('query-modal').remove();
    notify.success('Permohonan ditandakan sebagai Query.');
    this.loadAllTables();
  },

  openSahkanModal: function (reqId) {
    const modalHTML = `
      <div id="sahkan-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-4 pb-3 border-b">
            <h3 class="text-lg font-semibold">Sahkan Permohonan</h3>
            <button id="close-sahkan" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="alert alert-info mb-4" style="background: #DBEAFE; border: 1px solid #3B82F6; padding: 12px; border-radius: 6px;">
            <i class="fas fa-info-circle" style="color: #1D4ED8;"></i>
            <span style="color: #1E40AF;">Sila masukkan maklumat surat untuk dihantar ke TP.</span>
          </div>

          <form id="sahkan-form">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">Jilid <span class="text-red-600">*</span></label>
                <input type="text" id="sahkan-jilid" required class="w-full border rounded px-3 py-2" placeholder="Contoh: 1/2025">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Bil Surat <span class="text-red-600">*</span></label>
                <input type="text" id="sahkan-bilsurat" required class="w-full border rounded px-3 py-2" placeholder="Contoh: JPNP.SPS.600-1/1/2(25)">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Tarikh Surat <span class="text-red-600">*</span></label>
                <input type="date" id="sahkan-tarikh" required class="w-full border rounded px-3 py-2">
              </div>
            </div>

            <div class="mt-4 pt-3 border-t flex gap-2">
              <button type="button" id="cancel-sahkan" class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <i class="fas fa-check"></i> Sahkan & Hantar ke TP
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Set default date to today
    document.getElementById('sahkan-tarikh').valueAsDate = new Date();

    document.getElementById('close-sahkan').onclick = () => {
      document.getElementById('sahkan-modal').remove();
    };
    document.getElementById('cancel-sahkan').onclick = () => {
      document.getElementById('sahkan-modal').remove();
    };

    document.getElementById('sahkan-form').onsubmit = async (e) => {
      e.preventDefault();
      await this.sendSahkan(reqId);
    };
  },

  sendSahkan: async function (reqId) {
    const jilid = document.getElementById('sahkan-jilid').value.trim();
    const bilSurat = document.getElementById('sahkan-bilsurat').value.trim();
    const tarikhSurat = document.getElementById('sahkan-tarikh').value;

    if (!jilid || !bilSurat || !tarikhSurat) {
      return notify.warning('Sila lengkapkan semua maklumat.');
    }

    const token = Util.getToken();
    if (!token) return notify.error('Sila log masuk.');

    notify.loading('Memproses pengesahan...');

    const res = await Util.postJSON({
      type: 'pegawaiSahkan',
      authToken: token,
      payload: { reqId, jilid, bilSurat, tarikhSurat }
    });

    notify.dismissLoading();

    if (!res || !res.ok) {
      return notify.error(res.message || 'Gagal sahkan permohonan');
    }

    document.getElementById('sahkan-modal').remove();
    notify.success('Permohonan disahkan dan dihantar ke TP!');
    this.loadAllTables();
  }

};

// auto init
document.addEventListener('DOMContentLoaded', () => PegawaiUI.init());
