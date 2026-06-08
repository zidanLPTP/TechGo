import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function LandingPage() {
  const { language, changeLanguage, t } = useLanguage();
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  // State untuk modal login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginMode, setLoginMode] = useState('google'); // 'google' atau 'guest'
  
  // State untuk input formulir login
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // State untuk interaktivitas Bumi (eye-tracking & emotional reactions)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [emotion, setEmotion] = useState('neutral'); // 'neutral', 'happy', 'angry'
  const [clickCount, setClickCount] = useState(0);

  const earthRef = useRef(null);
  const emotionTimeoutRef = useRef(null);

  // 1. Efek Eye-Tracking: Pupil mata bergerak halus mendeteksi koordinat kursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!earthRef.current) return;

      const rect = earthRef.current.getBoundingClientRect();
      // Pusat koordinat pembacaan arah mata berada di tengah-tengah bola Bumi bulat utuh
      const earthCenterX = rect.left + rect.width * 0.5;
      const earthCenterY = rect.top + rect.height * 0.5;

      const dx = e.clientX - earthCenterX;
      const dy = e.clientY - earthCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return;

      // Batasi pergeseran pupil mata maksimum 6px agar tidak melompat keluar wadah
      const maxOffset = 6;
      const offsetX = (dx / distance) * Math.min(distance / 15, maxOffset);
      const offsetY = (dy / distance) * Math.min(distance / 15, maxOffset);

      setPupilOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 2. Efek State Emosi Bumi saat diklik / spam klik
  const handleEarthClick = () => {
    // Bersihkan timeout emosi sebelumnya jika ada
    if (emotionTimeoutRef.current) {
      clearTimeout(emotionTimeoutRef.current);
    }

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount > 3) {
      setEmotion('angry'); // Spam klik > 3 kali memicu ekspresi marah
    } else {
      setEmotion('happy'); // Klik biasa memicu ekspresi bahagia
    }

    // Kembalikan ke emosi normal setelah 1,5 detik diam
    emotionTimeoutRef.current = setTimeout(() => {
      setEmotion('neutral');
      setClickCount(0);
    }, 1500);
  };

  // Bersihkan timeout saat komponen dilepas
  useEffect(() => {
    return () => {
      if (emotionTimeoutRef.current) {
        clearTimeout(emotionTimeoutRef.current);
      }
    };
  }, []);

  // Menangani pembukaan modal login
  const openLoginModal = (mode) => {
    setLoginMode(mode);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Menangani submit login pengguna
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg(t('modal.validationName'));
      return;
    }

    if (loginMode === 'google') {
      const validEmail = email.trim() || `${nickname.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      loginWithGoogle(validEmail, nickname);
    } else {
      loginAsGuest(nickname);
    }

    setIsModalOpen(false);
    navigate('/map');
  };

  return (
    // Menggunakan min-h-screen dan max-w-full agar scroll alami vertikal aktif jika layar laptop terlalu pendek (tanpa memicu double scrollbar)
    <div className="min-h-screen max-w-full flex flex-col justify-between bg-brandCream font-quicksand relative selection:bg-brandRose selection:text-white select-none">
      
      {/* Ornamen Latar Belakang Playful */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brandRose/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brandBlue/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. NAVBAR ATAS (Logo di kiri yang disesuaikan, Toggle Bahasa di kanan) */}
      <header className="w-full px-6 py-2 md:py-3 md:px-12 flex justify-between items-center z-10 bg-white/60 backdrop-blur-md border-b-4 border-brandBlue/10">
        
        {/* Logo Gambar yang Disesuaikan Ukurannya */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImg} 
            alt="TechGo Logo" 
            className="w-14 h-14 md:w-16 md:h-16 object-contain hover:scale-105 transition-playful" 
          />
        </div>

        {/* Menu Navigasi Kanan (Hanya Toggle Bahasa) */}
        <div className="flex items-center gap-4">
          <div className="bg-brandNavy/5 p-1 rounded-2xl flex gap-1 border-2 border-brandNavy/10">
            <button 
              onClick={() => changeLanguage('id')}
              className={`px-3 py-1 rounded-xl font-fredoka text-sm transition-playful ${
                language === 'id' 
                  ? 'bg-brandBlue text-white shadow-sm' 
                  : 'text-brandNavy hover:bg-brandNavy/10'
              }`}
            >
              ID
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-xl font-fredoka text-sm transition-playful ${
                language === 'en' 
                  ? 'bg-brandBlue text-white shadow-sm' 
                  : 'text-brandNavy hover:bg-brandNavy/10'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO & EARTH SECTION (2-Column Grid on Desktop, Centered Flex on Mobile) */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        
        {/* Kolom Kiri: Deskripsi Teks & Tombol Aksi */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center">
          {/* Judul Utama */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-brandNavy font-fredoka leading-tight mb-6 max-w-xl">
            {t('hero.title')}
          </h1>
          
          {/* Teks Deskripsi Asli */}
          <p className="text-lg md:text-xl text-brandNavy/80 font-quicksand leading-relaxed mb-8 max-w-lg">
            {t('hero.description')}
          </p>

          {/* Tombol Aksi Utama & Login Berdampingan */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Tombol Kiri: Mulai Menjelajah (Sky Blue) */}
            <button 
              onClick={() => openLoginModal('guest')}
              className="py-4 px-8 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-3xl font-fredoka text-xl shadow-lg shadow-brandBlue/25 hover:scale-105 active:scale-95 transition-playful border-b-8 border-brandBlue/70 text-center w-full sm:w-auto"
            >
              {t('hero.btnExplore')}
            </button>

            {/* Tombol Kanan: Masuk (Soft Pink) */}
            <button 
              onClick={() => openLoginModal('google')}
              className="py-4 px-8 bg-brandRose hover:bg-brandRose/90 text-white rounded-3xl font-fredoka text-xl shadow-lg shadow-brandRose/25 hover:scale-105 active:scale-95 transition-playful border-b-8 border-brandRose/70 text-center w-full sm:w-auto"
            >
              {t('navbar.login')}
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Bola Bumi Bulat Utuh dengan Animasi Melayang */}
        <div className="flex justify-center items-center">
          <div 
            ref={earthRef}
            onClick={handleEarthClick}
            className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#5CC2F2] border-8 border-white shadow-2xl relative cursor-pointer select-none pointer-events-auto animate-float flex justify-center items-center overflow-hidden"
          >
            {/* SVG Bumi Bulat Utuh */}
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-full"
            >
              {/* Vektor Benua Sage Green (Eropa, Asia, Afrika) */}
              {/* Afrika */}
              <path 
                d="M 50,230 C 80,180 140,160 170,220 C 160,280 120,330 80,310 Z" 
                fill="#2EC4B6" 
              />
              {/* Eropa */}
              <path 
                d="M 120,150 C 140,90 190,70 230,110 C 210,160 170,170 130,170 Z" 
                fill="#2EC4B6" 
              />
              {/* Asia */}
              <path 
                d="M 200,160 C 250,80 340,90 360,200 C 300,240 250,230 200,210 Z" 
                fill="#2EC4B6" 
              />

              {/* PIPi MERONA MERAH MUDA (Blushing) */}
              <ellipse cx="135" cy="235" rx="14" ry="8" fill="#FF6B9B" opacity="0.8" />
              <ellipse cx="265" cy="235" rx="14" ry="8" fill="#FF6B9B" opacity="0.8" />

              {/* RENDERING WAJAH BERDASARKAN STATE EMOSI */}
              
              {/* A. EKSPRESI: NEUTRAL (Mata bulat mengikuti kursor, senyum kecil) */}
              {emotion === 'neutral' && (
                <>
                  {/* Mata Kiri (Vertical Oval) + Pupil Bergerak */}
                  <ellipse cx={160 + pupilOffset.x} cy={205 + pupilOffset.y} rx="8" ry="14" fill="#1E3A5F" />
                  <circle cx={157 + pupilOffset.x} cy={200 + pupilOffset.y} r="2.5" fill="#FFFFFF" />

                  {/* Mata Kanan (Vertical Oval) + Pupil Bergerak */}
                  <ellipse cx={240 + pupilOffset.x} cy={205 + pupilOffset.y} rx="8" ry="14" fill="#1E3A5F" />
                  <circle cx={237 + pupilOffset.x} cy={200 + pupilOffset.y} r="2.5" fill="#FFFFFF" />

                  {/* Senyum Kecil Imut */}
                  <path 
                    d="M 185,225 Q 200,240 215,225" 
                    fill="none" 
                    stroke="#1E3A5F" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                  />
                </>
              )}

              {/* B. EKSPRESI: HAPPY (Mata melengkung tersenyum, mulut terbuka ceria) */}
              {emotion === 'happy' && (
                <>
                  {/* Mata Squinting Kiri */}
                  <path 
                    d="M 148,210 Q 160,198 172,210" 
                    fill="none" 
                    stroke="#1E3A5F" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Mata Squinting Kanan */}
                  <path 
                    d="M 228,210 Q 240,198 252,210" 
                    fill="none" 
                    stroke="#1E3A5F" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                  />

                  {/* Mulut Terbuka Lebar Sangat Gembira */}
                  <path 
                    d="M 185,222 Q 200,248 215,222 Z" 
                    fill="#1E3A5F" 
                  />
                </>
              )}

              {/* C. EKSPRESI: ANGRY (Alis cemberut miring ke dalam, mulut melengkung ke bawah) */}
              {emotion === 'angry' && (
                <>
                  {/* Mata Bulat Marah */}
                  <circle cx="160" cy="195" r="11" fill="#1E3A5F" />
                  <circle cx="240" cy="195" r="11" fill="#1E3A5F" />

                  {/* Alis Marah Kiri (Miring ke dalam) */}
                  <path 
                    d="M 144,178 L 169,187" 
                    fill="none" 
                    stroke="#1E3A5F" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Alis Marah Kanan (Miring ke dalam) */}
                  <path 
                    d="M 256,178 L 231,187" 
                    fill="none" 
                    stroke="#1E3A5F" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                  />

                  {/* Mulut Cemberut Ke Bawah */}
                  <path 
                    d="M 190,223 Q 200,208 210,223" 
                    fill="none" 
                    stroke="#1E3A5F" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                  />
                </>
              )}
            </svg>
          </div>
        </div>
      </main>

      {/* Footer minimalis */}
      <footer className="w-full py-4 z-10"></footer>

      {/* 5. MODAL LOGIN (PLAYFUL POP-UP) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Overlay Gelap Transparan Belakang */}
          <div 
            className="absolute inset-0 bg-brandNavy/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Kotak Konten Modal */}
          <div className="bg-white rounded-5xl border-8 border-brandBlue p-6 sm:p-8 max-w-md w-full z-20 shadow-2xl relative animate-float">
            
            {/* Header Modal */}
            <div className="text-center mb-6">
              <h2 className="text-3xl text-brandNavy font-fredoka mb-2">{t('modal.title')}</h2>
              <p className="text-brandNavy/70 text-sm sm:text-base font-semibold">{t('modal.subtitle')}</p>
            </div>

            {/* Toggle Switch Mode Login di Dalam Modal */}
            <div className="bg-brandNavy/5 p-1 rounded-2xl flex gap-1 mb-6 border-2 border-brandNavy/10">
              <button 
                type="button"
                onClick={() => { setLoginMode('google'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl font-fredoka text-sm transition-playful flex items-center justify-center gap-2 ${
                  loginMode === 'google' 
                    ? 'bg-brandBlue text-white shadow-md' 
                    : 'text-brandNavy hover:bg-brandNavy/10'
                }`}
              >
                Google
              </button>
              <button 
                type="button"
                onClick={() => { setLoginMode('guest'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl font-fredoka text-sm transition-playful flex items-center justify-center gap-2 ${
                  loginMode === 'guest' 
                    ? 'bg-brandBlue text-white shadow-md' 
                    : 'text-brandNavy hover:bg-brandNavy/10'
                }`}
              >
                Guest (Tamu)
              </button>
            </div>

            {/* Peringatan Imut Khusus Tamu */}
            {loginMode === 'guest' && (
              <div className="bg-brandOrange/25 border-4 border-brandOrange/40 text-brandNavy p-4 rounded-3xl mb-6 text-xs sm:text-sm font-quicksand font-bold leading-relaxed">
                <p className="text-brandOrange font-fredoka text-base mb-1">📢 {t('modal.warningTitle')}</p>
                {t('modal.guestWarning')}
              </div>
            )}

            {/* Formulir Pengisian Data */}
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              
              {/* Kolom Nama Panggilan (Wajib) */}
              <div>
                <label className="block text-brandNavy font-fredoka text-base mb-2">
                  Nama Panggilanmu 👤
                </label>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('modal.usernamePlaceholder')}
                  className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40"
                  maxLength={15}
                />
              </div>

              {/* Kolom Email Google (Hanya jika memilih mode Google) */}
              {loginMode === 'google' && (
                <div>
                  <label className="block text-brandNavy font-fredoka text-base mb-2">
                    Email Google ✉️
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('modal.googlePlaceholder')}
                    className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40"
                  />
                </div>
              )}

              {/* Pesan Kesalahan Validasi */}
              {errorMsg && (
                <p className="text-brandRose font-fredoka text-sm text-center">
                  ⚠️ {errorMsg}
                </p>
              )}

              {/* Aksi Tombol Form */}
              <div className="flex gap-4 mt-4">
                
                {/* Tombol Cancel */}
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-3xl font-fredoka text-base transition-playful border-b-4 border-slate-300"
                >
                  {t('modal.cancelAction')}
                </button>

                {/* Tombol Submit Login */}
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-3xl font-fredoka text-base transition-playful border-b-4 border-brandTeal/70 shadow-md"
                >
                  {t('modal.loginAction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
