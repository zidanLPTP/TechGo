const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const innovations = [
  // Australia / AUS (country_id: 11)
  {
    id: 51,
    country_id: 11,
    title_id: 'Sinyal Internet Tanpa Kabel (Wi-Fi)',
    title_en: 'Wi-Fi / Wireless LAN Contribution',
    description_id: 'Laptop, Smart TV, dan ponsel pintar di rumah dapat tersambung ke internet secara bersamaan tanpa memerlukan kabel hitam panjang yang berantakan di lantai. Tim ilmuwan dari lembaga penelitian CSIRO di Australia memecahkan masalah kabel ini dengan memancarkan data internet lewat gelombang radio tidak terlihat di udara. Kehadiran Wi-Fi mempermudah kita mengakses video pembelajaran atau bermain game secara nirkabel dari mana saja.',
    description_en: 'Laptops, smart TVs, and mobile phones connect to the internet simultaneously without needing long black cables. A research team at CSIRO in Australia developed this wireless technology by transmitting data through invisible radio waves, enabling convenient internet access anywhere.',
    icon_name: 'icon_australia_wifi_wifi.png'
  },
  {
    id: 52,
    country_id: 11,
    title_id: 'Kotak Hitam Perekam Pesawat (Black Box)',
    title_en: 'Black Box Flight Recorder',
    description_id: 'Kotak perekam data penerbangan di pesawat yang dikenal sebagai "Black Box" sebenarnya dicat dengan warna oranye terang agar mudah ditemukan jika terjadi kecelakaan. Dirancang oleh David Warren di Australia, alat pengaman tahan benturan dan panas tinggi ini mencatat percakapan di kokpit serta parameter teknis pesawat terbang. Data perekam ini sangat membantu penyelidik mendeteksi penyebab kecelakaan udara demi menyempurnakan sistem keselamatan penerbangan.',
    description_en: 'The flight recorder known as the "Black Box" is actually painted bright orange to make it easy to spot. Developed by David Warren in Australia, this protective unit records cockpit audio and aircraft instrument data to help safety experts find the cause of flight accidents.',
    icon_name: 'icon_australia_blackbox_plane.png'
  },
  {
    id: 53,
    country_id: 11,
    title_id: 'Alat Implan Pendengaran Bionik',
    title_en: 'Multi-Channel Cochlear Implant',
    description_id: 'Alat bantu dengar bionik yang dikenal sebagai implan koklea dirancang khusus oleh Graeme Clark di Universitas Melbourne untuk membantu penderita tunarungu merasakan indahnya suara. Kabel komputer super kecil di dalam alat ini bakal menyenggol saraf pendengaran secara lembut, mengirimkan kode suara langsung ke otak kita. Penerjemahan suara menjadi sinyal kelistrikan ini membantu pengguna mendengar percakapan, tawa, dan musik secara jelas.',
    description_en: 'The multi-channel cochlear implant acts as a bionic ear, developed by Graeme Clark in Melbourne to help deaf individuals receive sound signals. The device bypasses damaged parts of the ear, sending electrical pulses straight to the hearing nerve so users can perceive speech and music.',
    icon_name: 'icon_australia_cochlear_iot.png'
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

  console.log('Menghubungkan ke database untuk memasukkan inovasi Australia...');
  
  try {
    // 1. Hapus data penemuan AUS lama
    const [delResult] = await pool.query('DELETE FROM innovations WHERE country_id = 11');
    console.log(`Berhasil menghapus ${delResult.affectedRows} data inovasi AUS lama.`);
    
    // 2. Insert data baru
    for (const inv of innovations) {
      await pool.query(
        `INSERT INTO innovations (id, country_id, title_id, title_en, description_id, description_en, icon_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [inv.id, inv.country_id, inv.title_id, inv.title_en, inv.description_id, inv.description_en, inv.icon_name]
      );
      console.log(`Inserted ID ${inv.id}: ${inv.title_id}`);
    }
    console.log('Semua data inovasi AUS berhasil dimasukkan!');
  } catch (error) {
    console.error('Gagal memasukkan data inovasi:', error.message);
  } finally {
    await pool.end();
  }
}

main();
