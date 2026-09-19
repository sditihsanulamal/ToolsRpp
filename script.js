/**
 * ============================================================
 * TOOLS RPP — Generator Modul Ajar Kurikulum Merdeka
 * Script Utama: Tab Navigation, Template Engine, AI, Export
 * ============================================================
 */

"use strict";

// ============================================================
// CONSTANTS & STATE
// ============================================================

const STORAGE_KEY_API = 'tools_rpp_gemini_api_key';

let currentTab = 0;
const TOTAL_TABS = 4;

// TP & Pemantik counters
let tpCount = 1;
let pemantikCount = 1;

// ============================================================
// TEMPLATE BANKS — Narasi per Model Pembelajaran
// ============================================================

const TEMPLATE_KEGIATAN = {
  PBL: {
    pendahuluan: [
      'Guru membuka pembelajaran dengan salam dan berdoa bersama.',
      'Guru mengecek kehadiran peserta didik dan memastikan kondisi kelas kondusif.',
      'Guru menyampaikan apersepsi dengan mengaitkan materi dengan pengalaman sehari-hari peserta didik.',
      'Guru menyajikan fenomena atau masalah kontekstual sebagai stimulus (orientasi masalah).',
      'Guru menyampaikan tujuan pembelajaran, langkah kegiatan, dan asesmen yang akan dilakukan.',
      'Guru memberikan pertanyaan pemantik untuk memancing rasa ingin tahu peserta didik.',
    ],
    inti: [
      '<strong>Orientasi Masalah:</strong> Guru menyajikan masalah autentik yang relevan dengan materi; peserta didik mengidentifikasi dan mendefinisikan masalah.',
      '<strong>Mengorganisasikan Peserta Didik:</strong> Peserta didik membentuk kelompok kecil (3-4 orang), menyepakati pembagian peran dan tugas investigasi.',
      '<strong>Membimbing Investigasi:</strong> Peserta didik melakukan penyelidikan mandiri maupun kelompok — mengumpulkan data, melakukan percobaan/observasi, menganalisis informasi dari berbagai sumber.',
      '<strong>Mengembangkan dan Menyajikan Hasil:</strong> Kelompok menyusun laporan hasil investigasi dalam bentuk yang disepakati (poster, infografis, presentasi, dll.) dan mempresentasikannya.',
      '<strong>Menganalisis dan Mengevaluasi:</strong> Kelas berdiskusi, saling memberikan umpan balik konstruktif; guru memfasilitasi penguatan konsep dan meluruskan miskonsepsi.',
    ],
    penutup: [
      'Guru bersama peserta didik membuat simpulan pembelajaran yang telah dilakukan.',
      'Guru memberikan asesmen formatif (kuis singkat / lembar refleksi) untuk mengukur pemahaman peserta didik.',
      'Guru memberikan umpan balik terhadap proses dan hasil belajar peserta didik.',
      'Guru menginformasikan rencana kegiatan pembelajaran pada pertemuan berikutnya.',
      'Peserta didik melakukan refleksi: apa yang sudah dipahami, apa yang masih membingungkan, apa yang akan dilakukan selanjutnya.',
      'Guru menutup pembelajaran dengan doa dan salam.',
    ],
  },
  PjBL: {
    pendahuluan: [
      'Guru membuka pembelajaran dengan salam dan berdoa bersama.',
      'Guru mengecek kehadiran peserta didik.',
      'Guru menyampaikan apersepsi: mengaitkan proyek dengan isu nyata di lingkungan sekitar peserta didik.',
      'Guru menjelaskan topik proyek, manfaatnya bagi kehidupan nyata, serta peta jalan (timeline) penyelesaian proyek.',
      'Guru menyampaikan tujuan pembelajaran dan kriteria penilaian proyek (rubrik).',
      'Guru memberikan pertanyaan pemantik untuk memancing ide dan kreativitas peserta didik.',
    ],
    inti: [
      '<strong>Penentuan Pertanyaan Mendasar:</strong> Peserta didik bersama guru merumuskan pertanyaan esensial sebagai driving question proyek.',
      '<strong>Merancang Proyek:</strong> Kelompok menyusun rencana proyek meliputi: tujuan, langkah kerja, sumber daya yang dibutuhkan, pembagian tugas, dan jadwal pelaksanaan.',
      '<strong>Pelaksanaan Proyek:</strong> Peserta didik menjalankan proyek secara kolaboratif sesuai rencana; guru memantau kemajuan dan memberikan bimbingan bila diperlukan.',
      '<strong>Monitoring & Evaluasi Proses:</strong> Guru dan peserta didik secara berkala menilai kemajuan proyek, mengidentifikasi hambatan, dan melakukan penyesuaian.',
      '<strong>Presentasi Produk:</strong> Kelompok mempresentasikan produk akhir kepada kelas atau audiens yang lebih luas; peserta didik lain memberikan apresiasi dan umpan balik.',
      '<strong>Evaluasi & Refleksi:</strong> Guru dan peserta didik bersama mengevaluasi kualitas proyek, pengalaman belajar, dan kompetensi yang berkembang.',
    ],
    penutup: [
      'Guru memfasilitasi refleksi pembelajaran: apa yang dipelajari dari proyek ini, tantangan yang dihadapi, dan cara mengatasinya.',
      'Guru memberikan umpan balik menyeluruh terhadap proses dan produk proyek.',
      'Guru menyampaikan apresiasi atas upaya dan kreativitas peserta didik selama pengerjaan proyek.',
      'Guru menginformasikan rencana tindak lanjut (perbaikan produk, diseminasi, dll.).',
      'Peserta didik berdoa dan menyimpan produk proyek dengan rapi.',
      'Guru menutup pembelajaran dengan salam.',
    ],
  },
  Discovery: {
    pendahuluan: [
      'Guru membuka pembelajaran dengan salam dan berdoa.',
      'Guru mengecek kehadiran dan kesiapan belajar peserta didik.',
      'Guru memberikan stimulus berupa gambar, video singkat, atau demonstrasi yang berkaitan dengan materi untuk membangkitkan rasa ingin tahu.',
      'Guru menyampaikan tujuan pembelajaran dan langkah-langkah kegiatan Discovery Learning.',
      'Guru memberikan pertanyaan pemantik untuk memandu proses penemuan.',
    ],
    inti: [
      '<strong>Pemberian Rangsangan (Stimulation):</strong> Peserta didik mengamati fenomena, objek, atau data yang disiapkan guru sebagai titik awal eksplorasi.',
      '<strong>Identifikasi Masalah (Problem Statement):</strong> Peserta didik mengidentifikasi dan merumuskan pertanyaan atau hipotesis berdasarkan pengamatan awal.',
      '<strong>Pengumpulan Data (Data Collection):</strong> Peserta didik mengumpulkan data melalui eksperimen, observasi, membaca, atau wawancara untuk menguji hipotesis.',
      '<strong>Pengolahan Data (Data Processing):</strong> Peserta didik mengolah, mengklasifikasikan, dan menganalisis data yang telah terkumpul dalam kelompok.',
      '<strong>Pembuktian (Verification):</strong> Peserta didik menghubungkan hasil analisis dengan hipotesis awal, mengkonfirmasi atau merevisi hipotesis berdasarkan bukti.',
      '<strong>Penarikan Kesimpulan (Generalization):</strong> Peserta didik menarik kesimpulan dan mempresentasikannya; kelas mendiskusikan dan menyempurnakan bersama.',
    ],
    penutup: [
      'Guru bersama peserta didik merangkum hasil penemuan dan generalisasi konsep.',
      'Guru mengklarifikasi miskonsepsi yang mungkin masih ada.',
      'Guru memberikan asesmen formatif untuk mengukur pemahaman hasil penemuan.',
      'Peserta didik melakukan refleksi proses penemuan yang telah dilakukan.',
      'Guru menyampaikan materi yang akan dibahas pada pertemuan berikutnya.',
      'Guru menutup pembelajaran dengan salam dan doa.',
    ],
  },
  Inquiry: {
    pendahuluan: [
      'Guru membuka pembelajaran dengan salam dan doa.',
      'Guru melakukan apersepsi dengan menggali pengetahuan awal peserta didik terkait topik.',
      'Guru menyajikan situasi problematis atau fenomena yang memerlukan penyelidikan mendalam.',
      'Guru menyampaikan tujuan pembelajaran dan rambu-rambu pelaksanaan inquiry.',
      'Guru memberikan pertanyaan pemantik untuk memotivasi penyelidikan.',
    ],
    inti: [
      '<strong>Orientasi:</strong> Guru dan peserta didik bersama-sama mengidentifikasi topik penyelidikan dan merumuskan pertanyaan penelitian.',
      '<strong>Merumuskan Hipotesis:</strong> Peserta didik merumuskan hipotesis/dugaan sementara berdasarkan pengetahuan awal dan pertanyaan yang telah dirumuskan.',
      '<strong>Merancang Penyelidikan:</strong> Peserta didik merancang langkah-langkah penyelidikan untuk menguji hipotesis, termasuk menentukan variabel dan instrumen pengumpul data.',
      '<strong>Melakukan Penyelidikan:</strong> Peserta didik melaksanakan penyelidikan secara sistematis, mencatat data dengan teliti, dan mendokumentasikan proses.',
      '<strong>Menganalisis Data:</strong> Peserta didik menganalisis data yang terkumpul, membuat grafik/tabel bila perlu, dan menarik inferensi.',
      '<strong>Mengkomunikasikan:</strong> Peserta didik mempresentasikan temuan penyelidikan, menjawab pertanyaan awal, dan menerima umpan balik kritis.',
    ],
    penutup: [
      'Guru memandu peserta didik untuk mensintesis temuan penyelidikan dengan konsep yang dipelajari.',
      'Guru memberikan penguatan dan konfirmasi terhadap hasil inquiry.',
      'Peserta didik melakukan refleksi tentang proses inquiry yang dilakukan.',
      'Guru memberikan asesmen untuk mengukur pemahaman dan keterampilan inquiry.',
      'Guru menyampaikan rencana pembelajaran selanjutnya.',
      'Guru menutup pembelajaran dengan doa dan salam.',
    ],
  },
  Cooperative: {
    pendahuluan: [
      'Guru membuka pembelajaran dengan salam dan doa.',
      'Guru melakukan pengecekan kehadiran dan mempersiapkan kelompok kooperatif.',
      'Guru menyampaikan apersepsi dan mengaitkan materi dengan kehidupan nyata.',
      'Guru menjelaskan tujuan pembelajaran, aturan kerja kelompok kooperatif, dan peran masing-masing anggota.',
      'Guru memberikan pertanyaan pemantik untuk memotivasi peserta didik.',
    ],
    inti: [
      '<strong>Penyajian Informasi:</strong> Guru menyajikan informasi/konsep dasar melalui demonstrasi, bahan bacaan, atau media lainnya.',
      '<strong>Pembentukan Kelompok:</strong> Peserta didik berkumpul dalam kelompok heterogen (4-5 orang) yang telah ditentukan guru.',
      '<strong>Kerja Tim (Team Work):</strong> Kelompok mendiskusikan tugas yang diberikan, saling mengajarkan, dan membantu anggota yang belum memahami materi — setiap anggota bertanggung jawab atas pemahaman seluruh anggota.',
      '<strong>Kuis/Evaluasi Individu:</strong> Masing-masing peserta didik mengerjakan kuis/tugas secara individual untuk mengukur pemahaman personal.',
      '<strong>Rekognisi Tim:</strong> Guru mengumumkan skor kelompok berdasarkan gabungan perkembangan individual; kelompok terbaik mendapat penghargaan.',
      '<strong>Diskusi Kelas:</strong> Kelas berdiskusi membahas jawaban dan memperkuat pemahaman bersama.',
    ],
    penutup: [
      'Guru bersama peserta didik membuat simpulan pembelajaran.',
      'Guru memberikan umpan balik terhadap kinerja individu dan tim.',
      'Peserta didik melakukan refleksi pengalaman belajar kooperatif.',
      'Guru menyampaikan rencana kegiatan berikutnya.',
      'Guru menutup pembelajaran dengan doa dan salam.',
    ],
  },
  Direct: {
    pendahuluan: [
      'Guru membuka pembelajaran dengan salam dan berdoa.',
      'Guru mengecek kehadiran peserta didik.',
      'Guru menyampaikan tujuan pembelajaran dan kompetensi yang akan dicapai.',
      'Guru melakukan apersepsi dengan meninjau pengetahuan prasyarat peserta didik.',
      'Guru menyampaikan garis besar materi dan langkah-langkah pembelajaran.',
    ],
    inti: [
      '<strong>Presentasi/Demonstrasi:</strong> Guru menjelaskan konsep, prinsip, atau prosedur secara terstruktur dan sistematis dengan contoh yang jelas dan konkret.',
      '<strong>Latihan Terbimbing:</strong> Guru membimbing peserta didik mengerjakan latihan awal; guru memantau, memberikan umpan balik langsung, dan mengoreksi kesalahan.',
      '<strong>Pengecekan Pemahaman:</strong> Guru mengajukan pertanyaan kepada seluruh kelas, meminta peserta didik menjelaskan kembali dengan kata-kata sendiri.',
      '<strong>Latihan Mandiri:</strong> Peserta didik mengerjakan latihan/tugas secara mandiri untuk memantapkan pemahaman; guru berkeliling memberikan bantuan bila dibutuhkan.',
      '<strong>Umpan Balik & Penguatan:</strong> Guru membahas hasil latihan, memberikan penguatan pada jawaban benar, dan meluruskan kesalahan konsep.',
    ],
    penutup: [
      'Guru bersama peserta didik merangkum dan menyimpulkan materi yang telah dipelajari.',
      'Guru memberikan asesmen formatif singkat.',
      'Peserta didik mencatat hal-hal penting dari pembelajaran.',
      'Guru memberikan tugas mandiri/PR untuk memperkuat pemahaman.',
      'Guru menyampaikan materi pertemuan berikutnya.',
      'Guru menutup pembelajaran dengan doa dan salam.',
    ],
  },
};

