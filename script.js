/**
 * ============================================================
 * TOOLS RPP WAFA — Generator RPP Format 5P
 * Template Engine: Identitas → P1-P5 → Tanda Tangan
 * ============================================================
 */
"use strict";

const STORAGE_KEY = 'tools_rpp_wafa_apikey';
const LOGO_KEY = 'tools_rpp_wafa_logo';
const KANTONG_KEY = 'tools_rpp_wafa_kantong';
let currentTab = 0;
const TOTAL_TABS = 4;

// ============================================================
// BSK / BSP STATE
// ============================================================
let p4Mode = 'BSK';

const BSK_DEFAULTS = {
  sub: 'Baca Simak Klasikal (BSK)',
  title: 'Baca Simak Klasikal',
  desc: 'Penilaian individual dan peer-monitoring',
  activities: [
    'Siswa membaca 4 baris acak, siswa lain menyimak, Guru menilai bacaan siswa di kartu Prestasi.',
    'Pada saat siswa membaca ada kesalahan, maka siswa lain langsung memberikan kode kesalahannya misal dengan suara (tut tut). Demikian seterusnya sampai selesai.',
  ],
};

const BSP_DEFAULTS = {
  sub: 'Baca Simak Privat (BSP)',
  title: 'Baca Simak Privat',
  desc: 'Penilaian individual satu per satu oleh guru',
  activities: [
    'Guru memanggil siswa satu per satu untuk membaca secara privat di hadapan guru.',
    'Siswa yang tidak dipanggil mengerjakan tugas mandiri (menulis, mewarnai, atau latihan lainnya).',
    'Guru menilai bacaan masing-masing siswa di kartu Prestasi dan memberikan umpan balik langsung.',
  ],
};

// ============================================================
// DOM HELPERS
// ============================================================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg, type = 'success', dur = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, dur);
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function switchTab(idx) {
  $$('.tab-btn').forEach(btn => {
    const n = parseInt(btn.dataset.tab);
    btn.classList.remove('active', 'done');
    if (n < idx) btn.classList.add('done');
  });
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  const btn = $(`tab-btn-${idx}`);
  const panel = document.querySelector(`[data-panel="${idx}"]`);
  if (btn) { btn.classList.add('active'); btn.classList.remove('done'); }
  if (panel) panel.classList.add('active');
  currentTab = idx;
  $('progress-bar').style.width = (((idx + 1) / TOTAL_TABS) * 100) + '%';
}

// Tab button clicks
$$('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(parseInt(btn.dataset.tab))));

// Next/Prev delegation
document.addEventListener('click', (e) => {
  const nx = e.target.closest('[data-next]');
  const pv = e.target.closest('[data-prev]');
  if (nx) switchTab(parseInt(nx.dataset.next));
  if (pv) switchTab(parseInt(pv.dataset.prev));
});

// ============================================================
// ACTIVITY LIST MANAGEMENT (Dynamic add/remove for P1, P3-tiru, P4)
// ============================================================
function getListType(listEl) {
  // Check if it uses bullets or letters
  const first = listEl.querySelector('.act-label');
  return first && first.classList.contains('bullet') ? 'bullet' : 'alpha';
}

function refreshListLabels(listEl) {
  const type = getListType(listEl);
  const items = listEl.querySelectorAll('.activity-item');
  items.forEach((item, i) => {
    const label = item.querySelector('.act-label');
    if (label) {
      if (type === 'bullet') {
        label.textContent = '•';
      } else {
        label.textContent = String.fromCharCode(97 + i) + '.';
      }
    }
    // Re-attach remove listener
    const rmBtn = item.querySelector('.btn-act-rm');
    if (rmBtn) {
      rmBtn.onclick = () => {
        item.remove();
        refreshListLabels(listEl);
        schedulePreviewUpdate();
      };
    }
  });
}

function addActivityItem(listId, type = 'alpha') {
  const list = $(listId);
  if (!list) return;
  const count = list.querySelectorAll('.activity-item').length;
  const labelText = type === 'bullet' ? '•' : String.fromCharCode(97 + count) + '.';
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `
    <span class="act-label${type === 'bullet' ? ' bullet' : ''}">${labelText}</span>
    <input type="text" class="act-input" placeholder="Ketik kegiatan di sini..." />
    <button class="btn-act-rm">×</button>
  `;
  list.appendChild(item);
  refreshListLabels(list);
  item.querySelector('.act-input').focus();
  // Live preview update
  schedulePreviewUpdate();
}

// Delegate add-activity button clicks
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-add-act');
  if (!btn) return;
  const targetId = btn.dataset.target;
  const type = btn.dataset.type || 'alpha';
  addActivityItem(targetId, type);
});

