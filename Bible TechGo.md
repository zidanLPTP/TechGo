# **TechGo Product Bible: Spesifikasi Teknis & Panduan Pengembangan**

Dokumen ini adalah acuan utama (Bible) pembangunan platform **TechGo**, platform pembelajaran teknologi interaktif untuk anak usia 10-14 tahun di Indonesia maupun global (universal). Spesifikasi ini disesuaikan dengan kondisi produksi tahun 2026 pada server hosting cPanel berspesifikasi terbatas.

## **1\. Ringkasan Eksekutif & Konsep Produk**

### **1.1 Deskripsi Produk**

TechGo adalah platform berbasis web edukatif untuk mengenalkan inovasi teknologi global kepada anak-anak (usia 10-14 tahun) secara visual, adaptif, dan menyenangkan. Menampilkan bumi 3D interaktif, visualisasi pastel ramah anak, kuis adaptif bertenaga AI, serta mendukung multi-bahasa (Indonesia & Inggris).

### **1.2 Target Pengguna & Aksesibilitas**

* **Target Pengguna:** Anak-anak usia 10-14 tahun (Lokal Indonesia & Global/Universal).  
* **Multi-Bahasa:** Menyediakan tombol toggle bahasa instant (ID/EN) di navigasi utama.  
* **Kompatibilitas Perangkat:** Responsif penuh (*responsive design*) untuk berbagai resolusi layar: Laptop, Tablet, dan Smartphone (HP).

### **1.3 Alur Autentikasi Pengguna**

1. **Google OAuth 2.0 Login:** Untuk anak-anak yang ingin progres belajarnya, pencapaian kuis, dan tingkat keahlian (*skill level*) tersimpan permanen di database.  
2. **Guest Mode (Mode Tamu):** Anak-anak langsung masuk dan bermain tanpa login. Progres belajar **tidak disimpan** di database (opsional hanya disimpan di *browser local storage* sementara).

## **2\. Sistem Desain & Antarmuka (UI/UX Guidelines)**

Mengadopsi bahasa desain **"Modern Playful EdTech"** yang bersih, lega, bersahabat, dengan ujung sudut tumpul (*high border-radius*) mirip estetika "Edulite".

### **2.1 Tipografi (Fonts)**

Kombinasi font Google Fonts yang aman dan kompatibel:

* **Font Heading / Judul:** Fredoka (Google Fonts, Sans-serif rounded, tebal & ramah).  
* **Font Body / Informasi:** Quicksand (Google Fonts, Sans-serif rounded, sangat terbaca di layar handphone).

### **2.2 Palet Warna (Color Palette)**

Warna pastel cerah yang nyaman di mata anak pada perangkat mobile:

* \#FF6B9B (*Pastel Pink / Rose*) \- Profil, Badge Beginner, dekorasi ceria.  
* \#5CC2F2 (*Sky Blue*) \- Navigasi aktif, tombol "Start Learning", laut dasar globe.  
* \#FFFCE8 (*Soft Cream*) \- Kotak teks materi, background panel info, kotak kuis.  
* \#FFB347 (*Soft Orange*) \- Highlight progres ("30% Countries Explored"), highlight skor.  
* \#2EC4B6 (*Sage Green / Teal*) \- Jawaban kuis benar, badge level Expert.  
* \#1E3A5F (*Midnight Navy*) \- Warna teks utama agar kontras tinggi dan mudah dibaca.

## **3\. Spesifikasi Teknologi (Tech Stack & Versi Aman 2026\)**

Untuk memastikan kompatibilitas penuh dengan server cPanel berbiaya rendah, arsitektur didesain menggunakan **Unified JavaScript Stack** (React \+ Node.js):

|

| **Lapisan (Layer)** | **Teknologi** | **Versi Stabil (2026)** | **Alasan & Keuntungan** |

| **Front-End Framework** | React (Vite Bundler) | 19.2.x | Performa render UI sangat cepat, hemat memori di perangkat HP anak. |

| **CSS Styling** | Tailwind CSS | 3.4.x / 4.0.x | Desain responsif mobile-first cepat dibuat tanpa menulis CSS manual berlebih. |

| **Peta Globe 3D** | react-globe.gl | 2.28.x | Berbasis WebGL, sangat responsif di layar sentuh HP/Tablet untuk digulir. |

| **Back-End API** | Node.js (Express.js) | 24.x (LTS) | **Sangat direkomendasikan** dibanding Python. Node.js berjalan native di cPanel. |

| **Database** | MySQL | 8.0.x | Bawaan cPanel, stabil, query relasional cepat. |

