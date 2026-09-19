/**
 * ============================================================
 * TOOLS RPP WAFA — Generator RPP Format 5P
 * Template Engine: Identitas → P1-P5 → Tanda Tangan
 * ============================================================
 */
"use strict";

const STORAGE_KEY = 'tools_rpp_wafa_apikey';
let currentTab = 0;
const TOTAL_TABS = 4;

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

// Initialize all existing lists
['p1-list', 'p3-tiru-list', 'p4-list'].forEach(id => {
  const el = $(id);
  if (el) refreshListLabels(el);
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
    p2Kegiatan: $('p2-kegiatan').value.trim() || '',
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
    p5Review: $('p5-review').value.trim() || '',
    p5Pesan: $('p5-pesan').value.trim() || '',
    p5Doa: $('p5-doa').value.trim() || 'Guru mengakhiri pembelajaran dengan doa penutup',
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
  let parts = [];
  if (d.p5Review) {
    parts.push(`<strong>a. Review</strong> Materi hari ini : ${escHtml(d.p5Review)}`);
  }
  if (d.p5Pesan) {
    parts.push(`<strong>b. Pesan</strong> : Guru memberikan <strong>motivasi</strong> ${escHtml(d.p5Pesan)}`);
  }
  if (d.p5Doa) {
    parts.push(`<strong>c. Do'a</strong> : ${escHtml(d.p5Doa)}`);
  }
  if (!parts.length) return '-';
  return `<ul class="keg-alpha-list">${parts.map(p => `<li>${p}</li>`).join('')}</ul>`;
}

function buildRPPHtml(d) {
  const tanggalStr = d.ttdKota
    ? `${d.ttdKota}, ${d.ttdTanggal}`
    : d.ttdTanggal;

  const sigRow = `
    <div class="wafa-footer">
      <div class="wafa-footer-date">${tanggalStr}</div>
      <div class="wafa-sig-row">
        <div class="wafa-sig-block">
          <div>Mengetahui,</div>
          <div>${escHtml(d.ksJabatan)}</div>
          <div class="wafa-sig-name">${escHtml(d.ksNama)}</div>
          ${d.ksNip ? `<div class="wafa-sig-nip">NIP. ${escHtml(d.ksNip)}</div>` : ''}
        </div>
        <div class="wafa-sig-block">
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
          <div class="wafa-logo-box">W</div>
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
            ${buildAlphaList(d.p1Activities.length ? d.p1Activities : ["Guru mengucapkan salam, sapa, do'a", "Absen gemar mengaji", "Guru mengulang pelajaran sebelumnya"])}
          </td>
          <td class="col-sarana">${buildSaranaCell(d.p1Sarana)}</td>
          <td class="col-waktu">${escHtml(d.p1Waktu)}'</td>
        </tr>

        <!-- P2 -->
        <tr>
          <td class="col-sp">P2</td>
          <td class="col-kegiatan">
            ${d.p2Kegiatan ? `<p>${escHtml(d.p2Kegiatan)}</p>` : '<p>Ustadz/n bercerita dan menjelaskan tentang materi hari ini</p>'}
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
function generateAndShow(overrides = null) {
  const d = collectData();
  if (overrides) Object.assign(d, overrides);
  const html = buildRPPHtml(d);
  const doc = $('rpp-document');
  const empty = $('empty-state');
  doc.innerHTML = html;
  doc.style.display = 'block';
  empty.style.display = 'none';
  $('preview-body').scrollTop = 0;
}

$('btn-generate').addEventListener('click', () => {
  generateAndShow();
  showToast('✅ RPP berhasil di-generate!', 'success');
});

// Live update debounce
let previewDebounce;
function schedulePreviewUpdate() {
  if ($('rpp-document').style.display !== 'block') return;
  clearTimeout(previewDebounce);
  previewDebounce = setTimeout(() => generateAndShow(), 700);
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
  $('p5-doa').value = "Guru mengakhiri pembelajaran dengan doa penutup";

  // Reset lists to defaults
  $('p1-list').innerHTML = `
    <div class="activity-item"><span class="act-label">a.</span><input type="text" class="act-input" value="Guru mengucapkan salam, sapa, do'a" /><button class="btn-act-rm">×</button></div>
    <div class="activity-item"><span class="act-label">b.</span><input type="text" class="act-input" value="Absen gemar mengaji" /><button class="btn-act-rm">×</button></div>
    <div class="activity-item"><span class="act-label">c.</span><input type="text" class="act-input" value="Guru mengulang pelajaran sebelumnya" /><button class="btn-act-rm">×</button></div>`;
  $('p3-tiru-list').innerHTML = `
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="Baca Tiru 2 baris (guru ke siswa) diulang diacak dan siswa secara acak diberikan kesempatan membaca 1 baris" /><button class="btn-act-rm">×</button></div>
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="Baca Tiru 2 baris berikutnya (siswa ke siswa) diulang diacak 4 baris dan setiap siswa diberikan kesempatan membaca 2 baris" /><button class="btn-act-rm">×</button></div>
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="Baca Tiru 3 baris berikutnya (siswa ke siswa dan guru menyimak) diulang diacak 7 baris dan setiap siswa diberikan kesempatan membaca 4 baris" /><button class="btn-act-rm">×</button></div>`;
  $('p4-list').innerHTML = `
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="Siswa membaca 4 baris acak, siswa lain menyimak, Guru menilai bacaan siswa di kartu Prestasi." /><button class="btn-act-rm">×</button></div>
    <div class="activity-item"><span class="act-label bullet">•</span><input type="text" class="act-input" value="Pada saat siswa membaca ada kesalahan, maka siswa lain langsung memberikan kode kesalahannya misal dengan suara (tut tut). Demikian seterusnya sampai selesai." /><button class="btn-act-rm">×</button></div>`;

  ['p1-list', 'p3-tiru-list', 'p4-list'].forEach(id => refreshListLabels($(id)));

  // Reset preview
  $('rpp-document').style.display = 'none';
  $('rpp-document').innerHTML = '';
  $('empty-state').style.display = 'flex';
  switchTab(0);
  showToast('🔄 Form berhasil direset', 'info');
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
// API KEY — Save / Load
// ============================================================
function loadApiKey() {
  const k = localStorage.getItem(STORAGE_KEY);
  if (k) {
    $('gemini-api-key').value = k;
    updateAiNote(true);
  }
}
function updateAiNote(has) {
  const note = $('ai-note');
  if (has) { note.textContent = '✅ API Key tersimpan. Klik "Gunakan AI" untuk generate narasi otomatis.'; note.style.color = '#10b981'; }
  else { note.textContent = 'Masukkan Gemini API Key di bagian atas untuk menggunakan fitur ini.'; note.style.color = ''; }
}
$('btn-save-key').addEventListener('click', () => {
  const k = $('gemini-api-key').value.trim();
  if (!k) { localStorage.removeItem(STORAGE_KEY); updateAiNote(false); showToast('🗑️ API Key dihapus', 'info'); return; }
  localStorage.setItem(STORAGE_KEY, k);
  updateAiNote(true);
  showToast('🔑 API Key tersimpan!', 'success');
});

// ============================================================
// AI ENHANCEMENT — Gemini API
// ============================================================
$('btn-ai-enhance').addEventListener('click', async () => {
  const apiKey = localStorage.getItem(STORAGE_KEY) || $('gemini-api-key').value.trim();
  if (!apiKey) { showToast('⚠️ Masukkan Gemini API Key terlebih dahulu!', 'error'); return; }

  const d = collectData();
  const btn = $('btn-ai-enhance');
  const btnText = $('ai-btn-text');
  const spinner = $('ai-spinner');

  btn.disabled = true;
  btnText.textContent = 'Memproses AI...';
  spinner.classList.remove('hidden');

  const prompt = `Kamu adalah pakar metode pembelajaran Al-Quran Wafa. 
Buatkan konten RPP Wafa dengan format 5P untuk materi berikut:
- Buku: ${d.buku}
- Aspek: ${d.aspek}
- Materi: ${d.materi}
- Indikator: ${d.indikator}
- Kelas: ${d.kelas}
- Total waktu: ${d.waktuTotal} menit

Tulis dalam format JSON yang VALID berikut ini (tanpa blok kode markdown, hanya JSON murni):
{
  "p1Activities": ["kegiatan a", "kegiatan b", "kegiatan c"],
  "p2Kegiatan": "narasi apersepsi / cerita motivasi yang relevan dengan materi",
  "p3Penjelasan": "penjelasan konsep materi secara singkat dan tepat",
  "p3Pengulangan": "cara guru memberikan contoh bacaan dan memandu siswa",
  "p3Catatan": "catatan variasi atau tips untuk guru",
  "p3TiruSteps": ["langkah Baca Tiru 1", "langkah Baca Tiru 2", "langkah Baca Tiru 3"],
  "p4Activities": ["kegiatan BSK 1", "kegiatan BSK 2"],
  "p5Review": "ringkasan materi yang direview",
  "p5Pesan": "pesan motivasi untuk siswa",
  "p5Doa": "deskripsi kegiatan doa penutup"
}

Ketentuan penting:
- Gunakan bahasa Indonesia yang baku, singkat, dan profesional
- Sesuaikan dengan metode Wafa yang menggunakan pendekatan otak kanan
- Semua teks harus relevan langsung dengan materi ${d.materi}`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.65, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error?.message || 'API Error ' + resp.status);
    }

    const result = await resp.json();
    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Format respons AI tidak valid.');
    const ai = JSON.parse(jsonMatch[0]);

    // Apply AI values to form
    if (ai.p2Kegiatan) $('p2-kegiatan').value = ai.p2Kegiatan;
    if (ai.p3Penjelasan) $('p3-penjelasan').value = ai.p3Penjelasan;
    if (ai.p3Pengulangan) $('p3-pengulangan').value = ai.p3Pengulangan;
    if (ai.p3Catatan) $('p3-catatan').value = ai.p3Catatan;
    if (ai.p5Review) $('p5-review').value = ai.p5Review;
    if (ai.p5Pesan) $('p5-pesan').value = ai.p5Pesan;
    if (ai.p5Doa) $('p5-doa').value = ai.p5Doa;

    // Update P1 list
    if (ai.p1Activities?.length) {
      const list = $('p1-list');
      list.innerHTML = '';
      ai.p1Activities.forEach((act, i) => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `<span class="act-label">${String.fromCharCode(97 + i)}.</span><input type="text" class="act-input" value="${act.replace(/"/g, '&quot;')}" /><button class="btn-act-rm">×</button>`;
        list.appendChild(item);
      });
      refreshListLabels(list);
    }

    // Update P3 Tiru list
    if (ai.p3TiruSteps?.length) {
      const list = $('p3-tiru-list');
      list.innerHTML = '';
      ai.p3TiruSteps.forEach(step => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `<span class="act-label bullet">•</span><input type="text" class="act-input" value="${step.replace(/"/g, '&quot;')}" /><button class="btn-act-rm">×</button>`;
        list.appendChild(item);
      });
      refreshListLabels(list);
    }

    // Update P4 list
    if (ai.p4Activities?.length) {
      const list = $('p4-list');
      list.innerHTML = '';
      ai.p4Activities.forEach(act => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `<span class="act-label bullet">•</span><input type="text" class="act-input" value="${act.replace(/"/g, '&quot;')}" /><button class="btn-act-rm">×</button>`;
        list.appendChild(item);
      });
      refreshListLabels(list);
    }

    generateAndShow();
    showToast('🤖 RPP berhasil diperkaya dengan AI!', 'success');

  } catch (err) {
    console.error(err);
    showToast('❌ ' + err.message, 'error', 5000);
  } finally {
    btn.disabled = false;
    btnText.textContent = '✨ Gunakan AI';
    spinner.classList.add('hidden');
  }
});

// ============================================================
// INIT
// ============================================================
loadApiKey();
switchTab(0);

// Set today as default date
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
$('ttd-tanggal').value = `${yyyy}-${mm}-${dd}`;

console.log('%c📋 Tools RPP Wafa Ready!', 'color:#10b981;font-size:14px;font-weight:bold');
