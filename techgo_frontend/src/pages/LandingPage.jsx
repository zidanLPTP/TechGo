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
  const [loginMode, setLoginMode] = useState('select'); // 'select' atau 'guest'
  
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
    if (mode === 'guest') {
      setLoginMode('guest');
    } else {
      setLoginMode('select');
    }
    setNickname('');
    setEmail('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Menangani submit login pengguna guest atau Google input kustom
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg(t('modal.validationName'));
      return;
    }

    if (loginMode === 'google_input') {
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
      <header className="w-full px-6 py-2 md:py-3 flex justify-between items-center z-10 bg-white/60 backdrop-blur-md border-b-4 border-brandBlue/10">
        
        {/* Logo Gambar yang Disesuaikan Ukurannya */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImg} 
            alt="TechGo Logo" 
            className="h-12 w-auto object-contain hover:scale-105 transition-playful" 
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

      {/* 5. MODAL LOGIN (PLAYFUL POP-UP REDESIGNED) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Overlay Gelap Transparan Belakang */}
          <div 
            className="absolute inset-0 bg-brandNavy/45 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Kotak Konten Modal (rounded-[2.5rem] dengan bayangan tebal shadow-2xl, bersih tanpa border tebal) */}
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full z-20 shadow-2xl relative animate-float">
            
            {/* Header Modal (Tanpa emoji waving hand & tanpa subjudul) */}
            <div className="text-center mb-8">
              <h2 className="text-3xl text-brandNavy font-fredoka">
                Halo Sahabat TechGo!
              </h2>
            </div>

            {loginMode === 'select' && (
              /* Mode Pemilihan: Menyediakan dua pilihan aksi mandiri yang bersih */
              <div className="flex flex-col gap-4">
                
                {/* Tombol 1: Google Login (Official OAuth Style) */}
                <button 
                  type="button"
                  onClick={() => setLoginMode('google_select')}
                  className="flex items-center justify-center w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-4 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{language === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}</span>
                </button>

                {/* Tombol 2: Guest Login (Warna Soft Pink #FF6B9B, Playful & Bersih) */}
                <button 
                  type="button"
                  onClick={() => setLoginMode('guest')}
                  className="w-full py-3.5 bg-brandRose hover:bg-brandRose/90 text-white rounded-2xl font-fredoka text-lg transition-playful shadow-md border-b-4 border-brandRose/70 text-center cursor-pointer"
                >
                  {language === 'en' ? 'Sign in as Guest' : 'Masuk sebagai Tamu'}
                </button>

                {/* Tombol Batal */}
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 text-sm text-brandNavy/60 hover:text-brandNavy font-semibold text-center cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
              </div>
            )}

            {loginMode === 'google_select' && (
              /* Tampilan Simulasi Pemilih Akun Google (High-fidelity Google Account Chooser) */
              <div className="flex flex-col gap-4">
                {/* Header Akun Google */}
                <div className="text-center mb-2">
                  <div className="flex justify-center mb-2">
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {language === 'en' ? 'Choose an account' : 'Pilih akun'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'to continue to TechGo' : 'untuk melanjutkan ke TechGo'}
                  </p>
                </div>

                {/* Daftar Pilihan Akun Google Mock */}
                <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {/* Akun 1: Zidan TechGo */}
                  <button
                    type="button"
                    onClick={() => {
                      loginWithGoogle("zidan@gmail.com", "Zidan TechGo");
                      setIsModalOpen(false);
                      navigate('/map');
                    }}
                    className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-brandBlue text-white font-fredoka flex items-center justify-center font-bold text-lg mr-3">
                      Z
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Zidan TechGo</div>
                      <div className="text-xs text-gray-400">zidan@gmail.com</div>
                    </div>
                  </button>

                  {/* Akun 2: Sahabat TechGo */}
                  <button
                    type="button"
                    onClick={() => {
                      loginWithGoogle("sahabat@gmail.com", "Sahabat TechGo");
                      setIsModalOpen(false);
                      navigate('/map');
                    }}
                    className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-brandRose text-white font-fredoka flex items-center justify-center font-bold text-lg mr-3">
                      S
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Sahabat TechGo</div>
                      <div className="text-xs text-gray-400">sahabat@gmail.com</div>
                    </div>
                  </button>

                  {/* Akun 3: Gunakan akun lain */}
                  <button
                    type="button"
                    onClick={() => {
                      setNickname('');
                      setEmail('');
                      setLoginMode('google_input');
                    }}
                    className="flex items-center w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer text-gray-600 font-semibold text-sm"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>{language === 'en' ? 'Use another account' : 'Gunakan akun lain'}</span>
                  </button>
                </div>

                {/* Disclaimer Text */}
                <p className="text-[10px] text-gray-400 leading-relaxed text-center px-2 mt-2">
                  {language === 'en'
                    ? 'To continue, Google will share your name, email address, language preference, and profile picture with TechGo.'
                    : 'Untuk melanjutkan, Google akan membagikan nama, alamat email, preferensi bahasa, dan foto profil Anda dengan TechGo.'}
                </p>

                {/* Kembali ke Pilihan Login Mode */}
                <button
                  type="button"
                  onClick={() => setLoginMode('select')}
                  className="mt-2 text-sm text-brandNavy/60 hover:text-brandNavy font-semibold text-center cursor-pointer"
                >
                  {language === 'en' ? 'Back' : 'Kembali'}
                </button>
              </div>
            )}

            {loginMode === 'google_input' && (
              /* Mode Google Input: Form untuk memasukkan detail akun Google kustom */
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-bold text-brandNavy">
                    {language === 'en' ? 'Add Google Account' : 'Tambah Akun Google'}
                  </h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={language === 'en' ? 'Enter nickname...' : 'Tulis nama panggilanmu...'}
                    className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40"
                    maxLength={15}
                  />

                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'en' ? 'Enter Google email...' : 'Masukkan email Google...'}
                    className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40"
                  />
                </div>

                {errorMsg && (
                  <p className="text-brandRose font-fredoka text-sm text-center">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-4 mt-2">
                  <button 
                    type="button"
                    onClick={() => { setLoginMode('google_select'); setErrorMsg(''); }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-2xl font-fredoka text-base transition-playful border-b-4 border-slate-300 cursor-pointer"
                  >
                    {language === 'en' ? 'Back' : 'Kembali'}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-2xl font-fredoka text-base transition-playful border-b-4 border-brandTeal/70 shadow-md cursor-pointer"
                  >
                    {language === 'en' ? "Let's Go!" : 'Ayo Mulai!'}
                  </button>
                </div>
              </form>
            )}

            {loginMode === 'guest' && (
              /* Mode Guest Form: Hanya menyediakan kolom nama panggilan dan peringatan sebaris di bawah */
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <div>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={language === 'en' ? 'Enter your nickname...' : 'Tulis nama panggilanmu...'}
                    className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40"
                    maxLength={15}
                  />
                </div>

                {errorMsg && (
                  <p className="text-brandRose font-fredoka text-sm text-center">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-4 mt-2">
                  {/* Tombol Kembali */}
                  <button 
                    type="button"
                    onClick={() => { setLoginMode('select'); setNickname(''); setErrorMsg(''); }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-2xl font-fredoka text-base transition-playful border-b-4 border-slate-300 cursor-pointer"
                  >
                    {language === 'en' ? 'Back' : 'Kembali'}
                  </button>

                  {/* Tombol Submit Guest */}
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-2xl font-fredoka text-base transition-playful border-b-4 border-brandTeal/70 shadow-md cursor-pointer"
                  >
                    {language === 'en' ? "Let's Go!" : 'Ayo Mulai!'}
                  </button>
                </div>

                {/* Peringatan Konsekuensi Tamu Sebaris Kecil Elegan */}
                <p className="text-[11px] text-brandNavy/60 text-center leading-normal mt-2 font-semibold">
                  {language === 'en' 
                    ? '* Note: Learning progress and quiz scores will not be saved permanently.' 
                    : '* Info: Progres belajar dan hasil kuis tidak disimpan permanen.'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