// ============================================================
// DOM UTILITIES
// ============================================================

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg, type = 'success', duration = 3000) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, duration);
}

// ============================================================
// TAB NAVIGATION
// ============================================================

function switchTab(index) {
  // Deactivate all
  $$('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.tab) < index) btn.classList.add('done');
    else btn.classList.remove('done');
  });
  $$('.tab-panel').forEach(p => p.classList.remove('active'));

  // Activate target
  const btn = $(('tab-btn-' + index));
  const panel = document.querySelector(`[data-panel="${index}"]`);
  if (btn) { btn.classList.add('active'); btn.classList.remove('done'); }
  if (panel) panel.classList.add('active');

  currentTab = index;
  updateProgressBar();
}

function updateProgressBar() {
  const pct = ((currentTab + 1) / TOTAL_TABS) * 100;
  $('progress-bar').style.width = pct + '%';
}

// Tab button clicks
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(parseInt(btn.dataset.tab)));
});

// Next/Prev buttons (delegated)
document.addEventListener('click', (e) => {
  const next = e.target.closest('[data-next]');
  const prev = e.target.closest('[data-prev]');
  if (next) switchTab(parseInt(next.dataset.next));
  if (prev) switchTab(parseInt(prev.dataset.prev));
});

// ============================================================
// DYNAMIC LISTS — Tujuan Pembelajaran
// ============================================================

