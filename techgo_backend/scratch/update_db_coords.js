const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const newCoordinates = [
  { code: 'JPN', lat: 34.746401, lng: 134.941973 },
  { code: 'KOR', lat: 37.420666, lng: 127.300687 },
  { code: 'DEU', lat: 48.048208, lng: 9.686288 },
  { code: 'FRA', lat: 48.245530, lng: 2.496081 },
  { code: 'GBR', lat: 51.737325, lng: -0.969543 },
  { code: 'USA', lat: 40.218371, lng: -75.216122 },
  { code: 'BRA', lat: -22.441221, lng: -43.819332 },
  { code: 'KEN', lat: 0.938754, lng: 37.092671 },
  { code: 'EGY', lat: 28.244417, lng: 30.822157 },
  { code: 'AUS', lat: -32.529232, lng: 151.924025 },
  { code: 'FIN', lat: 60.508757, lng: 24.987311 }
];

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'techgo_db'
  });

  console.log('Menghubungkan ke database untuk memperbarui koordinat...');
  
  try {
    for (const item of newCoordinates) {
      const [result] = await pool.query(
        'UPDATE countries SET latitude = ?, longitude = ? WHERE country_code = ?',
        [item.lat, item.lng, item.code]
      );
      console.log(`Mengubah ${item.code} -> [${item.lat}, ${item.lng}]: baris terpengaruh = ${result.affectedRows}`);
    }
    console.log('Semua koordinat negara di database berhasil diperbarui!');
  } catch (error) {
    console.error('Gagal memperbarui koordinat database:', error.message);
  } finally {
    await pool.end();
  }
}

main();