// BSK/BSP Toggle
function switchP4Mode(type, skipConfirm = false) {
  const defaults = type === 'BSP' ? BSP_DEFAULTS : BSK_DEFAULTS;
  p4Mode = type;
  // Update toggle buttons
  $$('.bsk-bsp-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type === type));
  // Update section header labels
  const titleEl = $('p4-section-title');
  const descEl = $('p4-section-desc');
  if (titleEl) titleEl.textContent = defaults.title;
  if (descEl) descEl.textContent = defaults.desc;
  // Update sub input
  $('p4-sub').value = defaults.sub;
  // Replace p4-list content
  const list = $('p4-list');
  list.innerHTML = '';
  defaults.activities.forEach(act => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `<span class="act-label bullet">\u2022</span><input type="text" class="act-input" value="${act.replace(/"/g, '&quot;')}" /><button class="btn-act-rm">&times;</button>`;
    list.appendChild(item);
  });
  refreshListLabels(list);
  schedulePreviewUpdate();
  showToast(`🔄 Berganti ke ${defaults.sub}`, 'info', 2000);
}

// Delegate BSK/BSP button clicks
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.bsk-bsp-btn');
  if (!btn) return;
  const type = btn.dataset.type;
  if (type !== p4Mode) switchP4Mode(type);
});



// ============================================================
// LOGO UPLOAD & DISPLAY
// ============================================================
function showLogoPreview(dataUrl) {
  const img = $('logo-preview-img');
  const placeholder = $('logo-placeholder');
  const removeBtn = $('btn-remove-logo');
  if (img) { img.src = dataUrl; img.style.display = 'block'; }
  if (placeholder) placeholder.style.display = 'none';
  if (removeBtn) removeBtn.style.display = 'inline-flex';
}
function clearLogoPreview() {
  const img = $('logo-preview-img');
  const placeholder = $('logo-placeholder');
  const removeBtn = $('btn-remove-logo');
  if (img) { img.src = ''; img.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'flex';
  if (removeBtn) removeBtn.style.display = 'none';
}
function loadLogo() {
  const d = localStorage.getItem(LOGO_KEY);
  if (d) showLogoPreview(d);
}
$('logo-upload')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    localStorage.setItem(LOGO_KEY, dataUrl);
    showLogoPreview(dataUrl);
    schedulePreviewUpdate();
    showToast('\u2705 Logo berhasil diupload!', 'success');
  };
  reader.readAsDataURL(file);
});
$('btn-remove-logo')?.addEventListener('click', () => {
  localStorage.removeItem(LOGO_KEY);
  clearLogoPreview();
  const inp = $('logo-upload');
  if (inp) inp.value = '';
  schedulePreviewUpdate();
  showToast('\ud83d\uddd1\ufe0f Logo dihapus', 'info');
});


// ============================================================
// DATA COLLECTION
// ============================================================
function getListValues(listId) {
  const list = $(listId);
  if (!list) return [];
  return Array.from(list.querySelectorAll('.act-input')).map(i => i.value.trim()).filter(Boolean);
}