function renderTPList() {
  const list = $('tp-list');
  Array.from(list.querySelectorAll('.tp-num')).forEach((num, i) => {
    num.textContent = (i + 1) + '.';
  });
  Array.from(list.querySelectorAll('.btn-tp-remove')).forEach(btn => {
    btn.onclick = function () {
      if (list.children.length > 1) {
        btn.closest('.tp-item').remove();
        renderTPList();
      }
    };
  });
}

$('btn-add-tp').addEventListener('click', () => {
  tpCount++;
  const item = document.createElement('div');
  item.className = 'tp-item';
  item.dataset.index = tpCount;
  item.innerHTML = `
    <span class="tp-num">${$('tp-list').children.length + 1}.</span>
    <input type="text" class="tp-input" placeholder="Masukkan tujuan pembelajaran..." />
    <button class="btn-tp-remove" title="Hapus">×</button>
  `;
  $('tp-list').appendChild(item);
  renderTPList();
  item.querySelector('.tp-input').focus();
});

renderTPList();

// ============================================================
// DYNAMIC LISTS — Pertanyaan Pemantik
// ============================================================

function renderPemantikList() {
  const list = $('pemantik-list');
  Array.from(list.querySelectorAll('.pemantik-num')).forEach((num, i) => {
    num.textContent = (i + 1) + '.';
  });
  Array.from(list.querySelectorAll('.btn-pemantik-remove')).forEach(btn => {
    btn.onclick = function () {
      if (list.children.length > 1) {
        btn.closest('.pemantik-item').remove();
        renderPemantikList();
      }
    };
  });
}

