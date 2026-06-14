const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const innovations = [
  // Japan / JPN (country_id: 2)
  {
    id: 44,
    country_id: 2,
    title_id: 'Kereta Super Cepat Shinkansen',
    title_en: 'Shinkansen High-Speed Rail',
    description_id: 'Jepang meluncurkan Shinkansen sebagai layanan kereta super cepat pertama di dunia dengan moncong panjang menyerupai peluru. Selain mampu melaju dengan kecepatan tinggi, sistem transportasi ini dirancang sangat aman serta memiliki catatan ketepatan waktu luar biasa hingga hitungan detik. Penemuan ini memangkas waktu tempuh perjalanan jarak jauh antarkota secara drastis.',
    description_en: 'Japan introduced the Shinkansen, the world\'s first high-speed passenger rail service featuring iconic bullet-shaped nose designs. It demonstrated that modern trains could travel at high speeds while maintaining strict safety standards and precision schedules down to the second.',
    icon_name: 'icon_asia_shinkansen_train.png'
  },
  {
    id: 45,
    country_id: 2,
    title_id: 'Pemutar Musik Saku Walkman',
    title_en: 'Sony Walkman',
    description_id: 'Mendengarkan musik secara portabel di luar rumah menjadi kenyataan berkat kreasi pemutar kaset saku Walkman oleh para insinyur Sony di Jepang. Sebelum era Walkman, orang harus duduk diam di ruang tamu dekat radio atau pemutar piringan hitam besar. Perangkat bertenaga baterai ini memungkinkan kita mendengarkan lagu favorit menggunakan headphone sambil berjalan kaki atau bersepeda.',
    description_en: 'Sony engineers in Japan revolutionized music consumption by introducing the Walkman, a portable cassette player. Instead of listening to music stationary at home on large records, users could take their favorite tracks outside using headphones while walking or cycling.',
    icon_name: 'icon_asia_walkman_pi.png'
  },
  {
    id: 46,
    country_id: 2,
    title_id: 'Kode Respon Cepat (QR Code)',
    title_en: 'QR Code',
    description_id: 'Kotak berpola piksel hitam-putih yang sering dijumpai di kasir minimarket atau buku cetak sekolah berfungsi sebagai tempat penyimpanan data berkapasitas tinggi. Dirancang oleh perusahaan Jepang untuk pelacakan industri, kode QR dapat dibaca dengan mudah memakai kamera ponsel. Pemindaian kode ini langsung mengarahkan pengguna ke tautan video pembelajaran, presensi digital, atau sistem pembayaran nirkabel secara instan.',
    description_en: 'This matrix barcode consisting of black and white pixel blocks functions as a high-density data storage system. Developed in Japan, QR codes are easily read by smartphone cameras, redirecting users instantly to educational links, digital check-ins, or cashless payment systems.',
    icon_name: 'icon_asia_qrcode_iot.png'
  },
  {
    id: 47,
    country_id: 2,
    title_id: 'Baterai Lithium-Ion Isi Ulang',
    title_en: 'Commercial Lithium-Ion Battery',
    description_id: 'Ponsel pintar dan laptop belajar dapat menyala berjam-jam tanpa harus terhubung ke colokan listrik berkat penggunaan baterai Lithium-Ion. Baterai isi ulang ini pertama kali dipasarkan secara massal di Jepang untuk perangkat elektronik konsumen. Konstruksinya yang ringan dan tipis mampu menyimpan daya listrik besar secara stabil, menjadikannya energi utama bagi berbagai gawai portabel.',
    description_en: 'Smartphones and laptops run for hours unplugged because of rechargeable lithium-ion battery technology. First commercialized in Japan, this lightweight battery format stores massive energy inside a slim form factor, providing key power storage for portable electronics.',
    icon_name: 'icon_asia_lithium_solar.png'
  },
  {
    id: 48,
    country_id: 2,
    title_id: 'Ponsel Berkamera Pertama',
    title_en: 'Camera Phone',
    description_id: 'Telepon genggam sebelum akhir abad ke-20 hanya dirancang untuk panggilan suara dan pesan teks pendek. Jika ingin memotret momen tertentu, orang harus membawa kamera saku analog yang tebal. Produsen teknologi di Jepang membuat gebrakan dengan mengintegrasikan lensa kamera langsung ke bodi ponsel, meletakkan fondasi bagi fotografi ponsel pintar modern.',
    description_en: 'Before the 21st century, mobile phones were strictly meant for calls and text messages. Capturing a photo required carrying a heavy separate camera. Developers in Japan successfully integrated a camera lens directly into a mobile phone body, creating the basis of mobile photography.',
    icon_name: 'icon_asia_camera_phone_iot.png'
  },
  {
    id: 49,
    country_id: 2,
    title_id: 'Jaringan Internet Seluler 3G',
    title_en: '3G Mobile Service',
    description_id: 'Koneksi internet seluler pada awalnya berjalan sangat lambat dan hanya menampilkan teks statis hitam-putih di layar ponsel. Kehadiran jaringan seluler 3G yang dipelopori di Jepang mengubah hal tersebut dengan meningkatkan lebar pita transmisi data secara drastis. Berkat 3G, pengguna untuk pertama kalinya dapat mengirim surat elektronik, memuat gambar berwarna, hingga menonton video pendek saat bepergian.',
    description_en: 'Early mobile internet access was extremely slow and limited to plain text formatting. The launch of 3G mobile services in Japan updated network capacity, letting mobile phones download colored images, transmit email data, and play short videos on the go.',
    icon_name: 'icon_asia_3g_wifi.png'
  },
  // South Korea / KOR (country_id: 3)
  {
    id: 50,
    country_id: 3,
    title_id: 'Jaringan Internet Kilat 5G',
    title_en: '5G Smartphone Service Milestone',
    description_id: 'Jaringan seluler generasi kelima (5G) menyediakan koneksi nirkabel berkecepatan tinggi dengan latensi sangat rendah. Korea Selatan menjadi negara pertama yang menggelar layanan 5G secara komersial untuk kebutuhan publik. Peningkatan kecepatan ini mempermudah pengunduhan dokumen belajar berukuran besar secara instan, serta menyokong sistem navigasi kendaraan otonom dan koordinasi robot perkotaan tanpa hambatan jeda.',
    description_en: '5G is a fifth-generation mobile network offering high data speeds and low latency. South Korea launched the world\'s first nationwide commercial 5G network, allowing instant downloads of large educational files and supporting real-time data sync for smart vehicles and city systems.',
    icon_name: 'icon_asia_5g_5g.png'
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

  console.log('Menghubungkan ke database untuk memasukkan inovasi Asia...');
  
  try {
    // 1. Hapus data penemuan JPN & KOR lama
    const [delResult] = await pool.query('DELETE FROM innovations WHERE country_id IN (2, 3)');
    console.log(`Berhasil menghapus ${delResult.affectedRows} data inovasi JPN & KOR lama.`);
    
    // 2. Insert data baru
    for (const inv of innovations) {
      await pool.query(
        `INSERT INTO innovations (id, country_id, title_id, title_en, description_id, description_en, icon_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [inv.id, inv.country_id, inv.title_id, inv.title_en, inv.description_id, inv.description_en, inv.icon_name]
      );
      console.log(`Inserted ID ${inv.id}: ${inv.title_id}`);
    }
    console.log('Semua data inovasi JPN & KOR berhasil dimasukkan!');
  } catch (error) {
    console.error('Gagal memasukkan data inovasi:', error.message);
  } finally {
    await pool.end();
  }
}

main();