function collectData() {
  // Sarana: split by comma and trim
  const parseSarana = (id) => ($$(id + '-sarana').length
    ? []
    : ($(id + '-sarana') ? $(id + '-sarana').value.split(',').map(s => s.trim()).filter(Boolean) : []));

  const p1Sarana = $('p1-sarana') ? $('p1-sarana').value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const p2Sarana = $('p2-sarana') ? $('p2-sarana').value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const p3Sarana = $('p3-sarana') ? $('p3-sarana').value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const p4Sarana = $('p4-sarana') ? $('p4-sarana').value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const p5Sarana = $('p5-sarana') ? $('p5-sarana').value.split(',').map(s => s.trim()).filter(Boolean) : [];

  // TTD Tanggal format
  const rawDate = $('ttd-tanggal') ? $('ttd-tanggal').value : '';
  let formattedDate = '';
  if (rawDate) {
    const d = new Date(rawDate + 'T00:00:00');
    formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } else {
    const d = new Date();
    formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return {
    // IDENTITAS
    namaSekolah: $('nama-sekolah').value.trim() || 'Nama Sekolah',
    judulRpp: $('judul-rpp').value.trim() || 'Rencana Pelaksanaan Pembelajaran (RPP) Wafa',
    buku: $('buku').value.trim() || '-',
    aspek: $('aspek').value.trim() || 'Membaca',
    materi: $('materi').value.trim() || '-',
    indikator: $('indikator').value.trim() || '-',
    pertemuan: $('pertemuan').value || '1',
    kelas: $('kelas').value || '4',
    semester: $('semester').value || '1',
    waktuTotal: $('waktu-total').value || '50',
    // P1
    p1Activities: getListValues('p1-list'),
    p1Sarana,
    p1Waktu: $('p1-waktu').value || '5',
    // P2
    p2Activities: getListValues('p2-list'),
    p2Sarana,
    p2Waktu: $('p2-waktu').value || '5',
    // P3
    p3Sub: $('p3-sub').value.trim() || 'Penanaman Konsep',
    p3Penjelasan: $('p3-penjelasan').value.trim() || '',
    p3Pengulangan: $('p3-pengulangan').value.trim() || '',
    p3Catatan: $('p3-catatan').value.trim() || '',
    p3TiruSteps: getListValues('p3-tiru-list'),
    p3Sarana,
    p3Waktu: $('p3-waktu').value || '20',
    // P4
    p4Sub: $('p4-sub').value.trim() || 'Baca Simak Klasikal (BSK)',
    p4Activities: getListValues('p4-list'),
    p4Sarana,
    p4Waktu: $('p4-waktu').value || '15',
    // P5
    p5Activities: getListValues('p5-list'),
    p5Sarana,
    p5Waktu: $('p5-waktu').value || '5',
    // TTD
    ttdKota: $('ttd-kota').value.trim() || '',
    ttdTanggal: formattedDate,
    ksJabatan: $('ks-jabatan').value.trim() || 'Kepala Sekolah',
    ksNama: $('ks-nama').value.trim() || '...................................',
    ksNip: $('ks-nip').value.trim() || '',
    guruNama: $('guru-nama').value.trim() || '...................................',
    guruNip: $('guru-nip').value.trim() || '',
  };
}

// ============================================================
// TEMPLATE ENGINE — Build Wafa RPP HTML
// ============================================================
function buildSaranaCell(items) {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `<div class="sarana-stack">${items.map(s => `<div class="sarana-item">${s}</div>`).join('')}</div>`;
}

function buildAlphaList(items) {
  if (!items || items.length === 0) return '';
  return `<ul class="keg-alpha-list">${items.map((item, i) => `<li><strong>${String.fromCharCode(97 + i)}.</strong> ${escHtml(item)}</li>`).join('')}</ul>`;
}

function buildBulletList(items) {
  if (!items || items.length === 0) return '';
  return `<ul class="keg-bullet-list">${items.map(item => `<li>${escHtml(item)}</li>`).join('')}</ul>`;
}

function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildP3Cell(d) {
  let html = `<div class="keg-p3-head">${escHtml(d.p3Sub)}</div>`;

  if (d.p3Penjelasan) {
    html += `<p style="margin:3px 0"><strong>a. Penjelasan</strong> : "${escHtml(d.p3Penjelasan)}"</p>`;
  }
  if (d.p3Pengulangan) {
    html += `<p style="margin:3px 0"><strong>b. Pengulangan</strong> : ${escHtml(d.p3Pengulangan)}</p>`;
  }
  if (d.p3Catatan) {
    html += `<p class="keg-note" style="margin:5px 0"><span class="keg-note-label">Catatan</span> : ${escHtml(d.p3Catatan)}</p>`;
  }
  if (d.p3TiruSteps && d.p3TiruSteps.length > 0) {
    html += `<p class="keg-practice-head">Perbanyak Latihan dengan bertahap dan pengulangan</p>`;
    html += buildBulletList(d.p3TiruSteps);
  }
  return html;
}

function buildP4Cell(d) {
  let html = `<div class="keg-p3-head">${escHtml(d.p4Sub)}</div>`;
  html += buildBulletList(d.p4Activities);
  return html;
}

function buildP5Cell(d) {
  if (!d.p5Activities || d.p5Activities.length === 0) return '-';
  return buildAlphaList(d.p5Activities);
}

function buildRPPHtml(d) {
  // Logo
  const logoData = localStorage.getItem(LOGO_KEY);
  const logoHtml = logoData
    ? `<img src="${logoData}" alt="Logo" style="width:44px;height:44px;object-fit:contain;border-radius:4px;" />`
    : `<div class="wafa-logo-box">W</div>`;

  const tanggalStr = d.ttdKota ? `${d.ttdKota}, ${d.ttdTanggal}` : d.ttdTanggal;

  const sigRow = `
    <div class="wafa-footer">
      <div class="wafa-sig-row">
        <div class="wafa-sig-block">
          <div>Mengetahui,</div>
          <div>${escHtml(d.ksJabatan)}</div>
          <div class="wafa-sig-name">${escHtml(d.ksNama)}</div>
          ${d.ksNip ? `<div class="wafa-sig-nip">NIP. ${escHtml(d.ksNip)}</div>` : ''}
        </div>
        <div class="wafa-sig-block">
          <div>${tanggalStr}</div>
          <div>Guru Wafa</div>
          <div class="wafa-sig-name">${escHtml(d.guruNama)}</div>
          ${d.guruNip ? `<div class="wafa-sig-nip">${escHtml(d.guruNip)}</div>` : ''}
        </div>
      </div>
    </div>`;

  return `
    <!-- TITLE -->
    <div class="wafa-doc-title">${escHtml(d.judulRpp)}</div>

    <!-- IDENTITY TABLE -->
    <table class="wafa-identity-section">
      <tr>
        <td class="wafa-logo-cell">
          ${logoHtml}
        </td>
        <td>
          <table class="wafa-id-table">
            <tr>
              <td class="wafa-id-label">Buku</td>
              <td class="wafa-id-colon">:</td>
              <td class="wafa-id-value">${escHtml(d.buku)}</td>
              <td class="wafa-id-label">Pertemuan</td>
              <td class="wafa-id-colon">:</td>
              <td>${escHtml(d.pertemuan)}</td>
            </tr>
            <tr>
              <td class="wafa-id-label">Aspek</td>
              <td class="wafa-id-colon">:</td>
              <td class="wafa-id-value">${escHtml(d.aspek)}</td>
              <td class="wafa-id-label">Kelas</td>
              <td class="wafa-id-colon">:</td>
              <td>${escHtml(d.kelas)}</td>
            </tr>
            <tr>
              <td class="wafa-id-label">Materi</td>
              <td class="wafa-id-colon">:</td>
              <td class="wafa-id-value">${escHtml(d.materi)}</td>
              <td class="wafa-id-label">Semester</td>
              <td class="wafa-id-colon">:</td>
              <td>${escHtml(d.semester)}</td>
            </tr>
            <tr>
              <td class="wafa-id-label">Indikator</td>
              <td class="wafa-id-colon">:</td>
              <td class="wafa-id-value" colspan="4" style="white-space:pre-wrap">${escHtml(d.indikator)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- MAIN 5P TABLE -->
    <table class="wafa-main-table">
      <thead>
        <tr>
          <th class="col-sp" style="width:6%">5<br>P</th>
          <th class="col-kegiatan" style="width:70%">KEGIATAN</th>
          <th class="col-sarana" style="width:14%">SARANA</th>
          <th class="col-waktu" style="width:10%">WAKTU</th>
        </tr>
      </thead>
      <tbody>

        <!-- P1 -->
        <tr>
          <td class="col-sp">P1</td>
          <td class="col-kegiatan">
            ${buildAlphaList(d.p1Activities)}
          </td>
          <td class="col-sarana">${buildSaranaCell(d.p1Sarana)}</td>
          <td class="col-waktu">${escHtml(d.p1Waktu)}'</td>
        </tr>

        <!-- P2 -->
        <tr>
          <td class="col-sp">P2</td>
          <td class="col-kegiatan">
            ${buildAlphaList(d.p2Activities)}
          </td>
          <td class="col-sarana">${buildSaranaCell(d.p2Sarana)}</td>
          <td class="col-waktu">${escHtml(d.p2Waktu)}'</td>
        </tr>

        <!-- P3 -->
        <tr>
          <td class="col-sp">P3</td>
          <td class="col-kegiatan">${buildP3Cell(d)}</td>
          <td class="col-sarana">${buildSaranaCell(d.p3Sarana)}</td>
          <td class="col-waktu">${escHtml(d.p3Waktu)}'</td>
        </tr>

        <!-- P4 -->
        <tr>
          <td class="col-sp">P4</td>
          <td class="col-kegiatan">${buildP4Cell(d)}</td>
          <td class="col-sarana">${buildSaranaCell(d.p4Sarana)}</td>
          <td class="col-waktu">${escHtml(d.p4Waktu)}'</td>
        </tr>

        <!-- P5 -->
        <tr>
          <td class="col-sp">P5</td>
          <td class="col-kegiatan">${buildP5Cell(d)}</td>
          <td class="col-sarana">${buildSaranaCell(d.p5Sarana)}</td>
          <td class="col-waktu">${escHtml(d.p5Waktu)}'</td>
        </tr>

      </tbody>
    </table>

    <!-- FOOTER / TTD -->
    ${sigRow}
  `;
}

// ============================================================
// GENERATE & PREVIEW
// ============================================================
let currentPreviewId = null;

function updatePreviewHtml(overrides = null) {
  const d = collectData();
  if (overrides) Object.assign(d, overrides);
  const html = buildRPPHtml(d);
  const doc = $('rpp-document');
  const empty = $('empty-state');
  doc.innerHTML = html;
  doc.contentEditable = 'true';
  doc.style.outline = 'none';
  doc.style.display = 'block';
  empty.style.display = 'none';
}

function generateAndShow(overrides = null) {
  updatePreviewHtml(overrides);
  currentPreviewId = null;
  
  if ($('btn-save-kantong')) $('btn-save-kantong').style.display = 'inline-flex';
  if ($('btn-edit-kantong')) $('btn-edit-kantong').style.display = 'none';
  
  // Switch view to preview
  document.querySelector('.panel-form').style.display = 'none';
  $('panel-preview').style.display = 'flex';
  
  $('preview-body').scrollTop = 0;
}

$('btn-back-edit')?.addEventListener('click', () => {
  document.querySelector('.panel-form').style.display = 'flex';
  $('panel-preview').style.display = 'none';
});

$('btn-generate').addEventListener('click', () => {
  generateAndShow();
  showToast('✅ RPP berhasil di-generate!', 'success');
});

// Live update debounce
let previewDebounce;
function schedulePreviewUpdate() {
  if ($('rpp-document').style.display !== 'block') return;
  clearTimeout(previewDebounce);
  previewDebounce = setTimeout(() => updatePreviewHtml(), 700);
}

// Attach live update to all form inputs
document.querySelectorAll('#panel-0 input, #panel-0 select, #panel-0 textarea, #panel-1 input, #panel-1 select, #panel-1 textarea, #panel-2 input, #panel-2 select, #panel-2 textarea, #panel-3 input, #panel-3 select, #panel-3 textarea').forEach(el => {
  if (el.id !== 'gemini-api-key') {
    el.addEventListener('input', schedulePreviewUpdate);
  }
});

// Also on document input for dynamically added items
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('act-input')) schedulePreviewUpdate();
});

