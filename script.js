/**
 * ============================================================
 * TOOLS RPP WAFA — Generator RPP Format 5P
 * Template Engine: Identitas → P1-P5 → Tanda Tangan
 * ============================================================
 */
"use strict";

const DRAFT_KEY = 'tools_rpp_wafa_draft';
const DRAFT_PREVIEW_KEY = 'tools_rpp_wafa_preview';
const DRAFT_VIEW_KEY = 'tools_rpp_wafa_view';
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
        if (listEl.children.length > 1) {
          item.remove();
          refreshListLabels(listEl);
        }
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
// AUTO-SAVE DRAFT
// ============================================================
const DRAFT_SAVE_DELAY = 800;
let draftDebounce;

function saveDraft() {
  clearTimeout(draftDebounce);
  draftDebounce = setTimeout(() => {
    try {
      const draft = {
        namaSekolah: $('nama-sekolah')?.value || '',
        judulRpp:    $('judul-rpp')?.value || '',
        buku:        $('buku')?.value || '',
        aspek:       $('aspek')?.value || '',
        materi:      $('materi')?.value || '',
        indikator:   $('indikator')?.value || '',
        pertemuan:   $('pertemuan')?.value || '1',
        kelas:       $('kelas')?.value || '4',
        semester:    $('semester')?.value || '1',
        waktuTotal:  $('waktu-total')?.value || '50',
        p1Sarana:    $('p1-sarana')?.value || '',
        p1Waktu:     $('p1-waktu')?.value || '5',
        p2Sarana:    $('p2-sarana')?.value || '',
        p2Waktu:     $('p2-waktu')?.value || '5',
        p3Sub:       $('p3-sub')?.value || '',
        p3Penjelasan:$('p3-penjelasan')?.value || '',
        p3Pengulangan:$('p3-pengulangan')?.value || '',
        p3Catatan:   $('p3-catatan')?.value || '',
        p3Sarana:    $('p3-sarana')?.value || '',
        p3Waktu:     $('p3-waktu')?.value || '20',
        p4Sub:       $('p4-sub')?.value || '',
        p4Sarana:    $('p4-sarana')?.value || '',
        p4Waktu:     $('p4-waktu')?.value || '15',
        p4Mode:      p4Mode,
        p5Sarana:    $('p5-sarana')?.value || '',
        p5Waktu:     $('p5-waktu')?.value || '5',
        ttdKota:     $('ttd-kota')?.value || '',
        ttdTanggal:  $('ttd-tanggal')?.value || '',
        ksJabatan:   $('ks-jabatan')?.value || '',
        ksNama:      $('ks-nama')?.value || '',
        ksNip:       $('ks-nip')?.value || '',
        guruNama:    $('guru-nama')?.value || '',
        guruNip:     $('guru-nip')?.value || '',
        // Activity lists saved as arrays
        p1List:      getListValues('p1-list'),
        p2List:      getListValues('p2-list'),
        p3TiruList:  getListValues('p3-tiru-list'),
        p4List:      getListValues('p4-list'),
        p5List:      getListValues('p5-list'),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch(e) { console.warn('Gagal menyimpan draft:', e); }
  }, DRAFT_SAVE_DELAY);
}

function restoreList(listId, values, type) {
  const list = $(listId);
  if (!list || !values || values.length === 0) return;
  list.innerHTML = '';
  values.forEach((val) => {
    const count = list.querySelectorAll('.activity-item').length;
    const labelText = type === 'bullet' ? '•' : String.fromCharCode(97 + count) + '.';
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="act-label${type === 'bullet' ? ' bullet' : ''}">${labelText}</span>
      <input type="text" class="act-input" value="${val.replace(/"/g, '&quot;')}" />
      <button class="btn-act-rm">&times;</button>
    `;
    list.appendChild(item);
  });
  refreshListLabels(list);
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);

    // Restore simple text/number/select fields
    const fields = [
      'nama-sekolah','judul-rpp','buku','aspek','materi','indikator',
      'pertemuan','kelas','waktu-total',
      'p1-sarana','p1-waktu','p2-sarana','p2-waktu',
      'p3-sub','p3-penjelasan','p3-pengulangan','p3-catatan','p3-sarana','p3-waktu',
      'p4-sub','p4-sarana','p4-waktu',
      'p5-sarana','p5-waktu',
      'ttd-kota','ttd-tanggal','ks-jabatan','ks-nama','ks-nip','guru-nama','guru-nip',
    ];
    const keyMap = {
      'nama-sekolah':'namaSekolah','judul-rpp':'judulRpp','buku':'buku',
      'aspek':'aspek','materi':'materi','indikator':'indikator',
      'pertemuan':'pertemuan','kelas':'kelas','waktu-total':'waktuTotal',
      'p1-sarana':'p1Sarana','p1-waktu':'p1Waktu',
      'p2-sarana':'p2Sarana','p2-waktu':'p2Waktu',
      'p3-sub':'p3Sub','p3-penjelasan':'p3Penjelasan','p3-pengulangan':'p3Pengulangan',
      'p3-catatan':'p3Catatan','p3-sarana':'p3Sarana','p3-waktu':'p3Waktu',
      'p4-sub':'p4Sub','p4-sarana':'p4Sarana','p4-waktu':'p4Waktu',
      'p5-sarana':'p5Sarana','p5-waktu':'p5Waktu',
      'ttd-kota':'ttdKota','ttd-tanggal':'ttdTanggal',
      'ks-jabatan':'ksJabatan','ks-nama':'ksNama','ks-nip':'ksNip',
      'guru-nama':'guruNama','guru-nip':'guruNip',
    };
    fields.forEach(id => {
      const key = keyMap[id];
      if (d[key] !== undefined && $(id)) $(id).value = d[key];
    });
    // Semester (select)
    if (d.semester !== undefined && $('semester')) $('semester').value = d.semester;

    // Restore activity lists
    if (d.p1List?.length)      restoreList('p1-list',      d.p1List,      'alpha');
    if (d.p2List?.length)      restoreList('p2-list',      d.p2List,      'alpha');
    if (d.p3TiruList?.length)  restoreList('p3-tiru-list', d.p3TiruList,  'bullet');
    if (d.p4List?.length)      restoreList('p4-list',      d.p4List,      'bullet');
    if (d.p5List?.length)      restoreList('p5-list',      d.p5List,      'alpha');

    // Restore P4 mode (skip confirm)
    if (d.p4Mode && d.p4Mode !== p4Mode) switchP4Mode(d.p4Mode, true);
    // Override sub after mode switch
    if (d.p4Sub && $('p4-sub')) $('p4-sub').value = d.p4Sub;

    // Restore preview state if user was in preview mode
    const view = localStorage.getItem(DRAFT_VIEW_KEY);
    if (view === 'preview') {
      const previewHtml = localStorage.getItem(DRAFT_PREVIEW_KEY);
      if (previewHtml) {
        const doc = $('rpp-document');
        const empty = $('empty-state');
        doc.innerHTML = previewHtml;
        doc.style.display = 'block';
        empty.style.display = 'none';
        document.querySelector('.panel-form').style.display = 'none';
        $('panel-preview').style.display = 'flex';
        $('preview-body').scrollTop = 0;
      }
    }

    updateTimeIndicator();
    showToast('\ud83d\udcbe Draft tersimpan berhasil dimuat!', 'info', 3000);
  } catch(e) { console.warn('Gagal memuat draft:', e); }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(DRAFT_PREVIEW_KEY);
  localStorage.removeItem(DRAFT_VIEW_KEY);
}


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
          <div style="text-align:right;font-style:normal">${tanggalStr}</div>
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
function updateRPPContent() {
  const html = buildRPPHtml(collectData());
  const doc = $('rpp-document');
  doc.innerHTML = html;
}

function generateAndShow(overrides = null) {
  const d = collectData();
  if (overrides) Object.assign(d, overrides);
  const html = buildRPPHtml(d);
  const doc = $('rpp-document');
  const empty = $('empty-state');
  doc.innerHTML = html;
  doc.style.display = 'block';
  empty.style.display = 'none';
  
  // Switch view to preview
  document.querySelector('.panel-form').style.display = 'none';
  $('panel-preview').style.display = 'flex';
  
  $('preview-body').scrollTop = 0;

  localStorage.setItem(DRAFT_VIEW_KEY, 'preview');
  localStorage.setItem(DRAFT_PREVIEW_KEY, doc.innerHTML);
}

$('btn-back-edit')?.addEventListener('click', () => {
  document.querySelector('.panel-form').style.display = 'flex';
  $('panel-preview').style.display = 'none';
  localStorage.setItem(DRAFT_VIEW_KEY, 'form');
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
  previewDebounce = setTimeout(() => updateRPPContent(), 700);
}

// Save manual HTML edits directly to preview draft
$('rpp-document')?.addEventListener('input', () => {
  if (localStorage.getItem(DRAFT_VIEW_KEY) === 'preview') {
    localStorage.setItem(DRAFT_PREVIEW_KEY, $('rpp-document').innerHTML);
  }
});

// Attach live update to all form inputs
document.querySelectorAll('#panel-0 input, #panel-0 select, #panel-0 textarea, #panel-1 input, #panel-1 select, #panel-1 textarea, #panel-2 input, #panel-2 select, #panel-2 textarea, #panel-3 input, #panel-3 select, #panel-3 textarea').forEach(el => {
  if (el.id !== 'gemini-api-key') {
    el.addEventListener('input', schedulePreviewUpdate);
  }
});

// Also on document input for dynamically added items
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('act-input')) {
    schedulePreviewUpdate();
    saveDraft();
  }
});

// Attach saveDraft to all form inputs
document.querySelectorAll('#panel-0 input, #panel-0 select, #panel-0 textarea, #panel-1 input, #panel-1 select, #panel-1 textarea, #panel-2 input, #panel-2 select, #panel-2 textarea, #panel-3 input, #panel-3 select, #panel-3 textarea').forEach(el => {
  el.addEventListener('input', saveDraft);
  el.addEventListener('change', saveDraft);
});

// ============================================================
// TIME INDICATOR
// ============================================================
function updateTimeIndicator() {
  const target = parseInt($('waktu-total')?.value) || 50;
  const used = ['p1-waktu','p2-waktu','p3-waktu','p4-waktu','p5-waktu']
    .reduce((sum, id) => sum + (parseInt($(id)?.value) || 0), 0);

  const usedEl    = $('time-used-display');
  const targetEl  = $('time-target-display');
  const badgeEl   = $('time-badge');

  if (usedEl)   usedEl.textContent   = used + "'";
  if (targetEl) targetEl.textContent = target + "'";

  if (badgeEl) {
    const diff = used - target;
    if (diff === 0) {
      badgeEl.textContent = '\u2713 Tepat';
      badgeEl.className   = 'time-badge time-badge-ok';
    } else if (diff > 0) {
      badgeEl.textContent = `+${diff}' Lebih`;
      badgeEl.className   = 'time-badge time-badge-over';
    } else {
      badgeEl.textContent = `${diff}' Kurang`;
      badgeEl.className   = 'time-badge time-badge-under';
    }
  }
}