$('btn-add-pemantik').addEventListener('click', () => {
  pemantikCount++;
  const item = document.createElement('div');
  item.className = 'pemantik-item';
  item.dataset.index = pemantikCount;
  item.innerHTML = `
    <span class="pemantik-num">${$('pemantik-list').children.length + 1}.</span>
    <input type="text" class="pemantik-input" placeholder="Pertanyaan yang memantik rasa ingin tahu..." />
    <button class="btn-pemantik-remove" title="Hapus">×</button>
  `;
  $('pemantik-list').appendChild(item);
  renderPemantikList();
  item.querySelector('.pemantik-input').focus();
});

renderPemantikList();

// ============================================================
// DATA COLLECTION from Form
// ============================================================

function collectFormData() {
  // Tujuan Pembelajaran
  const tpInputs = Array.from($$('.tp-input')).map(i => i.value.trim()).filter(Boolean);
  // Pertanyaan Pemantik
  const pemantikInputs = Array.from($$('.pemantik-input')).map(i => i.value.trim()).filter(Boolean);
  // P3
  const p3Checked = Array.from($$('[name="p3"]:checked')).map(i => i.value);
  // Jenis Asesmen
  const jenisAsesmen = Array.from($$('#jenis-asesmen input:checked')).map(i => i.value);
  // Teknik Asesmen
  const teknikAsesmen = Array.from($$('[name="teknik"]:checked')).map(i => i.value);
  // Diferensiasi
  const diferensiasi = Array.from($$('[name="diferensiasi"]:checked')).map(i => i.value);

  // Alokasi waktu
  const jmlPertemuan = parseInt($('jml-pertemuan').value) || 2;
  const jpPerPertemuan = parseInt($('jp-per-pertemuan').value) || 2;
  const menitPerJP = parseInt($('menit-per-jp').value) || 45;
  const totalJP = jmlPertemuan * jpPerPertemuan;
  const totalMenit = totalJP * menitPerJP;

  return {
    namaSekolah: $('nama-sekolah').value.trim() || 'Nama Sekolah',
    namaGuru: $('nama-guru').value.trim() || 'Nama Guru',
    mataPelajaran: $('mata-pelajaran').value.trim() || 'Mata Pelajaran',
    fase: $('fase').value || 'Fase D / Kelas 7 SMP',
    semester: $('semester').value,
    tahunPelajaran: $('tahun-pelajaran').value.trim() || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
    jmlPertemuan,
    jpPerPertemuan,
    menitPerJP,
    totalJP,
    totalMenit,
    alokasi: `${jmlPertemuan} Pertemuan × ${jpPerPertemuan} JP × ${menitPerJP} menit = ${totalJP} JP (${totalMenit} menit)`,
    jmlPeserta: $('jml-peserta').value || '32',
    judulModul: $('judul-modul').value.trim() || 'Judul Materi',
    elemenCP: $('elemen-cp').value.trim() || '-',
    tujuanPembelajaran: tpInputs.length ? tpInputs : ['Peserta didik dapat memahami dan menerapkan konsep yang dipelajari.'],
    p3: p3Checked.length ? p3Checked : ['Bernalar Kritis', 'Mandiri'],
    targetPD: $('target-pd').value,
    modelPembelajaran: $('model-pembelajaran').value,
    moda: $('moda').value,
    sarana: $('sarana').value.trim() || 'Buku teks, papan tulis, alat tulis',
    sumberBelajar: $('sumber-belajar').value.trim() || 'Buku Siswa, internet',
    pertanyaanPemantik: pemantikInputs.length ? pemantikInputs : ['Apa yang kamu ketahui tentang topik ini?'],
    diferensiasi,
    jenisAsesmen,
    teknikAsesmen,
    instrumen: $('instrumen').value.trim() || 'Lembar observasi, LKPD',
    remedialPengayaan: $('remedial-pengayaan').value.trim() || 'Remedial: latihan soal tambahan. Pengayaan: proyek mandiri.',
    catatanGuru: $('catatan-guru').value.trim(),
  };
}

