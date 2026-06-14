const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const innovations = [
  // Egypt / EGY (country_id: 10)
  {
    id: 54,
    country_id: 10,
    title_id: 'Kertas Papirus Kuno',
    title_en: 'Papyrus Writing Material',
    description_id: 'Masyarakat Mesir Kuno sekitar tahun 2900 SM menemukan cara mencatat sejarah dengan membuat lembaran Papirus dari batang tanaman air. Nah, dari anyaman serat tanaman air inilah sejarah mencatat awal mula lahirnya kertas buku sekolahmu hingga dokumen digital yang kamu baca di layar gadget saat ini.',
    description_en: 'Thousands of years ago, before notebooks and paper, ancient Egyptians solved writing limits by flattening water reeds into papyrus sheets. This historic creation developed into modern paper manufacturing and today\'s digital documents.',
    icon_name: 'icon_africa_papyrus_pi.png'
  },
  {
    id: 55,
    country_id: 10,
    title_id: 'Gembok Pasak Kayu Tradisional',
    title_en: 'Egyptian Pin-Tumbler Lock',
    description_id: 'Sistem penguncian pintu modern yang menggunakan anak kunci logam memiliki leluhur mekanisme pengaman berbahan kayu dari Mesir Kuno sekitar 4000 tahun lalu. Cara kerjanya unik: ada pasak kayu rahasia yang mengunci palang pintu, dan baru bisa longgar kalau didorong oleh gerigi anak kunci kayu yang ukurannya pas banget.',
    description_en: 'Metal keys and lock systems protect homes using mechanisms adapted from ancient Egyptian designs. These early mechanical locks used hidden wooden pins that aligned only when a custom wooden key was inserted, starting physical security design.',
    icon_name: 'icon_africa_lock_iot.png'
  },
  {
    id: 56,
    country_id: 10,
    title_id: 'Jam Air Pembagi Waktu (Clepsydra)',
    title_en: 'Water Clock / Clepsydra',
    description_id: 'Penandaan waktu pada malam hari atau saat cuaca mendung di zaman kuno dilakukan tanpa mengandalkan posisi matahari. Masyarakat Mesir menyelesaikannya dengan merancang jam air (clepsydra). Jam ini mengukur waktu berdasarkan laju tetesan air yang keluar secara konstan dari dasar wadah berlubang, menjadi leluhur bagi teknologi sensor penunjuk waktu otomatis.',
    description_en: 'Without wall clocks or watch devices, ancient Egyptians tracked time using a water clock. By measuring the constant, steady flow of water dripping out of a container, they established a reliable method to tell time at night, paving the way for digital timer sensors.',
    icon_name: 'icon_africa_waterclock_pi.png'
  },
  {
    id: 57,
    country_id: 10,
    title_id: 'Terusan Suez Bypass Maritim',
    title_en: 'Suez Canal',
    description_id: 'Kapal kargo berukuran raksasa di masa lalu harus menempuh perjalanan sangat jauh memutari ujung selatan benua Afrika untuk mengantarkan muatan antarbenua. Pembangunan Terusan Suez di Mesir memangkas jarak tersebut dengan membuat jalur air buatan yang menghubungkan Laut Mediterania dan Laut Merah. Terusan ini memperpendek jalur pelayaran kapal kargo dunia, membuat distribusi logistik menjadi lebih cepat.',
    description_en: 'Merchant ships sailing between Europe and Asia used to sail around the southern tip of Africa. The construction of the Suez Canal in Egypt built a sea-level shortcut linking the Mediterranean and Red Seas, reducing travel time and costs for global shipping routes.',
    icon_name: 'icon_africa_suez_industry.png'
  },
  {
    id: 58,
    country_id: 10,
    title_id: 'Bendungan Tinggi Aswan',
    title_en: 'Aswan High Dam',
    description_id: 'Sungai Nil yang sering kali meluap menyebabkan banjir bandang atau kekeringan ekstrem di wilayah Mesir sekitarnya. Pemerintah Mesir membangun Bendungan Tinggi Aswan untuk mengendalikan aliran air sungai tersebut secara berkala. Bendungan beton raksasa ini juga memanfaatkan dorongan air yang deras untuk memutar turbin generator listrik, menghasilkan energi hidroelektrik bagi jutaan rumah.',
    description_en: 'The Nile River caused seasonal floods and droughts until Egypt built the Aswan High Dam. This engineering project controlled water flows to prevent disasters while utilizing water pressure to spin turbines, producing clean hydroelectric power for millions of homes.',
    icon_name: 'icon_africa_aswan_solar.png'
  },
  {
    id: 59,
    country_id: 10,
    title_id: 'Jaringan Satelit Nilesat',
    title_en: 'Nilesat Broadcast Satellite System',
    description_id: 'Penyebaran siaran televisi, siaran radio, dan program pembelajaran jarak jauh di wilayah Timur Tengah serta Afrika Utara didukung oleh satelit penyiaran Nilesat sejak tahun 1998. Jaringan satelit milik Mesir ini mengorbit di ruang angkasa untuk memancarkan sinyal multimedia secara serentak, menyediakan infrastruktur komunikasi bagi daerah-daerah terpencil.',
    description_en: 'Launched in 1998, Egypt\'s Nilesat satellites act as broadcasting stations in space, transmitting television networks and educational media streams across the region, providing vital infrastructure for distance learning in rural sectors.',
    icon_name: 'icon_africa_nilesat_rocket.png'
  },

  // Kenya / KEN (country_id: 9)
  {
    id: 60,
    country_id: 9,
    title_id: 'Dompet Digital SMS M-Pesa',
    title_en: 'M-Pesa Mobile Money',
    description_id: 'Masyarakat di pedalaman Kenya yang memiliki keterbatasan akses kantor perbankan atau mesin ATM memanfaatkan layanan keuangan nirkabel M-Pesa yang diluncurkan pada tahun 2007. Tanpa membutuhkan ponsel Android mahal maupun paket internet, pengguna dapat menyimpan dan mengirimkan saldo uang digital secara aman menggunakan pesan teks SMS di ponsel jadul. Sistem ini menginspirasi perkembangan dompet elektronik digital saat ini.',
    description_en: 'In rural Kenya where bank branches are rare, mobile networks launched M-Pesa in 2007. Without smartphones or mobile internet, users securely transfer and save money using standard text-based SMS codes on basic mobile phones, inspiring modern e-wallets.',
    icon_name: 'icon_africa_mpesa_money.png'
  },
  {
    id: 61,
    country_id: 9,
    title_id: 'Peta Krisis Digital Ushahidi',
    title_en: 'Ushahidi Crisis Mapping Platform',
    description_id: 'Pengumpulan informasi penyelamatan darurat di lokasi bencana alam sering kali terkendala komunikasi yang lambat. Pengembang teknologi di Kenya membangun platform sumber terbuka bernama Ushahidi untuk mengatasi kendala tersebut. Platform ini menyatukan kiriman pesan singkat (SMS), email, dan koordinasi lokasi dari masyarakat ke dalam peta interaktif, memudahkan tim penolong menuju area bencana.',
    description_en: 'Collecting real-time emergency information during crises can be difficult. Developers in Kenya built Ushahidi, an open-source mapping platform that aggregates reports, SMS coordinates, and social updates onto a live map, assisting rescue teams globally.',
    icon_name: 'icon_africa_ushahidi_wifi.png'
  },
  {
    id: 62,
    country_id: 9,
    title_id: 'Energi Surya Pay-As-You-Go M-KOPA',
    title_en: 'M-KOPA Pay-As-You-Go Solar',
    description_id: 'Penyediaan instalasi panel surya ramah lingkungan bagi rumah tangga kecil di pedalaman sering kali terhambat biaya awal yang sangat tinggi. Perusahaan rintisan M-KOPA di Kenya menawarkan solusi pembayaran harian menggunakan saldo ponsel digital secara berkala. Begitu cicilan mikro dikirimkan lewat dompet seluler, sirkuit panel surya pintar otomatis aktif untuk mengalirkan listrik ramah lingkungan ke rumah warga.',
    description_en: 'Installing solar panels can be too costly for low-income homes. Kenya\'s M-KOPA introduced a pay-as-you-go financing system. Families receive solar hardware kits and pay for clean energy in small parts using mobile wallet payments, lighting rural areas.',
    icon_name: 'icon_africa_mkopa_solar.png'
  },
  {
    id: 63,
    country_id: 9,
    title_id: 'Router Tangguh Pedalaman BRCK',
    title_en: 'BRCK Rugged Internet Router',
    description_id: 'Router pemancar internet perumahan umumnya rentan rusak akibat paparan debu tebal atau langsung mati saat terjadi pemadaman listrik. Tim teknologi di Nairobi, Kenya, mengatasinya dengan menciptakan BRCK! Alat ini adalah router internet bodi baja ala tentara yang super kuat, tahan benturan, anti-debu, serta dilengkapi baterai cadangan berkapasitas besar agar koneksi internet dan server lokal tetap menyala di daerah terpencil.',
    description_en: 'Standard internet routers fail in dusty off-grid locations or shut off during blackouts. Engineers in Nairobi, Kenya, developed the BRCK, a rugged, dust-proof router with long-lasting backup batteries, protecting internet access and offline learning paths.',
    icon_name: 'icon_africa_brck_wifi.png'
  },
  {
    id: 64,
    country_id: 9,
    title_id: 'Kebun Angin Danau Turkana',
    title_en: 'Lake Turkana Wind Power',
    description_id: 'Penyediaan listrik bersih berskala nasional di Kenya didukung oleh proyek Kebun Angin Danau Turkana. Memanfaatkan embusan angin kencang yang konsisten di koridor lembah Afrika Timur, proyek ini memasang ratusan turbin angin raksasa untuk menangkap energi kinetik. Putaran turbin tersebut menghasilkan listrik ramah lingkungan yang dialirkan langsung ke jaringan listrik pintar nasional.',
    description_en: 'Kenya generates large-scale renewable electricity through the Lake Turkana Wind Power project. Capitalizing on strong wind corridors in East Africa, hundreds of wind turbines collect clean energy, supplying electricity to the national grid.',
    icon_name: 'icon_africa_turkana_solar.png'
  }
];

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'techgo_db'
  });

  console.log('Menghubungkan ke database untuk memasukkan inovasi Afrika...');
  
  try {
    // 1. Hapus data penemuan EGY & KEN lama
    const [delResult] = await pool.query('DELETE FROM innovations WHERE country_id IN (9, 10)');
    console.log(`Berhasil menghapus ${delResult.affectedRows} data inovasi EGY & KEN lama.`);
    
    // 2. Insert data baru
    for (const inv of innovations) {
      await pool.query(
        `INSERT INTO innovations (id, country_id, title_id, title_en, description_id, description_en, icon_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [inv.id, inv.country_id, inv.title_id, inv.title_en, inv.description_id, inv.description_en, inv.icon_name]
      );
      console.log(`Inserted ID ${inv.id}: ${inv.title_id}`);
    }
    console.log('Semua data inovasi EGY & KEN berhasil dimasukkan!');
  } catch (error) {
    console.error('Gagal memasukkan data inovasi:', error.message);
  } finally {
    await pool.end();
  }
}

main();
