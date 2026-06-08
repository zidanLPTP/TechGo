const pool = require('../config/database');

/**
 * Controller untuk mengambil data negara berserta inovasi teknologinya (One-to-Many).
 * Menggabungkan tabel 'countries' dan 'innovations' menggunakan LEFT JOIN
 * lalu memetakan hasilnya ke dalam format bersarang (nested JSON).
 */
const getCountriesWithInnovations = async (req, res) => {
  try {
    // Jalankan query JOIN ke MySQL database
    const [rows] = await pool.query(`
      SELECT 
        c.id AS country_id,
        c.country_code,
        c.country_name_id,
        c.country_name_en,
        c.continent,
        c.latitude,
        c.longitude,
        i.id AS innovation_id,
        i.title_id,
        i.title_en,
        i.description_id,
        i.description_en,
        i.icon_name
      FROM countries c
      LEFT JOIN innovations i ON c.id = i.country_id
      ORDER BY c.country_name_id ASC
    `);

    // Proses memetakan (grouping) satu negara dengan banyak inovasi
    const countriesMap = {};

    rows.forEach(row => {
      const countryId = row.country_id;
      
      // Jika negara belum ada di objek map, buat entri barunya
      if (!countriesMap[countryId]) {
        countriesMap[countryId] = {
          id: row.country_id,
          country_code: row.country_code,
          country_name_id: row.country_name_id,
          country_name_en: row.country_name_en,
          continent: row.continent,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          innovations: []
        };
      }

      // Jika ada data inovasi terkait, masukkan ke dalam array inovasi negara tersebut
      if (row.innovation_id) {
        countriesMap[countryId].innovations.push({
          id: row.innovation_id,
          title_id: row.title_id,
          title_en: row.title_en,
          description_id: row.description_id,
          description_en: row.description_en,
          icon_name: row.icon_name
        });
      }
    });

    // Ubah objek map menjadi array untuk dikirim sebagai JSON
    const countriesList = Object.values(countriesMap);

    res.status(200).json({
      status: 'success',
      data: countriesList
    });
  } catch (error) {
    console.error('Error fetching countries with innovations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data negara dan inovasi teknologi dari server.',
      error: error.message
    });
  }
};

module.exports = {
  getCountriesWithInnovations
};