// ============================================================
// TEMPLATE ENGINE — Generate RPP HTML
// ============================================================

function buildRPPHtml(data, aiEnhanced = null) {
  const t = TEMPLATE_KEGIATAN[data.modelPembelajaran] || TEMPLATE_KEGIATAN['PBL'];
  const keg = aiEnhanced || t;

  // Helper: numbered list
  const ol = (items) => `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
  const ul = (items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

  // Alokasi per kegiatan (pertemuan 1 example)
  const pendMenit = Math.round(data.menitPerJP * data.jpPerPertemuan * 0.15);
  const intiMenit = Math.round(data.menitPerJP * data.jpPerPertemuan * 0.7);
  const penutupMenit = Math.round(data.menitPerJP * data.jpPerPertemuan * 0.15);

  // Diferensiasi text
  const diffText = data.diferensiasi.length
    ? data.diferensiasi.map(d => {
        const map = { konten: 'Diferensiasi Konten: Bahan ajar disesuaikan dengan tingkat kesiapan belajar peserta didik.', proses: 'Diferensiasi Proses: Variasi strategi pembelajaran sesuai gaya belajar peserta didik.', produk: 'Diferensiasi Produk: Peserta didik bebas memilih bentuk luaran/karya yang sesuai minat dan kekuatan mereka.' };
        return map[d] || d;
      }).join(' ')
    : 'Pembelajaran dilaksanakan secara seragam untuk seluruh peserta didik.';

  // Rubrik asesmen
  const rubrikRows = [
    ['Pemahaman Konsep', 'Mampu menjelaskan konsep secara mandiri dan akurat', 'Mampu menjelaskan dengan sedikit bantuan', 'Memerlukan banyak bantuan untuk memahami', 'Belum menunjukkan pemahaman'],
    ['Keterampilan Proses', 'Melaksanakan semua langkah dengan tepat dan sistematis', 'Melaksanakan sebagian besar langkah dengan baik', 'Melaksanakan sebagian langkah dengan bantuan', 'Belum mampu melaksanakan langkah'],
    ['Sikap & Partisipasi', 'Aktif, kolaboratif, dan menunjukkan inisiatif tinggi', 'Aktif dan berpartisipasi dengan baik', 'Berpartisipasi jika diminta', 'Kurang berpartisipasi'],
    ['Komunikasi', 'Menyampaikan ide dengan jelas, percaya diri, dan terstruktur', 'Menyampaikan ide dengan cukup jelas', 'Menyampaikan dengan bantuan', 'Belum mampu mengkomunikasikan ide'],
  ];

  const rubrikHtml = `
    <table class="rpp-table">
      <thead>
        <tr><th>Aspek</th><th>Sangat Baik (4)</th><th>Baik (3)</th><th>Cukup (2)</th><th>Perlu Bimbingan (1)</th></tr>
      </thead>
      <tbody>
        ${rubrikRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;

  // Kegiatan per pertemuan generator
  const generatePertemuan = (ptmNum) => {
    return `
      <p class="rpp-sub-title">Pertemuan ke-${ptmNum} (${data.jpPerPertemuan} JP × ${data.menitPerJP} menit = ${data.jpPerPertemuan * data.menitPerJP} menit)</p>

      <div class="rpp-kegiatan-box">
        <div class="rpp-kegiatan-header">🕐 Kegiatan Pendahuluan (±${pendMenit} menit)</div>
        ${ol(ptmNum === 1 ? keg.pendahuluan : [
          'Guru membuka pembelajaran, salam, dan doa.',
          'Guru meninjau pemahaman materi pertemuan sebelumnya melalui tanya jawab singkat.',
          'Guru menyampaikan agenda dan tujuan pembelajaran pertemuan ini.',
          'Guru memberikan pertanyaan pemantik lanjutan untuk menstimulasi pemikiran kritis.',
        ])}
      </div>

      <div class="rpp-kegiatan-box">
        <div class="rpp-kegiatan-header">📖 Kegiatan Inti (±${intiMenit} menit)</div>
        ${ol(ptmNum === 1 ? keg.inti : [
          'Peserta didik melanjutkan aktivitas pembelajaran dari pertemuan sebelumnya secara lebih mendalam.',
          'Guru memberikan scaffolding bagi kelompok yang mengalami hambatan.',
          'Peserta didik mempresentasikan atau menyajikan hasil kerja/temuan kepada kelas.',
          'Kelas berdiskusi dan saling memberikan umpan balik konstruktif.',
          'Guru memfasilitasi penguatan dan klarifikasi konsep.',
        ])}
      </div>

      <div class="rpp-kegiatan-box">
        <div class="rpp-kegiatan-header">✅ Kegiatan Penutup (±${penutupMenit} menit)</div>
        ${ol(ptmNum === data.jmlPertemuan ? keg.penutup : [
          'Guru bersama peserta didik merangkum hal-hal penting yang dipelajari.',
          'Peserta didik menuliskan refleksi singkat (3-2-1: 3 hal yang dipelajari, 2 pertanyaan, 1 hal yang akan diterapkan).',
          'Guru menyampaikan tugas untuk mempersiapkan kegiatan berikutnya.',
          'Guru menutup pembelajaran dengan salam.',
        ])}
      </div>
    `;
  };

  // Generate all pertemuan
  let semuaPertemuan = '';
  for (let p = 1; p <= data.jmlPertemuan; p++) {
    semuaPertemuan += generatePertemuan(p);
  }

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
    <div class="rpp-header-doc">
      <p class="rpp-school-name">${data.namaSekolah}</p>
      <p class="rpp-doc-title">Modul Ajar</p>
      <span class="rpp-kurikulum-badge">Kurikulum Merdeka</span>
    </div>

    <table class="rpp-identity-table">
      <tr><td>Mata Pelajaran</td><td>:</td><td><strong>${data.mataPelajaran}</strong></td></tr>
      <tr><td>Fase / Kelas</td><td>:</td><td>${data.fase}</td></tr>
      <tr><td>Semester</td><td>:</td><td>${data.semester}</td></tr>
      <tr><td>Tahun Pelajaran</td><td>:</td><td>${data.tahunPelajaran}</td></tr>
      <tr><td>Judul Modul / Materi Pokok</td><td>:</td><td><strong>${data.judulModul}</strong></td></tr>
      <tr><td>Alokasi Waktu</td><td>:</td><td>${data.alokasi}</td></tr>
      <tr><td>Jumlah Peserta Didik</td><td>:</td><td>${data.jmlPeserta} orang</td></tr>
      <tr><td>Target Peserta Didik</td><td>:</td><td>${data.targetPD}</td></tr>
      <tr><td>Model Pembelajaran</td><td>:</td><td>${data.modelPembelajaran === 'PBL' ? 'Problem Based Learning (PBL)' : data.modelPembelajaran === 'PjBL' ? 'Project Based Learning (PjBL)' : data.modelPembelajaran === 'Discovery' ? 'Discovery Learning' : data.modelPembelajaran === 'Inquiry' ? 'Inquiry Learning' : data.modelPembelajaran === 'Cooperative' ? 'Cooperative Learning' : 'Direct Instruction'}</td></tr>
      <tr><td>Moda Pembelajaran</td><td>:</td><td>${data.moda}</td></tr>
      <tr><td>Penyusun</td><td>:</td><td>${data.namaGuru}</td></tr>
    </table>

    <div class="rpp-section-title">A. Informasi Umum</div>

    <p class="rpp-sub-title">1. Capaian Pembelajaran (CP)</p>
    <p>${data.elemenCP}</p>

    <p class="rpp-sub-title">2. Tujuan Pembelajaran</p>
    ${ol(data.tujuanPembelajaran)}

    <p class="rpp-sub-title">3. Profil Pelajar Pancasila</p>
    ${ul(data.p3)}

    <p class="rpp-sub-title">4. Sarana & Prasarana / Media Pembelajaran</p>
    <p>${data.sarana}</p>

    <p class="rpp-sub-title">5. Sumber Belajar</p>
    <p>${data.sumberBelajar}</p>

    <div class="rpp-section-title">B. Komponen Inti</div>

    <p class="rpp-sub-title">1. Pertanyaan Pemantik</p>
    ${ol(data.pertanyaanPemantik)}

    <p class="rpp-sub-title">2. Pemahaman Bermakna</p>
    <p>Setelah mempelajari modul ini, peserta didik diharapkan memahami bahwa <strong>${data.judulModul}</strong> merupakan bagian yang tidak terpisahkan dari kehidupan sehari-hari dan memiliki relevansi nyata dalam konteks lokal maupun global.</p>

    <p class="rpp-sub-title">3. Kegiatan Pembelajaran</p>
    <p><em>Model: ${data.modelPembelajaran === 'PBL' ? 'Problem Based Learning (PBL)' : data.modelPembelajaran === 'PjBL' ? 'Project Based Learning (PjBL)' : data.modelPembelajaran} | Moda: ${data.moda}</em></p>

    ${semuaPertemuan}

    <p class="rpp-sub-title">4. Diferensiasi Pembelajaran</p>
    <p>${diffText}</p>

    <div class="rpp-section-title">C. Asesmen</div>

    <p class="rpp-sub-title">1. Jenis Asesmen</p>
    ${ul(data.jenisAsesmen.length ? data.jenisAsesmen : ['Asesmen Formatif'])}

    <p class="rpp-sub-title">2. Teknik Asesmen</p>
    ${ul(data.teknikAsesmen.length ? data.teknikAsesmen : ['Observasi'])}

    <p class="rpp-sub-title">3. Instrumen Asesmen</p>
    <p>${data.instrumen}</p>

    <p class="rpp-sub-title">4. Rubrik Penilaian</p>
    ${rubrikHtml}

    <div class="rpp-section-title">D. Remedial & Pengayaan</div>
    <p>${data.remedialPengayaan}</p>

    ${data.catatanGuru ? `<div class="rpp-section-title">E. Catatan / Refleksi Guru</div><p>${data.catatanGuru}</p>` : ''}

    <div class="rpp-signature-box">
      <div class="rpp-signature">
        <p class="rpp-signature-date">…………………, ${today}</p>
        <p style="font-size:11pt; margin-bottom: 50px;">Guru Mata Pelajaran</p>
        <p class="rpp-signature-name">${data.namaGuru}</p>
        <p style="font-size:10pt; color: #555;">NIP. ……………………</p>
      </div>
    </div>
  `;
}

// ============================================================
// GENERATE & PREVIEW
// ============================================================

function generateAndShow(aiEnhanced = null) {
  const data = collectFormData();
  const html = buildRPPHtml(data, aiEnhanced);

  const doc = $('rpp-document');
  const emptyState = $('empty-state');

  doc.innerHTML = html;
  doc.style.display = 'block';
  emptyState.style.display = 'none';

  // Scroll to top of preview
  $('preview-body').scrollTop = 0;
}

$('btn-generate').addEventListener('click', () => {
  generateAndShow();
  showToast('✅ Modul Ajar berhasil di-generate!', 'success');
  // Smooth scroll into view if needed
  $('rpp-document').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ============================================================
// RESET
// ============================================================

$('btn-reset').addEventListener('click', () => {
  if (!confirm('Reset semua form dan preview? Data yang belum disimpan akan hilang.')) return;
  document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => {
    if (el.id !== 'gemini-api-key') el.value = '';
  });
  document.querySelectorAll('input[type="checkbox"]').forEach(el => { el.checked = false; });
  $('fase').value = '';
  $('semester').value = 'Ganjil';
  $('menit-per-jp').value = '45';
  $('model-pembelajaran').value = 'PBL';
  $('moda').value = 'Tatap Muka';
  $('target-pd').value = 'Peserta didik reguler/tipikal';
  $('jml-pertemuan').value = 2;
  $('jp-per-pertemuan').value = 2;
  $('jml-peserta').value = 32;
  // Reset TP list
  $('tp-list').innerHTML = `
    <div class="tp-item" data-index="0">
      <span class="tp-num">1.</span>
      <input type="text" class="tp-input" placeholder="Contoh: Peserta didik dapat menjelaskan proses fotosintesis secara lisan dan tulisan" />
      <button class="btn-tp-remove" title="Hapus">×</button>
    </div>`;
  // Reset pemantik list
  $('pemantik-list').innerHTML = `
    <div class="pemantik-item" data-index="0">
      <span class="pemantik-num">1.</span>
      <input type="text" class="pemantik-input" placeholder="Contoh: Mengapa daun berwarna hijau? Apa hubungannya dengan makanan?" />
      <button class="btn-pemantik-remove" title="Hapus">×</button>
    </div>`;
  renderTPList();
  renderPemantikList();
  // Reset preview
  $('rpp-document').style.display = 'none';
  $('rpp-document').innerHTML = '';
  $('empty-state').style.display = 'flex';
  // Reset tab
  switchTab(0);
  showToast('🔄 Form berhasil direset', 'info');
});

// ============================================================
// EXPORT / PRINT
// ============================================================

$('btn-export').addEventListener('click', () => {
  if ($('rpp-document').innerHTML.trim() === '') {
    showToast('⚠️ Generate Modul Ajar terlebih dahulu!', 'error');
    return;
  }
  window.print();
});

// ============================================================
// COPY TO CLIPBOARD
// ============================================================

$('btn-copy').addEventListener('click', () => {
  const doc = $('rpp-document');
  if (!doc.textContent.trim()) {
    showToast('⚠️ Generate Modul Ajar terlebih dahulu!', 'error');
    return;
  }
  navigator.clipboard.writeText(doc.innerText).then(() => {
    showToast('📋 Teks berhasil disalin!', 'success');
  }).catch(() => {
    showToast('Gagal menyalin teks.', 'error');
  });
});

// ============================================================
// GEMINI API KEY — Save & Load
// ============================================================

function loadApiKey() {
  const key = localStorage.getItem(STORAGE_KEY_API);
  if (key) {
    $('gemini-api-key').value = key;
    updateAINote(true);
  }
}

function updateAINote(hasKey) {
  const note = $('ai-note');
  if (hasKey) {
    note.textContent = '✅ Gemini API Key tersimpan. Klik "Gunakan AI" untuk memperkaya narasi.';
    note.style.color = '#10b981';
  } else {
    note.textContent = 'Masukkan Gemini API Key di bagian atas untuk menggunakan fitur ini.';
    note.style.color = '';
  }
}

$('btn-save-key').addEventListener('click', () => {
  const key = $('gemini-api-key').value.trim();
  if (!key) {
    localStorage.removeItem(STORAGE_KEY_API);
    updateAINote(false);
    showToast('🗑️ API Key dihapus', 'info');
    return;
  }
  localStorage.setItem(STORAGE_KEY_API, key);
  updateAINote(true);
  showToast('🔑 API Key tersimpan!', 'success');
});

// ============================================================
// AI ENHANCEMENT — Gemini API
// ============================================================

$('btn-ai-enhance').addEventListener('click', async () => {
  const apiKey = localStorage.getItem(STORAGE_KEY_API) || $('gemini-api-key').value.trim();
  if (!apiKey) {
    showToast('⚠️ Masukkan Gemini API Key terlebih dahulu!', 'error');
    return;
  }

  const data = collectFormData();
  const btn = $('btn-ai-enhance');
  const btnText = $('ai-btn-text');
  const spinner = $('ai-spinner');

  btn.disabled = true;
  btnText.textContent = 'Memproses...';
  spinner.classList.remove('hidden');

  const modelMap = {
    PBL: 'Problem Based Learning (PBL)',
    PjBL: 'Project Based Learning (PjBL)',
    Discovery: 'Discovery Learning',
    Inquiry: 'Inquiry Learning',
    Cooperative: 'Cooperative Learning',
    Direct: 'Direct Instruction',
  };

  const prompt = `Kamu adalah seorang ahli pendidikan dan pengembang kurikulum Merdeka Belajar di Indonesia.
Buatkan narasi KEGIATAN PEMBELAJARAN yang lengkap, kontekstual, dan berkualitas tinggi untuk Modul Ajar berikut:

Mata Pelajaran: ${data.mataPelajaran}
Jenjang: ${data.fase}
Judul Materi: ${data.judulModul}
Model Pembelajaran: ${modelMap[data.modelPembelajaran]}
Moda: ${data.moda}
Tujuan Pembelajaran: ${data.tujuanPembelajaran.join('; ')}
Profil Pelajar Pancasila: ${data.p3.join(', ')}
Pertanyaan Pemantik saat ini: ${data.pertanyaanPemantik.join('; ')}
Target Peserta Didik: ${data.targetPD}

Berikan respons dalam format JSON yang valid berikut ini (tanpa blok kode markdown, hanya JSON):
{
  "pendahuluan": ["langkah 1", "langkah 2", "..."],
  "inti": ["langkah 1 dengan penjelasan detail", "langkah 2", "..."],
  "penutup": ["langkah 1", "langkah 2", "..."]
}

Ketentuan:
- Setiap array berisi 5-7 langkah yang kaya, spesifik, dan kontekstual sesuai materi
- Langkah di bagian inti boleh menggunakan tag <strong> untuk nama fase model pembelajaran
- Gunakan bahasa Indonesia yang baku, lugas, dan profesional
- Sesuaikan langkah dengan ${modelMap[data.modelPembelajaran]} secara autentik`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error?.message || 'API Error ' + resp.status);
    }

    const result = await resp.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Format respons AI tidak valid.');
    const aiData = JSON.parse(jsonMatch[0]);

    if (!aiData.pendahuluan || !aiData.inti || !aiData.penutup) {
      throw new Error('Respons AI tidak lengkap.');
    }

    // Generate with AI-enhanced content
    generateAndShow(aiData);
    showToast('🤖 Modul Ajar berhasil diperkaya dengan AI!', 'success');

  } catch (err) {
    console.error(err);
    showToast('❌ Gagal: ' + err.message, 'error', 5000);
  } finally {
    btn.disabled = false;
    btnText.textContent = '✨ Gunakan AI';
    spinner.classList.add('hidden');
  }
});

// ============================================================
// INITIALIZATION
// ============================================================

loadApiKey();
switchTab(0);

// Check-card interaction enhancement
document.addEventListener('change', (e) => {
  if (e.target.closest('.check-card') || e.target.closest('.toggle-card') || e.target.closest('.radio-card') || e.target.closest('.check-card-sm')) {
    // Visual feedback is handled by CSS :has selector
    // Auto-update preview if already generated
    if ($('rpp-document').style.display === 'block') {
      // Debounce preview update
      clearTimeout(window._previewDebounce);
      window._previewDebounce = setTimeout(() => generateAndShow(), 500);
    }
  }
});

// Live preview update on input
document.querySelectorAll('#panel-form input[type="text"], #panel-form input[type="number"], #panel-form textarea, #panel-form select').forEach(el => {
  el.addEventListener('input', () => {
    if ($('rpp-document').style.display === 'block') {
      clearTimeout(window._previewDebounce);
      window._previewDebounce = setTimeout(() => generateAndShow(), 800);
    }
  });
});

console.log('%c📋 Tools RPP Loaded!', 'color: #10b981; font-size: 14px; font-weight: bold;');
console.log('%cGenerator Modul Ajar Kurikulum Merdeka', 'color: #8b949e; font-size: 12px;');
