import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import QuizPage from './pages/QuizPage';

// Komponen Utama App yang mengintegrasikan Router dan Context Providers
function App() {
  return (
    // Membungkus aplikasi dengan penyedia bahasa multibahasa
    <LanguageProvider>
      {/* Membungkus aplikasi dengan penyedia status autentikasi Google/Guest */}
      <AuthProvider>
        {/* Menggunakan HashRouter agar rute kompatibel penuh di cPanel shared hosting saat di-refresh */}
        <Router>
          <Routes>
            {/* Rute ke Landing Page utama */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Rute ke Peta Inovasi 3D (diakses setelah masuk akun/guest) */}
            <Route path="/map" element={<MapPage />} />

            {/* Rute ke Halaman Kuis Adaptif AI */}
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
