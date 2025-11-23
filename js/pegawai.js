// pegawai.js
// --------------------------------------------------
// Dashboard Pegawai: list permohonan, query, hantar ke TP
// --------------------------------------------------

const PegawaiUI = {

  init: function () {
    // if already logged in, show dashboard
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
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Dashboard Pegawai</h3>
          <div>
            <button id="peg-refresh" class="px-3 py-1 border rounded mr-2">Refresh</button>
            <button id="peg-logout" class="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
          </div>
        </div>

        <div id="pegawai-filters" class="mb-3">
          <select id="peg-status" class="border px-2 py-1 rounded">
            <option value="">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Query">Query</option>
            <option value="UntukTP">UntukTP</option>
            <option value="LulusTP">LulusTP</option>
            <option value="Selesai">Selesai</option>
          </select>
          <button id="peg-load" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Muat</button>
        </div>

        <div id="pegawai-list"></div>
      </div>
    `;

    document.getElementById('peg-refresh').onclick = () => this.loadList();
    document.getElementById('peg-load').onclick = () => this.loadList();
    document.getElementById('peg-logout').onclick = () => AuthUI.logout();

    // initial load
    this.loadList();
  },

  loadList: async function () {
    const status = document.getElementById('peg-status').value;
    const token = Util.getToken();
    if (!token) return Util.toast('Sila log masuk semula.', 'error');

    Util.toast('Memuat senarai...', 'info');
    const res = await Util.postJSON({
      type: 'list',
      authToken: token,
      payload: { status: status }
    });

    if (!res || !res.ok) {
      Util.toast(res.message || 'Gagal dapatkan senarai', 'error');
      return;
    }

    this.renderList(res.data);
  },

  renderList: function (data) {
    const out = document.getElementById('pegawai-list');
    if (!data || !data.length) {
      out.innerHTML = '<div class="p-3 text-sm text-gray-600">Tiada permohonan ditemui.</div>';
      return;
    }

    // Table
    const rows = data.map(row => {
      const reqId = row['ReqID'] || row['U_ID'] || row['ReqID'] || '';
      const sekolah = row['NamaSekolah'] || row['NAMA_SEKOLAH'] || row['NamaSekolah'] || '';
      const kod = row['KodSekolah'] || row['KOD_SEKOLAH'] || '';
      const tarikh = row['TarikhMAT'] || row['TARIKH_MAT'] || '';
      const status = row['Status'] || row['STATUS'] || '';
      const surat = row['FileSuratPermohonan'] || row['SURAT_PERMOHONAN'] || '';
      const kertas = row['FileKertasCadangan'] || row['BORANG_PERMOHONAN'] || '';
      const minit = row['FileMinitMesyJK'] || row['MINIT_MESY_JK'] || '';
      return { reqId,sekolah,kod,tarikh,status,surat,kertas,minit };
    });

    let html = `<table class="w-full text-sm border-collapse">`;
    html += `<thead><tr class="text-left border-b"><th class="py-2">ReqID</th><th>Kod</th><th>Sekolah</th><th>Tarikh MAT</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>`;
    rows.forEach(r => {
      html += `<tr class="border-b">
        <td class="py-2 font-mono">${r.reqId}</td>
        <td class="py-2">${r.kod}</td>
        <td class="py-2">${r.sekolah}</td>
        <td class="py-2">${r.tarikh}</td>
        <td class="py-2">${r.status}</td>
        <td class="py-2">
          <button class="peg-view px-2 py-1 border rounded mr-1" data-id="${r.reqId}">Lihat</button>
          <button class="peg-query px-2 py-1 bg-yellow-400 rounded mr-1" data-id="${r.reqId}">Query</button>
          <button class="peg-sendtp px-2 py-1 bg-purple-600 text-white rounded" data-id="${r.reqId}">Hantar ke TP</button>
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;

    out.innerHTML = html;

    // Attach handlers
    document.querySelectorAll('.peg-view').forEach(b => {
      b.onclick = (ev) => {
        const id = ev.target.dataset.id;
        this.viewDetails(id);
      };
    });

    document.querySelectorAll('.peg-query').forEach(b => {
      b.onclick = (ev) => {
        const id = ev.target.dataset.id;
        this.openQueryPrompt(id);
      };
    });

    document.querySelectorAll('.peg-sendtp').forEach(b => {
      b.onclick = (ev) => {
        const id = ev.target.dataset.id;
        this.sendToTP(id);
      };
    });
  },

  viewDetails: async function (reqId) {
    // reuse SemakUI check logic but call server for full row
    const token = Util.getToken();
    if (!token) return Util.toast('Sila log masuk.', 'error');

    const res = await Util.postJSON({ type:'getStatus', authToken: token, payload:{ reqId }});
    if (!res || !res.ok) return Util.toast(res.message || 'Gagal panggil server', 'error');

    const data = res.data;
    const content = [
      `<div class="p-3 bg-white rounded shadow-sm text-sm">`,
      `<div class="font-semibold mb-2">Butiran Permohonan</div>`,
      `<div><strong>ReqID:</strong> ${data['ReqID']}</div>`,
      `<div><strong>Sekolah:</strong> ${data['NamaSekolah'] || data['NAMA_SEKOLAH'] || ''} (${data['KodSekolah'] || data['KOD_SEKOLAH'] || ''})</div>`,
      `<div><strong>Tarikh MAT:</strong> ${data['TarikhMAT'] || data['TARIKH_MAT'] || ''}</div>`,
      `<div class="mt-2"><strong>Dokumen:</strong></div>`,
    ];

    const files = [
      { k:'FileSuratPermohonan', l:'Surat Permohonan' },
      { k:'FileMinitMesyJK', l:'Minit Mesyuarat JK' },
      { k:'FileKertasCadangan', l:'Kertas Cadangan' }
    ];

    files.forEach(f => {
      const url = data[f.k] || data[f.k.toUpperCase()] || '';
      if (url) content.push(`<div><a class="text-blue-600 underline" href="${url}" target="_blank">${f.l}</a></div>`);
    });

    content.push(`<div class="mt-3"><button id="close-detail" class="px-3 py-1 border rounded">Tutup</button></div>`);
    content.push('</div>');

    const modal = document.createElement('div');
    modal.id = 'peg-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
    modal.innerHTML = `<div class="max-w-2xl w-full p-4">${content.join('')}</div>`;
    document.body.appendChild(modal);

    document.getElementById('close-detail').onclick = () => modal.remove();
  },

  openQueryPrompt: function (reqId) {
    const note = prompt('Masukkan nota / sebab query untuk sekolah (mesti jelas):');
    if (!note) return Util.toast('Tindakan dibatalkan.', 'info');
    this.sendQuery(reqId, note);
  },

  sendQuery: async function (reqId, note) {
    const token = Util.getToken();
    if (!token) return Util.toast('Sila log masuk.', 'error');

    const res = await Util.postJSON({
      type: 'query',
      authToken: token,
      payload: { reqId: reqId, note: note }
    });

    if (!res || !res.ok) return Util.toast(res.message || 'Gagal hantar query', 'error');

    Util.toast('Permohonan telah di-query.', 'success');
    this.loadList();
  },

  sendToTP: async function (reqId) {
    if (!confirm('Hantar permohonan ini kepada TP untuk kelulusan?')) return;
    const token = Util.getToken();
    if (!token) return Util.toast('Sila log masuk.', 'error');

    const res = await Util.postJSON({
      type: 'sendToTP',
      authToken: token,
      payload: { reqId: reqId }
    });

    if (!res || !res.ok) return Util.toast(res.message || 'Gagal hantar ke TP', 'error');
    Util.toast('Permohonan dihantar kepada TP.', 'success');
    this.loadList();
  }

};

// auto init
document.addEventListener('DOMContentLoaded', () => PegawaiUI.init());