// Attach time indicator to waktu inputs and target
['waktu-total','p1-waktu','p2-waktu','p3-waktu','p4-waktu','p5-waktu'].forEach(id => {
  $(id)?.addEventListener('input', updateTimeIndicator);
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
  
  clearDraft();
  updateTimeIndicator();
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

  // Reset preview panel and always return to form view
  $('rpp-document').style.display = 'none';
  $('rpp-document').innerHTML = '';
  $('empty-state').style.display = 'flex';
  document.querySelector('.panel-form').style.display = 'flex';
  $('panel-preview').style.display = 'none';
  
  saveDraft();
  updateTimeIndicator();
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
    formData: d, 
    htmlData: doc.innerHTML, // Simpan HTML yang sudah diedit user
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

/** Preview satu halaman tertentu dari kantong */
function previewSinglePage(id) {
  const page = getKantong().find(p => p.id === Number(id));
  if (!page) return;
  const html = page.htmlData || buildRPPHtml(page.formData);
  const doc = $('rpp-document');
  doc.innerHTML = html;
  doc.className = 'rpp-document';
  doc.style.display = 'block';
  $('empty-state').style.display = 'none';
  $('preview-body').scrollTop = 0;
  showToast(`\ud83d\udc41\ufe0f Preview: ${page.label}`, 'info', 2000);
}
window.previewSinglePage = previewSinglePage;

/** Preview semua halaman yang ada di kantong */
function previewAllPages() {
  const pages = getKantong();
  if (!pages.length) { showToast('Kantong masih kosong!', 'error'); return; }
  const allHtml = pages.map((p, i) => `
    <div class="rpp-page-wrapper">${p.htmlData || buildRPPHtml(p.formData)}</div>
    ${i < pages.length - 1 ? `<div class="rpp-page-break"><span>\u2015 Halaman ${i + 2} \u2015</span></div>` : ''}
  `).join('');
  const doc = $('rpp-document');
  doc.innerHTML = allHtml;
  doc.className = 'rpp-document multi-page';
  doc.style.display = 'block';
  $('empty-state').style.display = 'none';
  $('preview-body').scrollTop = 0;
  showToast(`\ud83d\udc41\ufe0f Menampilkan ${pages.length} halaman RPP`, 'success');
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
    <div>${p.htmlData || buildRPPHtml(p.formData)}</div>
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
        <button class="btn-chip-view" onclick="previewSinglePage(${p.id})" title="Preview halaman ini">👁</button>
        <button class="btn-chip-del" onclick="if(confirm('Hapus halaman ini dari kantong?')) deleteFromKantong(${p.id})" title="Hapus">×</button>
      </div>
    </div>
  `).join('');
}

// Wire up kantong buttons
$('btn-save-kantong')?.addEventListener('click', addToKantong);
$('btn-preview-all')?.addEventListener('click', previewAllPages);
$('btn-print-all')?.addEventListener('click', printAllPages);
$('btn-export-word')?.addEventListener('click', exportToWord);
$('btn-clear-kantong')?.addEventListener('click', () => {
  const n = getKantong().length;
  if (!n) return;
  if (!confirm(`Hapus semua ${n} halaman dari Kantong? Tindakan ini tidak bisa dibatalkan.`)) return;
  localStorage.removeItem(KANTONG_KEY);
  renderKantong();
  showToast('\ud83d\uddd1\ufe0f Kantong dikosongkan', 'info');
});

// ============================================================
// INIT
// ============================================================
loadDraft();
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
