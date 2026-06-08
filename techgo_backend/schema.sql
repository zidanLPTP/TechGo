-- TechGo Database Schema Setup Script
-- Compatible with MySQL 8.0.x and cPanel shared hosting

-- Drop tables in reverse order of foreign keys to avoid dependency conflicts
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS innovations;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS users;

-- 1. Tabel Informasi Pengguna (Mendukung Login Google & Guest)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NULL UNIQUE, -- NULL jika Guest
    auth_provider ENUM('google', 'guest') DEFAULT 'guest',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Data Negara (Diperbarui dengan kolom koordinat lintang/bujur untuk rendering Globe 3D)
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3 huruf (cth: 'JPN', 'DEU', 'IDN')
    country_name_id VARCHAR(100) NOT NULL,    -- Nama versi Indonesia
    country_name_en VARCHAR(100) NOT NULL,    -- Nama versi Inggris
    continent ENUM('Asia', 'Europe', 'America', 'Africa') NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,           -- Koordinat Latitude
    longitude DECIMAL(9,6) NOT NULL           -- Koordinat Longitude
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Inovasi Teknologi (Satu Negara Bisa Banyak Inovasi)
CREATE TABLE innovations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    title_id VARCHAR(200) NOT NULL,        -- Judul versi Indonesia
    title_en VARCHAR(200) NOT NULL,        -- Judul versi Inggris
    description_id TEXT NOT NULL,          -- Deskripsi versi Indonesia
    description_en TEXT NOT NULL,          -- Deskripsi versi Inggris
    icon_name VARCHAR(100) NOT NULL,       -- Nama file ikon (cth: 'icon_asia_robot.png')
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Progres Belajar & Logika Adaptif AI
CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    innovation_id INT NOT NULL,
    highest_score INT DEFAULT 0, -- Nilai kuis tertinggi (0-5)
    attempts_count INT DEFAULT 0,
    student_skill_level ENUM('Beginner', 'Intermediate', 'Expert') DEFAULT 'Beginner',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (innovation_id) REFERENCES innovations(id) ON DELETE CASCADE,
    UNIQUE KEY user_innovation_unique (user_id, innovation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- DATA SEED AWAL (10 Negara Terdistribusi Seimbang di 4 Benua & Inovasi Teknologi)
-- ============================================================================

-- Seed Data Negara
INSERT INTO countries (id, country_code, country_name_id, country_name_en, continent, latitude, longitude) VALUES
(1, 'IDN', 'Indonesia', 'Indonesia', 'Asia', -0.789275, 113.921327),
(2, 'JPN', 'Jepang', 'Japan', 'Asia', 36.204824, 138.252924),
(3, 'KOR', 'Korea Selatan', 'South Korea', 'Asia', 35.907757, 127.766922),
(4, 'DEU', 'Jerman', 'Germany', 'Europe', 51.165691, 10.451526),
(5, 'FRA', 'Prancis', 'France', 'Europe', 46.227638, 2.213749),
(6, 'GBR', 'Inggris', 'United Kingdom', 'Europe', 55.378051, -3.435973),
(7, 'USA', 'Amerika Serikat', 'United States', 'America', 37.090240, -95.712891),
(8, 'BRA', 'Brasil', 'Brazil', 'America', -14.235004, -51.925280),
(9, 'KEN', 'Kenya', 'Kenya', 'Africa', -1.292066, 36.821946),
(10, 'EGY', 'Mesir', 'Egypt', 'Africa', 26.820553, 30.802498);

-- Seed Data Inovasi Teknologi (Satu negara memiliki inovasi teknologi canggih edukatif)
INSERT INTO innovations (id, country_id, title_id, title_en, description_id, description_en, icon_name) VALUES
-- 1. Indonesia
(1, 1, 'Sensor Pertanian Pintar IoT', 'Smart Agriculture IoT Sensors', 
'Teknologi sensor nirkabel berbasis IoT yang dipasang di sawah untuk memantau kelembaban tanah, suhu udara, dan kesehatan padi secara langsung melalui handphone petani agar hasil panen meningkat.', 
'IoT-based wireless sensor technology installed in rice fields to monitor soil moisture, air temperature, and crop health directly via mobile devices to boost crop yields.', 
'icon_asia_iot.png'),

-- 2. Jepang
(2, 2, 'Kereta Cepat Magnetik Shinkansen', 'Shinkansen Magnetic Bullet Train', 
'Kereta peluru Shinkansen menggunakan gaya magnet super kuat untuk melayang di atas rel dan meluncur sangat cepat tanpa gesekan, mencapai kecepatan lebih dari 320 km/jam dengan sangat aman.', 
'Shinkansen bullet trains utilize powerful magnetic forces to hover above the tracks and glide smoothly without friction, achieving speeds of over 320 km/h with high safety standards.', 
'icon_asia_train.png'),

-- 3. Korea Selatan
(3, 3, 'Jaringan Robotik & Kota Pintar 5G', '5G Robotic Smart City Network', 
'Sistem jaringan internet 5G ultra cepat yang menghubungkan robot pembersih otomatis, lampu jalan pintar, dan mobil kemudi otomatis di perkotaan untuk kehidupan yang bersih dan hemat energi.', 
'An ultra-fast 5G internet network connecting autonomous cleaning robots, smart streetlights, and self-driving cars in urban areas to support clean and energy-efficient living.', 
'icon_asia_5g.png'),

-- 4. Jerman
(4, 4, 'Otomasi Industri Robotik 4.0', 'Industry 4.0 Robotic Automation', 
'Pabrik pintar yang menggunakan lengan robot cerdas dan sensor kecerdasan buatan untuk merakit mobil listrik secara otomatis, cepat, dan presisi tinggi tanpa membuang banyak energi.', 
'Smart factories using intelligent robotic arms and artificial intelligence sensors to assemble electric vehicles automatically, quickly, and with high precision while minimizing energy waste.', 
'icon_europe_industry.png'),

-- 5. Prancis
(5, 5, 'Pesawat Terbang Bertenaga Surya Bersih', 'Clean Solar-Powered Aircraft', 
'Pesawat eksperimental berukuran raksasa yang seluruh sayapnya ditutupi panel surya tipis, mampu terbang tinggi menembus awan siang dan malam tanpa menggunakan bahan bakar minyak bumi.', 
'A giant experimental airplane covered in ultra-thin solar panels on its wings, capable of flying high above the clouds day and night without consuming any fossil fuel.', 
'icon_europe_plane.png'),

-- 6. Inggris
(6, 6, 'Komputer Mikro Edukasi Raspberry Pi', 'Raspberry Pi Educational Micro-Computer', 
'Komputer mungil seukuran kartu saku yang dibuat khusus untuk membantu anak-anak di seluruh dunia belajar dasar coding, robotika, dan membuat eksperimen teknologi digital mereka sendiri.', 
'A pocket-sized credit-card microcomputer designed specifically to help children worldwide learn basic coding, robotics, and build their own digital technology experiments.', 
'icon_europe_pi.png'),

-- 7. Amerika Serikat
(7, 7, 'Roket Reusable SpaceX Falcon 9', 'SpaceX Falcon 9 Reusable Rocket', 
'Roket luar angkasa pertama yang dapat terbang kembali ke bumi dan mendarat tegak lurus secara otomatis di atas kapal laut setelah mengantar satelit, membuat perjalanan ke luar angkasa jauh lebih murah.', 
'The first orbital rocket capable of returning to Earth and landing upright automatically on an ocean drone ship after launching satellites, making space travel far cheaper.', 
'icon_america_rocket.png'),

-- 8. Brasil
(8, 8, 'Bahan Bakar Bersih Bioetanol Tebu', 'Clean Sugarcane Bioethanol Fuel', 
'Teknologi pengolahan tanaman tebu menjadi bahan bakar cair ramah lingkungan (bioetanol) untuk menggantikan bensin mobil, mengurangi polusi asap udara di kota-kota besar Brasil.', 
'An environmentally friendly technology processing sugarcane crops into liquid bioethanol fuel to replace gasoline, significantly reducing air pollution in major Brazilian cities.', 
'icon_america_biofuel.png'),

-- 9. Kenya
(9, 9, 'Sistem Uang Elektronik Seluler M-Pesa', 'M-Pesa Mobile Money Network', 
'Layanan keuangan seluler pertama di dunia yang memungkinkan jutaan orang tanpa rekening bank mengirim dan menerima uang secara aman hanya menggunakan SMS di handphone jadul.', 
'The world’s first mobile financial service that allows millions of unbanked citizens to safely send and receive money using basic SMS text messaging on older phones.', 
'icon_africa_money.png'),

-- 10. Mesir
(10, 10, 'Mega Proyek Surya Gurun Benban', 'Benban Desert Mega Solar Grid', 
'Pembangkit listrik tenaga surya terbesar di benua Afrika yang dibangun di tengah gurun pasir panas Mesir, memproduksi listrik bersih dari matahari untuk menerangi jutaan rumah warga.', 
'The largest solar power plant in Africa built in the middle of the hot Egyptian desert, producing clean electricity from the sun to power millions of citizens\' homes.', 
'icon_africa_solar.png');