// ============================================================
// RESET
// ============================================================
$('btn-reset').addEventListener('click', () => {
  if (!confirm('Reset semua form dan preview?')) return;

  // Reset all text inputs and textareas
  $$('#panel-0 input[type="text"], #panel-0 input[type="number"], #panel-0 textarea').forEach(el => el.value = '');
  $$('#panel-1 input[type="text"], #panel-1 input[type="number"], #panel-1 textarea').forEach(el => el.value = '');
  $$('#panel-2 input[type="text"], #panel-2 input[type="number"], #panel-2 textarea').forEach(el => el.value = '');
  $$('#panel-3 input[type="text"], #panel-3 input[type="number"], #panel-3 textarea').forEach(el => el.value = '');

  // Restore defaults
  $('judul-rpp').value = 'Rencana Pelaksanaan Pembelajaran (RPP) Wafa Buku Tilawah 3';
  $('aspek').value = 'Membaca';
  $('semester').value = '1';
  $('waktu-total').value = '50';
  $('pertemuan').value = '1';
  $('kelas').value = '4';
  $('p1-waktu').value = '5';
  $('p2-waktu').value = '5';
  $('p3-waktu').value = '20';
  $('p4-waktu').value = '15';
  $('p5-waktu').value = '5';
  $('p3-sub').value = 'Penanaman Konsep';
  $('p4-sub').value = 'Baca Simak Klasikal (BSK)';

  // Reset lists to defaults
  $('p1-list').innerHTML = `
    <div class="activity-item"><span class="act-label alpha">a.</span><input type="text" class="act-input" value="" placeholder="Contoh: Guru mengucapkan salam" /><button class="btn-act-rm">×</button></div>`;
  $('p2-list').innerHTML = `
    <div class="activity-item"><span class="act-label alpha">a.</span><input type="text" class="act-input" value="" placeholder="Contoh: Apersepsi materi" /><button class="btn-act-rm">×</button></div>`;
  $('p3-tiru-list').innerHTML = `
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="" placeholder="Contoh: Baca Tiru 2 baris..." /><button class="btn-act-rm">×</button></div>`;
  $('p4-list').innerHTML = `
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="" placeholder="Isi kegiatan BSK/BSP..." /><button class="btn-act-rm">×</button></div>`;
  $('p5-list').innerHTML = `
    <div class="activity-item"><span class="act-label alpha">a.</span><input type="text" class="act-input" value="" placeholder="Contoh: Doa penutup dan salam" /><button class="btn-act-rm">×</button></div>`;

  ['p1-list', 'p2-list', 'p3-tiru-list', 'p4-list', 'p5-list'].forEach(id => refreshListLabels($(id)));

  // Reset preview
  $('rpp-document').style.display = 'none';
  $('rpp-document').innerHTML = '';
  $('empty-state').style.display = 'flex';
  
  document.querySelector('.panel-form').style.display = 'flex';
  $('panel-preview').style.display = 'none';
  
  switchTab(0);
  showToast('🔄 Form berhasil direset secara menyeluruh', 'info');
});

