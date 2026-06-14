const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const innovations = [
  // Germany / DEU (country_id: 4)
  {
    id: 34,
    country_id: 4,
    title_id: 'Kulkas Pendingin Mekanik',
    title_en: 'Modern Mechanical Refrigeration',
    description_id: 'Tanpa kotak pendingin ini di rumah, susu kotak atau es krim favorit kita akan cepat basi dan meleleh dalam hitungan jam. Carl von Linde merancang sistem kulkas mekanik modern di Jerman dengan cara menyedot hawa panas dari dalam wadah lalu membuangnya ke luar. Alhasil, bagian dalam boks tetap dingin dan segar sehingga makanan bisa disimpan jauh lebih lama.',
    description_en: 'Without a refrigerator, fresh milk or ice cream would melt and spoil in hours. Carl von Linde designed the modern mechanical refrigeration system in Germany by extracting heat from inside a container and expelling it. This keeps the interior cold and fresh, allowing food to be stored longer.',
    icon_name: 'icon_europe_kulkas_iot.png'
  },
  {
    id: 35,
    country_id: 4,
    title_id: 'Mobil Berbahan Bakar Bensin Pertama',
    title_en: 'Practical Gasoline Automobile',
    description_id: 'Bepergian jauh di masa lampau terasa lambat karena orang harus menumpang kereta kayu yang ditarik oleh kuda. Karl Benz mengubah hal tersebut dengan menciptakan mobil bertenaga bensin pertama di Jerman. Kendaraan roda tiga ini dijalankan oleh mesin pembakaran dalam, bukan lagi ditarik oleh hewan. Penemuan bersejarah ini memicu lahirnya industri mobil sport hingga mobil pintar yang bisa berjalan sendiri saat ini.',
    description_en: 'Traveling long distances used to be slow because people relied on horse-drawn carriages. Karl Benz changed this by building the first practical gasoline-powered car in Germany. This three-wheeled vehicle ran on an internal combustion engine, starting the development of modern automobiles.',
    icon_name: 'icon_europe_mobil_industry.png'
  },
  {
    id: 36,
    country_id: 4,
    title_id: 'Mesin Diesel yang Tangguh',
    title_en: 'Diesel Engine',
    description_id: 'Truk besar, bus antar-kota, dan kapal laut raksasa membutuhkan tenaga ekstra kuat untuk membawa muatan yang sangat berat. Kekuatan besar tersebut berasal dari mesin diesel buatan Rudolf Diesel di Jerman. Berbeda dari mesin bensin, mesin diesel menekan udara di dalam ruang pembakaran sampai menjadi sangat panas sebelum bahan bakar disemprotkan. Proses ini memicu ledakan tenaga besar untuk menggerakkan kendaraan industri.',
    description_en: 'Large trucks, buses, and container ships need immense power to haul heavy loads. This force comes from the diesel engine, developed by Rudolf Diesel in Germany. Unlike gasoline engines, it compresses air inside cylinders until it is hot enough to ignite fuel, creating high-torque energy.',
    icon_name: 'icon_europe_diesel_industry.png'
  },
  {
    id: 37,
    country_id: 4,
    title_id: 'Kartu SIM Seluler',
    title_en: 'SIM Card',
    description_id: 'Kartu plastik mikro berlempeng kuningan yang dimasukkan ke slot ponsel berfungsi layaknya kartu identitas digital bagi perangkat kita. Dibuat di Jerman, kartu SIM menyimpan kode verifikasi unik agar ponsel kita dapat tersambung ke jaringan seluler dengan aman. Begitu terpasang, menara pemancar operator langsung mengenali perangkat kita untuk menyalurkan sinyal internet dan panggilan telepon.',
    description_en: 'The micro SIM card inserted into a mobile phone serves as a digital identity for the device. Developed in Germany, the SIM card stores unique verification codes that securely link the device to cellular networks, enabling access to calls and mobile data.',
    icon_name: 'icon_europe_sim_iot.png'
  },
  // United Kingdom / GBR (country_id: 6)
  {
    id: 38,
    country_id: 6,
    title_id: 'Alat Penyedot Debu Mesin',
    title_en: 'Powered Vacuum Cleaner',
    description_id: 'Debu dan remah makanan di celah lantai sulit dibersihkan secara merata hanya menggunakan sapu ijuk biasa. Hubert Cecil Booth dari Inggris memecahkan masalah ini dengan menciptakan mesin penyedot debu pertama. Alat ini mengandalkan daya hisap pompa angin untuk menarik kotoran langsung masuk ke dalam kantong penyaring. Metode pembersihan ini menjadi cikal bakal robot penyedot debu otomatis yang dapat bergerak mandiri saat ini.',
    description_en: 'Dust and small crumbs in floor crevices are hard to clean with standard brooms. Hubert Cecil Booth in the UK solved this by building the first powered vacuum cleaner. It used suction pumps to pull dirt into a filter bag, laying the groundwork for today\'s robotic vacuums.',
    icon_name: 'icon_europe_vacuum_iot.png'
  },
  {
    id: 39,
    country_id: 6,
    title_id: 'Televisi Mekanik Pertama',
    title_en: 'Mechanical Television',
    description_id: 'Siaran televisi pada awal perkembangannya tidak menggunakan layar digital tipis, melainkan memakai sistem piringan berputar mekanik. John Logie Baird mendemonstrasikan televisi mekanik pertama di Inggris dengan mengubah gambar objek bergerak menjadi sinyal listrik. Sinyal tersebut dikirimkan lewat gelombang radio ke layar penangkap gambar, membuka jalan bagi terciptanya layar TV berwarna dan TV pintar.',
    description_en: 'Early television broadcasts did not use flat screens, but relied on a system of rotating discs. John Logie Baird demonstrated the first mechanical television in the UK by converting moving images into electrical signals, paving the way for digital and color televisions.',
    icon_name: 'icon_europe_tv_pi.png'
  },
  {
    id: 40,
    country_id: 6,
    title_id: 'Mesin Jet Pesawat Terbang',
    title_en: 'Turbojet Engine',
    description_id: 'Penerbangan lintas benua berlangsung sangat cepat karena pesawat komersial modern digerakkan oleh mesin jet. Dipatenkan oleh Frank Whittle di Inggris, mesin ini bekerja dengan cara menyedot udara dari depan, memadatkannya di ruang pembakaran, lalu menyemburkannya ke belakang dengan kekuatan ledakan yang sangat besar. Dorongan udara bertekanan tinggi ini meluncurkan pesawat lebih cepat dan lebih tinggi.',
    description_en: 'Cross-continental flights are fast because modern airplanes are powered by jet engines. Patented by Frank Whittle in the UK, the engine sucks in air, compresses it, and blasts it backward. This high-pressure exhaust thrusts the airplane forward at extreme speeds.',
    icon_name: 'icon_europe_jet_plane.png'
  },
  {
    id: 41,
    country_id: 6,
    title_id: 'Pesan Teks SMS Pertama',
    title_en: 'SMS Text Message',
    description_id: 'Sebelum aplikasi chatting populer digunakan, pertukaran pesan tulisan pendek jarak jauh mengandalkan sistem SMS (Short Message Service). Teknologi ini dirintis di Inggris untuk membuktikan bahwa jaringan seluler juga dapat mengirimkan deretan teks digital, bukan hanya suara telepon. Pesan teks pertama di dunia dikirim oleh Neil Papworth kepada temannya dengan ucapan singkat: \'Merry Christmas\'.',
    description_en: 'Before modern chat applications, short written messages were sent via SMS. This technology was developed in the UK to show that cellular networks could transmit text data in addition to voice. The first text message ever sent read: \'Merry Christmas\'.',
    icon_name: 'icon_europe_sms_wifi.png'
  },
  // Finland / FIN (country_id: 12)
  {
    id: 42,
    country_id: 12,
    title_id: 'Jaringan Seluler Digital GSM (2G)',
    title_en: 'GSM / 2G Digital Mobile Network',
    description_id: 'Jaringan telepon seluler generasi awal menggunakan sinyal analog yang rentan terganggu suara kresek-kresek dan mudah disadap. Untuk mengatasi masalah itu, jaringan GSM ini datang membawa cara baru. Sinyal suara kita diubah jadi kode angka digital, makanya suara telepon jadi jernih banget mirip kalau kita lagi ngobrol langsung di dekatnya. Peluncuran GSM di Finlandia juga membuka jalan bagi pengiriman pesan teks SMS pertama di ponsel.',
    description_en: 'Early mobile networks used analog signals that were noisy and insecure. GSM solved this by converting voice calls into encrypted digital data. Launched in Finland, GSM made phone calls clear and secure, while enabling SMS text messaging for the first time.',
    icon_name: 'icon_europe_gsm_wifi.png'
  },
  {
    id: 43,
    country_id: 12,
    title_id: 'Jantung Sistem Operasi Linux',
    title_en: 'Linux Kernel',
    description_id: 'Sistem operasi Android di ponsel pintar, komputer server, hingga sistem kendali ruang angkasa dijalankan oleh program inti bernama kernel Linux. Sirkuit dasar ini dirakit pertama kali oleh Linus Torvalds di Finlandia dan dirilis secara terbuka tanpa biaya lisensi. Keputusan membagikan Linux secara gratis memungkinkan ribuan pemrogram di seluruh dunia berkolaborasi untuk menyempurnakan sistem ini.',
    description_en: 'The Android operating system, server grids, and satellite controls are driven by an operating system core called the Linux kernel. Created by Linus Torvalds in Finland, this open-source code was shared freely, allowing developers worldwide to collaborate and improve it.',
    icon_name: 'icon_europe_linux_linux.png'
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

  console.log('Menghubungkan ke database...');
  
  try {
    // 1. Hapus semua data inovasi template lama (kecuali milik USA dengan country_id = 7)
    console.log('Menghapus seluruh inovasi template lama (kecuali milik USA)...');
    const [delResult] = await pool.query('DELETE FROM innovations WHERE country_id != 7');
    console.log(`Berhasil menghapus ${delResult.affectedRows} data inovasi template lama.`);
    
    // 2. Insert data baru kloter benua Eropa
    console.log('Memasukkan data penemuan baru kloter benua Eropa...');
    for (const inv of innovations) {
      await pool.query(
        `INSERT INTO innovations (id, country_id, title_id, title_en, description_id, description_en, icon_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [inv.id, inv.country_id, inv.title_id, inv.title_en, inv.description_id, inv.description_en, inv.icon_name]
      );
      console.log(`Inserted ID ${inv.id}: ${inv.title_id} (${inv.title_en})`);
    }
    console.log('Seluruh data penemuan kloter benua Eropa berhasil dimasukkan!');
  } catch (error) {
    console.error('Gagal memproses database:', error.message);
  } finally {
    await pool.end();
  }
}

main();