| **AI Integration** | Google Gen AI SDK | @google/generative-ai | Library resmi Node.js untuk akses instan ke Gemini 2.5 Flash. |

## **4\. Skema Basis Data (MySQL cPanel \- Multi-Inovasi)**

Satu negara dapat memiliki **lebih dari satu** inovasi teknologi. Struktur relasional ini memisahkan tabel negara dan tabel inovasi secara rapi:

\-- 1\. Tabel Informasi Pengguna (Mendukung Login Google & Guest)  
CREATE TABLE users (  
    id INT AUTO\_INCREMENT PRIMARY KEY,  
    username VARCHAR(100) NOT NULL,  
    email VARCHAR(150) NULL UNIQUE, \-- NULL jika Guest  
    auth\_provider ENUM('google', 'guest') DEFAULT 'guest',  
    registration\_date DATETIME DEFAULT CURRENT\_TIMESTAMP  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

\-- 2\. Tabel Data Negara  
CREATE TABLE countries (  
    id INT AUTO\_INCREMENT PRIMARY KEY,  
    country\_code VARCHAR(3) NOT NULL UNIQUE, \-- ISO 3 huruf (cth: 'JPN', 'DEU', 'IDN')  
    country\_name\_id VARCHAR(100) NOT NULL,    \-- Nama versi Indonesia  
    country\_name\_en VARCHAR(100) NOT NULL,    \-- Nama versi Inggris  
    continent ENUM('Asia', 'Europe', 'America', 'Africa') NOT NULL  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

\-- 3\. Tabel Inovasi Teknologi (Satu Negara Bisa Banyak Inovasi)  
CREATE TABLE innovations (  
    id INT AUTO\_INCREMENT PRIMARY KEY,  
    country\_id INT NOT NULL,  
    title\_id VARCHAR(200) NOT NULL,        \-- Judul versi Indonesia  
    title\_en VARCHAR(200) NOT NULL,        \-- Judul versi Inggris  
    description\_id TEXT NOT NULL,          \-- Deskripsi versi Indonesia  
    description\_en TEXT NOT NULL,          \-- Deskripsi versi Inggris  
    icon\_name VARCHAR(100) NOT NULL,       \-- Nama file ikon (cth: 'icon\_asia\_robot.png')  
    FOREIGN KEY (country\_id) REFERENCES countries(id) ON DELETE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

\-- 4\. Tabel Progres Belajar & Logika Adaptif AI  
CREATE TABLE user\_progress (  
    id INT AUTO\_INCREMENT PRIMARY KEY,  
    user\_id INT NOT NULL,  
    innovation\_id INT NOT NULL,  
    highest\_score INT DEFAULT 0, \-- Nilai kuis tertinggi (0-5)  
    attempts\_count INT DEFAULT 0,  
    student\_skill\_level ENUM('Beginner', 'Intermediate', 'Expert') DEFAULT 'Beginner',  
    last\_updated DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    FOREIGN KEY (user\_id) REFERENCES users(id) ON DELETE CASCADE,  
    FOREIGN KEY (innovation\_id) REFERENCES innovations(id) ON DELETE CASCADE,  
    UNIQUE KEY user\_innovation\_unique (user\_id, innovation\_id)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

## **5\. Struktur Folder Detail Proyek (React \+ Node.js)**

Berbeda dengan Laravel yang bersifat monolitik (menyatukan visual Blade dan backend logic dalam satu folder), TechGo menggunakan arsitektur **decoupled** (terpisah).

### **5.1 Struktur Saat Tahap Pengembangan (Lokal di Komputer Anda)**

Saat mengoding di komputer lokal, Anda membagi folder proyek menjadi dua bagian utama: Frontend (React) dan Backend (Express API).

/ (TechGo Project Root)  
├── techgo\_frontend/                  \<-- \[FRONTEND \- REACT\] Letak seluruh visual/halaman web Anda\!  
│   ├── src/  
│   │   ├── components/               \<-- Komponen UI kecil (Navbar.jsx, Button.jsx, Globe3D.jsx)  
│   │   ├── pages/                    \<-- DI SINI LETAK SETIAP HALAMAN WEB ANDA\!  
│   │   │   ├── LandingPage.jsx       \<-- Tampilan awal (Tombol Jelajah, Login Google / Guest)  
│   │   │   ├── MapPage.jsx           \<-- Tampilan Globe 3D & panel detail inovasi negara  
│   │   │   ├── ProfilePage.jsx       \<-- Tampilan profil pencapaian siswa  
│   │   │   └── QuizPage.jsx          \<-- Tampilan kuis adaptif & layar selesai kuis  
│   │   ├── App.jsx                   \<-- Pengatur routing halaman (mirip routes/web.php di Laravel)  
│   │   └── main.jsx  
│   ├── package.json  
│   └── vite.config.js  
│  
└── techgo\_backend/                   \<-- \[BACKEND \- API EXPRESS\] Hanya mengolah database & AI Gemini  
    ├── config/  
    │   └── database.js               \<-- File koneksi MySQL cPanel  
    ├── controllers/  
    │   ├── authController.js         \<-- Logic login Google / Guest  
    │   ├── innovationController.js   \<-- Logic mengambil data negara & teknologi dari MySQL  
    │   └── aiController.js           \<-- Logic menembak API Gemini Flash untuk generate soal kuis  
    ├── routes/  
    │   └── api.js                    \<-- Route API (mirip routes/api.php di Laravel)  
    ├── package.json  
    └── server.js                     \<-- Entrypoint Server Node.js

### **5.2 Struktur Setelah Diunggah ke cPanel Hosting**

Setelah selesai mengoding secara lokal, Anda melakukan kompilasi React frontend (npm run build). Hasil build tersebut berupa file HTML statis yang diletakkan di public\_html agar bisa diakses pengguna, sedangkan backend Node.js diletakkan dengan aman di luar folder publik.

/ (Home Directory Server cPanel Anda)  
├── public\_html/                      \<-- Direktori Utama Web (Akses Publik)  
│   ├── index.html                    \<-- File HTML utama hasil build React (Vite)  
│   ├── assets/                       \<-- Berisi bundle CSS, JS, dan file Gambar dari desainer Anda  
│   └── .htaccess                     \<-- Routing bantuan agar React Router tidak 404 saat direfresh  
│  
└── techgo\_backend/                   \<-- Direktori Backend Node.js (Aman di luar public\_html)  
    ├── node\_modules/  
    ├── config/  
    │   └── database.js  
    ├── controllers/  
    │   ├── authController.js  
    │   ├── innovationController.js  
    │   └── aiController.js  
    ├── routes/  
    │   └── api.js  
    ├── package.json  
    └── server.js                     \<-- Startup Script untuk Node App cPanel

### **5.3 Tabel Pemetaan Konseptual: Laravel vs. TechGo (React \+ Node.js)**

Gunakan tabel ini sebagai kamus penerjemah dari pola pikir Laravel Anda ke sistem TechGo yang baru:

| **Fungsi Arsitektur** | **Pada Laravel (Monolitik)** | **Pada TechGo (React \+ Node.js)** |

| **Letak Halaman Web (View)** | resources/views/\*.blade.php | techgo\_frontend/src/pages/\*.jsx (Ditulis menggunakan komponen React) |

| **Pengatur Alur / Routing** | routes/web.php | Client-side routing menggunakan **React Router** di dalam file App.jsx |

| **Routing Endpoint Data** | routes/api.php | techgo\_backend/routes/api.js (Express API) |

| **Controller Logic** | app/Http/Controllers/\* | techgo\_backend/controllers/\* (Express Controllers) |

| **Koneksi Database** | File .env & config/database.php | techgo\_backend/config/database.js |

| **Keluaran Server (Output)** | Merender HTML secara utuh ke browser | Mengirim data berupa **JSON** murni dari database MySQL / AI Gemini |

## **6\. Prompt AI Gemini Flash (Kuis Multi-Bahasa)**

Ketika memanggil Gemini Flash API, backend menyertakan parameter bahasa aktif siswa (language \= 'id' atau 'en'):

Anda adalah asisten guru sekolah menengah pertama global untuk materi teknologi.  
Tugas Anda adalah membuat 5 pertanyaan pilihan ganda (A, B, C) dalam BAHASA \[MASUKKAN\_BAHASA\_DI\_SINI: id/en\] berdasarkan materi teks berikut:  
Materi: "\[MASUKKAN\_DESKRIPSI\_MATERI\]"

Sesuaikan tingkat kesulitan dengan SKILL LEVEL siswa: \[MASUKKAN\_SKILL\_LEVEL: Beginner/Intermediate/Expert\]

Kembalikan respons WAJIB dalam format JSON murni:  
{  
  "quizzes": \[  
    {  
      "id": 1,  
      "question": "Pertanyaan di sini?",  
      "options": {  
        "A": "Pilihan A",  
        "B": "Pilihan B",  
        "C": "Pilihan C"  
      },  
      "correct\_answer": "A"  
    }  
  \]  
}