// ============================================================
// SMART RESET
// ============================================================
$('btn-smart-reset')?.addEventListener('click', () => {
  if (!confirm('Bersihkan data materi dan kegiatan (Identitas, Kelas, TTD akan tetap aman)?')) return;

  // Clear specific form inputs
  $('materi').value = '';
  $('indikator').value = '';
  
  const currentPertemuan = parseInt($('pertemuan').value) || 0;
  $('pertemuan').value = currentPertemuan + 1;

  $('p3-penjelasan').value = '';
  $('p3-pengulangan').value = '';
  $('p3-catatan').value = '';

  // Clear all dynamic lists to empty defaults
  $('p1-list').innerHTML = `<div class="activity-item"><span class="act-label alpha">a.</span><input type="text" class="act-input" value="" placeholder="Contoh: Guru mengucapkan salam" /><button class="btn-act-rm">×</button></div>`;
  $('p2-list').innerHTML = `<div class="activity-item"><span class="act-label alpha">a.</span><input type="text" class="act-input" value="" placeholder="Contoh: Apersepsi materi" /><button class="btn-act-rm">×</button></div>`;
  $('p3-tiru-list').innerHTML = `<div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="" placeholder="Contoh: Baca Tiru 2 baris..." /><button class="btn-act-rm">×</button></div>`;
  $('p4-list').innerHTML = `<div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="" placeholder="Isi kegiatan BSK/BSP..." /><button class="btn-act-rm">×</button></div>`;
  $('p5-list').innerHTML = `<div class="activity-item"><span class="act-label alpha">a.</span><input type="text" class="act-input" value="" placeholder="Contoh: Doa penutup dan salam" /><button class="btn-act-rm">×</button></div>`;

  ['p1-list', 'p2-list', 'p3-tiru-list', 'p4-list', 'p5-list'].forEach(id => refreshListLabels($(id)));

  // Reset preview panel
  $('rpp-document').style.display = 'none';
  $('rpp-document').innerHTML = '';
  $('empty-state').style.display = 'flex';
  
  switchTab(0);
  showToast('✨ Form dibersihkan! Identitas dipertahankan', 'success');
});

// ============================================================
// EXPORT / PRINT
// ============================================================
$('btn-export').addEventListener('click', () => {
  if (!$('rpp-document').innerHTML.trim()) {
    showToast('⚠️ Generate RPP terlebih dahulu!', 'error');
    return;
  }
  window.print();
});

// ============================================================
// COPY TEXT
// ============================================================
$('btn-copy').addEventListener('click', () => {
  const doc = $('rpp-document');
  if (!doc.textContent.trim()) { showToast('⚠️ Generate RPP terlebih dahulu!', 'error'); return; }
  navigator.clipboard.writeText(doc.innerText).then(() => showToast('📋 Teks berhasil disalin!', 'success')).catch(() => showToast('Gagal menyalin', 'error'));
});



// ============================================================
// KANTONG — Sistem Multi-Halaman RPP
// ============================================================

function getKantong() {
  try { return JSON.parse(localStorage.getItem(KANTONG_KEY) || '[]'); }
  catch { return []; }
}
function saveKantong(pages) {
  localStorage.setItem(KANTONG_KEY, JSON.stringify(pages));
}

/** Tambah halaman aktif ke kantong */
function addToKantong() {
  const doc = $('rpp-document');
  if (!doc || !doc.innerHTML.trim() || doc.style.display === 'none') {
    showToast('\u26a0\ufe0f Generate RPP terlebih dahulu!', 'error'); return;
  }
  const d = collectData();
  const pages = getKantong();
  const n = pages.length + 1;
  // Buat label otomatis dari form data
  const label = `P.${d.pertemuan}${d.materi ? ' \u2014 ' + d.materi : ''}${d.kelas ? ' (Kls.' + d.kelas + ')' : ''}`;
  pages.push({
    id: Date.now(),
    label,
    formData: d, // simpan data form agar bisa diload kembali
    content: doc.innerHTML, // simpan HTML agar editan langsung tersimpan
    savedAt: new Date().toLocaleString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
  });
  saveKantong(pages);
  renderKantong();
  showToast(`\u2705 Halaman ${n} disimpan! (${label})`, 'success');
}

/** Hapus satu halaman dari kantong */
function deleteFromKantong(id) {
  const pages = getKantong().filter(p => p.id !== Number(id));
  saveKantong(pages);
  renderKantong();
  showToast('\ud83d\uddd1\ufe0f Halaman dihapus dari kantong', 'info', 2000);
}
window.deleteFromKantong = deleteFromKantong;

/** Muat data kantong kembali ke form (Duplikasi/Copy) */
function loadPageToForm(id) {
  const page = getKantong().find(p => p.id === Number(id));
  if (!page) return;
  if (!confirm(`Timpakan data dari "${page.label}" ke form saat ini? Data yang belum di-generate mungkin hilang.`)) return;

  const d = page.formData;
  
  // Text Inputs
  $('materi').value = d.materi || '';
  $('indikator').value = d.indikator || '';
  $('pertemuan').value = d.pertemuan || '1';
  $('kelas').value = d.kelas || '';
  $('semester').value = d.semester || '1';
  $('waktu-total').value = d.waktuTotal || '50';
  
  $('p1-waktu').value = d.p1Waktu || '5';
  $('p2-waktu').value = d.p2Waktu || '5';
  $('p3-sub').value = d.p3Sub || 'Penanaman Konsep';
  $('p3-penjelasan').value = d.p3Penjelasan || '';
  $('p3-pengulangan').value = d.p3Pengulangan || '';
  $('p3-catatan').value = d.p3Catatan || '';
  $('p3-waktu').value = d.p3Waktu || '20';
  $('p4-waktu').value = d.p4Waktu || '15';
  $('p5-waktu').value = d.p5Waktu || '5';
  
  // TTD
  if (d.ttdKota !== undefined) $('ttd-kota').value = d.ttdKota;
  if (d.ttdTanggal !== undefined) $('ttd-tanggal').value = d.ttdTanggal;
  if (d.ksJabatan !== undefined) $('ks-jabatan').value = d.ksJabatan;
  if (d.ksNama !== undefined) $('ks-nama').value = d.ksNama;
  if (d.ksNip !== undefined) $('ks-nip').value = d.ksNip;
  if (d.guruNama !== undefined) $('guru-nama').value = d.guruNama;
  if (d.guruNip !== undefined) $('guru-nip').value = d.guruNip;

  // Lists
  const renderList = (idStr, acts, type = 'bullet') => {
    const list = $(idStr);
    if (!list) return;
    list.innerHTML = '';
    if (!acts || !acts.length) acts = [''];
    acts.forEach((act, i) => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      let labelHtml = type === 'bullet' ? '<span class="act-label bullet">•</span>' : `<span class="act-label alpha">${String.fromCharCode(97 + i)}.</span>`;
      item.innerHTML = `${labelHtml}<input type="text" class="act-input" value="${act.replace(/"/g, '&quot;')}" /><button class="btn-act-rm">×</button>`;
      list.appendChild(item);
    });
    refreshListLabels(list);
  };

  renderList('p1-list', d.p1Activities, 'alpha');
  renderList('p2-list', d.p2Activities, 'alpha');
  renderList('p3-tiru-list', d.p3TiruSteps, 'bullet');
  renderList('p4-list', d.p4Activities, 'bullet');
  renderList('p5-list', d.p5Activities, 'alpha');
  
  // BSK / BSP
  if (d.p4Sub && d.p4Sub.includes('BSP')) {
    if (typeof switchP4Mode === 'function') switchP4Mode('BSP');
  } else {
    if (typeof switchP4Mode === 'function') switchP4Mode('BSK');
  }
  
  // Go back to form
  document.querySelector('.panel-form').style.display = 'flex';
  $('panel-preview').style.display = 'none';
  switchTab(0);
  
  showToast(`📋 Berhasil memuat data dari Kantong!`, 'success');
}
window.loadPageToForm = loadPageToForm;

/** Preview satu halaman tertentu dari kantong */
function previewSinglePage(id) {
  const page = getKantong().find(p => p.id === Number(id));
  if (!page) return;
  const html = page.content || buildRPPHtml(page.formData);
  const doc = $('rpp-document');
  doc.innerHTML = html;
  doc.contentEditable = 'true';
  doc.style.outline = 'none';
  doc.className = 'rpp-document';
  doc.style.display = 'block';
  $('empty-state').style.display = 'none';
  $('preview-body').scrollTop = 0;
  
  // Switch view to preview
  document.querySelector('.panel-form').style.display = 'none';
  $('panel-preview').style.display = 'flex';
  
  currentPreviewId = id;
  if ($('btn-save-kantong')) $('btn-save-kantong').style.display = 'none';
  if ($('btn-edit-kantong')) $('btn-edit-kantong').style.display = 'inline-flex';
  
  showToast(`👁️ Preview: ${page.label}`, 'info', 2000);
}
window.previewSinglePage = previewSinglePage;

/** Preview semua halaman yang ada di kantong */
function previewAllPages() {
  const pages = getKantong();
  if (!pages.length) { showToast('Kantong masih kosong!', 'error'); return; }
  const allHtml = pages.map((p, i) => `
    <div class="rpp-page-wrapper">${p.content || buildRPPHtml(p.formData)}</div>
    ${i < pages.length - 1 ? `<div class="rpp-page-break" contenteditable="false"><span>― Halaman ${i + 2} ―</span></div>` : ''}
  `).join('');
  const doc = $('rpp-document');
  doc.innerHTML = allHtml;
  doc.contentEditable = 'true';
  doc.style.outline = 'none';
  doc.className = 'rpp-document multi-page';
  doc.style.display = 'block';
  $('empty-state').style.display = 'none';
  $('preview-body').scrollTop = 0;
  
  // Switch view to preview
  document.querySelector('.panel-form').style.display = 'none';
  $('panel-preview').style.display = 'flex';
  
  currentPreviewId = null;
  if ($('btn-save-kantong')) $('btn-save-kantong').style.display = 'none';
  if ($('btn-edit-kantong')) $('btn-edit-kantong').style.display = 'none';
  
  showToast(`👁️ Menampilkan ${pages.length} halaman RPP`, 'success');
}

/** Cetak semua halaman (PDF) */
function printAllPages() {
  const pages = getKantong();
  if (!pages.length) { showToast('Kantong masih kosong!', 'error'); return; }
  previewAllPages();
  setTimeout(() => window.print(), 500);
}

/** Export semua halaman ke Word (.doc) */
function exportToWord() {
  const pages = getKantong();
  if (!pages.length) { showToast('Kantong masih kosong!', 'error'); return; }

  const wordStyle = `<style>
    body{font-family:Arial,sans-serif;font-size:11pt;margin:2cm 2.5cm;}
    table{border-collapse:collapse;width:100%;}
    td,th{border:1px solid #1a1a1a;padding:6px 9px;vertical-align:top;}
    th{font-weight:bold;text-align:center;}
    .wafa-doc-title{text-align:center;font-size:12pt;font-weight:bold;margin-bottom:14px;}
    .wafa-identity-section,.wafa-id-table{width:100%;border-collapse:collapse;border:none;}
    .wafa-identity-section td,.wafa-id-table td{border:none;padding:2px 4px;}
    .wafa-logo-box{width:44px;height:44px;background:#10b981;display:inline-block;text-align:center;line-height:44px;font-size:20px;font-weight:bold;color:white;border-radius:4px;}
    .wafa-sig-row{display:flex;justify-content:space-between;margin-top:10px;}
    .wafa-sig-block{text-align:center;width:45%;}
    .wafa-sig-name{font-weight:bold;border-top:1px solid #1a1a1a;padding-top:4px;margin-top:52px;}
    .wafa-sig-nip{font-size:10pt;color:#444;}
    .keg-alpha-list,.keg-bullet-list{padding:0;margin:4px 0;list-style:none;}
    .keg-bullet-list li{padding-left:12px;position:relative;}
    .keg-bullet-list li::before{content:'\u2022 ';}
    .keg-p3-head,.keg-note-label,.keg-practice-head{font-weight:bold;}
    .col-sp{text-align:center;font-weight:bold;}
    .col-sarana{text-align:center;}
    .col-waktu{text-align:center;font-weight:bold;}
    .wafa-main-table{border:1.5px solid #1a1a1a;}
    .sarana-stack{display:flex;flex-direction:column;gap:3px;}
    .sarana-item{border-bottom:1px solid #eee;padding-bottom:2px;}
    .sarana-item:last-child{border-bottom:none;}
  </style>`;

  const allPages = pages.map((p, i) => `
    <div>${p.content || buildRPPHtml(p.formData)}</div>
    ${i < pages.length - 1 ? '<div style="page-break-after:always"></div>' : ''}
  `).join('');

  const fullHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'/>${wordStyle}</head><body>${allPages}</body></html>`;

  const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const p0 = pages[0]?.formData;
  a.download = `RPP_Wafa${p0?.materi ? '_' + p0.materi.replace(/\s+/g, '_') : ''}_${pages.length}hal.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  showToast(`\ud83d\udcc4 File Word (${pages.length} halaman) berhasil diunduh!`, 'success');
}

/** Render daftar chip di kantong-chips */
function renderKantong() {
  const pages = getKantong();
  const badge = $('kantong-badge');
  const chips = $('kantong-chips');
  const actionIds = ['btn-preview-all', 'btn-export-word', 'btn-print-all', 'btn-clear-kantong'];

  if (badge) {
    badge.textContent = pages.length;
    badge.style.background = pages.length > 0 ? '' : 'var(--clr-text-muted)';
  }
  actionIds.forEach(id => { const el = $(id); if (el) el.disabled = pages.length === 0; });

  if (!chips) return;
  if (pages.length === 0) {
    chips.innerHTML = '<p class="kantong-empty">Belum ada halaman. Generate RPP lalu klik \u201c\ud83d\udcbe Simpan ke Kantong\u201d.</p>';
    return;
  }

  chips.innerHTML = pages.map((p, i) => `
    <div class="kantong-chip" id="chip-${p.id}">
      <div class="chip-num">${i + 1}</div>
      <div class="chip-info">
        <span class="chip-label" title="${p.label}">${p.label}</span>
        <span class="chip-time">${p.savedAt}</span>
      </div>
      <div class="chip-actions">
        <button class="btn-chip-load" onclick="loadPageToForm(${p.id})" title="Copy / Muat ke Form">📝</button>
        <button class="btn-chip-view" onclick="previewSinglePage(${p.id})" title="Preview halaman ini">👁</button>
        <button class="btn-chip-del" onclick="if(confirm('Hapus halaman ini dari kantong?')) deleteFromKantong(${p.id})" title="Hapus">×</button>
      </div>
    </div>
  `).join('');
}

// Wire up kantong buttons
$('btn-save-kantong')?.addEventListener('click', addToKantong);
$('btn-edit-kantong')?.addEventListener('click', () => {
  if (currentPreviewId) loadPageToForm(currentPreviewId);
});
$('btn-preview-all')?.addEventListener('click', previewAllPages);
$('btn-print-all')?.addEventListener('click', printAllPages);
$('btn-export-word')?.addEventListener('click', exportToWord);
$('btn-clear-kantong')?.addEventListener('click', () => {
  if (confirm('Hapus semua halaman di kantong?')) {
    saveKantong([]); renderKantong();
  }
});

// Autosave manual edits in preview
$('rpp-document')?.addEventListener('input', () => {
  if (currentPreviewId && currentPreviewId !== 'all') {
    const pages = getKantong();
    const idx = pages.findIndex(p => p.id === currentPreviewId);
    if (idx !== -1) {
      pages[idx].content = $('rpp-document').innerHTML;
      saveKantong(pages);
    }
  }
});

// ============================================================
// INIT
// ============================================================
loadApiKey();
loadLogo();
renderKantong();
switchTab(0);

// Initialize all existing lists (after BSK/BSP setup)
['p1-list', 'p2-list', 'p3-tiru-list', 'p4-list', 'p5-list'].forEach(id => {
  const el = $(id);
  if (el) refreshListLabels(el);
});


// Set today as default date
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
$('ttd-tanggal').value = `${yyyy}-${mm}-${dd}`;

console.log('%c📋 Tools RPP Wafa Ready!', 'color:#10b981;font-size:14px;font-weight:bold');
