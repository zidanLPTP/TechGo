import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Globe, User, LogIn, ChevronRight } from 'lucide-react';

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

  // Membuka modal dan mengatur tipe login default
  const openLoginModal = (mode) => {
    setLoginMode(mode);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Menangani submit login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg(t('modal.validationName'));
      return;
    }

    if (loginMode === 'google') {
      // Simulasi login Google dengan input email sederhana
      const validEmail = email.trim() || `${nickname.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      loginWithGoogle(validEmail, nickname);
    } else {
      // Login sebagai Guest
      loginAsGuest(nickname);
    }

    // Tutup modal dan arahkan ke halaman MapPage
    setIsModalOpen(false);
    navigate('/map');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brandCream font-quicksand overflow-hidden relative selection:bg-brandRose selection:text-white">
      
      {/* Ornamen Latar Belakang Playful */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brandRose/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brandBlue/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. NAVBAR ATAS */}
      <header className="w-full px-6 py-4 md:px-12 flex justify-between items-center z-10 bg-white/60 backdrop-blur-md border-b-4 border-brandBlue/10">
        
        {/* Logo Platform */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-brandBlue rounded-2xl flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-playful">
            <Globe size={24} className="animate-spin-slow" />
          </div>
          <span className="text-2xl font-fredoka font-bold text-brandNavy tracking-wide">
            Tech<span className="text-brandRose">Go</span>
          </span>
        </div>

        {/* Menu Navigasi Kanan */}
        <div className="flex items-center gap-4">
          
          {/* Toggle Bahasa ID / EN */}
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

          {/* Tombol Masuk Akun Navbar */}
          <button 
            onClick={() => openLoginModal('google')}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-brandRose hover:bg-brandRose/90 text-white rounded-2xl font-fredoka text-base shadow-md hover:scale-105 transition-playful"
          >
            <LogIn size={18} />
            {t('navbar.login')}
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 z-10">
        
        {/* Sisi Kiri: Teks & Aksi */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl">
          
          {/* Tagline Kecil Playful */}
          <div className="inline-block px-4 py-1.5 bg-brandRose/20 border-2 border-brandRose/40 text-brandRose rounded-full text-sm font-fredoka font-semibold tracking-wider uppercase mb-6 animate-bounce-slow">
            ✨ {t('hero.tagline')}
          </div>
          
          {/* Judul Utama */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-brandNavy font-fredoka leading-tight mb-6">
            {t('hero.title')}
          </h1>
          
          {/* Deskripsi Singkat */}
          <p className="text-base sm:text-lg text-brandNavy/80 font-quicksand font-medium leading-relaxed mb-8">
            {t('hero.description')}
          </p>

          {/* Tombol Pilihan Aksi */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            
            {/* Tombol Utama: Mulai Menjelajah */}
            <button 
              onClick={() => openLoginModal('guest')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-3xl font-fredoka text-xl shadow-lg shadow-brandBlue/35 hover:scale-105 active:scale-95 transition-playful border-b-8 border-brandBlue/70"
            >
              <span>{t('hero.btnExplore')}</span>
              <ChevronRight size={22} />
            </button>

            {/* Tombol Sekunder: Masuk Akun */}
            <button 
              onClick={() => openLoginModal('google')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-brandNavy rounded-3xl font-fredoka text-xl shadow-md border-4 border-brandBlue/30 hover:scale-105 active:scale-95 transition-playful"
            >
              <LogIn size={20} className="text-brandRose" />
              <span>{t('hero.btnEnter')}</span>
            </button>
          </div>

          {/* Statistik Menarik Ramah Anak */}
          <div className="flex items-center gap-6 mt-12 pt-8 border-t-4 border-brandBlue/10 w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span className="font-fredoka text-brandNavy font-bold text-sm sm:text-base">
                {t('hero.statsCountries')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="font-fredoka text-brandNavy font-bold text-sm sm:text-base">
                {t('hero.statsLevel')}
              </span>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Bumi Animasi Unyu (SVG) */}
        <div className="flex-1 flex justify-center items-center relative w-full max-w-md animate-float">
          
          {/* Efek Cincin Orbit Bumi */}
          <div className="absolute w-[110%] h-[30%] border-[6px] border-dashed border-brandBlue/30 rounded-full rotate-[-15deg] pointer-events-none"></div>
          
          {/* Shadow Halus di Bawah */}
          <div className="absolute bottom-[-20px] w-[60%] h-6 bg-brandNavy/10 rounded-full blur-md"></div>

          {/* SVG Bumi Lucu */}
          <svg 
            viewBox="0 0 400 400" 
            className="w-72 h-72 sm:w-96 sm:h-96 z-10 drop-shadow-xl select-none"
          >
            {/* Laut (Base Globe) */}
            <circle cx="200" cy="200" r="180" fill="#5CC2F2" />
            
            {/* Benua/Daratan Hijau (Bentuk abstrak ramah anak) */}
            {/* Amerika Utara/Selatan */}
            <path 
              d="M 90,120 Q 120,130 130,160 T 90,240 T 110,310 Q 80,310 70,270 T 70,180 Z" 
              fill="#2EC4B6" 
            />
            {/* Eurasia & Afrika */}
            <path 
              d="M 220,90 Q 280,100 310,130 T 330,220 Q 300,240 280,210 T 230,240 T 210,310 Q 180,320 180,270 T 210,150 Z" 
              fill="#2EC4B6" 
            />
            {/* Australia */}
            <path 
              d="M 280,290 Q 310,280 320,310 T 270,330 Z" 
              fill="#2EC4B6" 
            />

            {/* Mata Kiri (Besar & Imut) */}
            <circle cx="160" cy="180" r="14" fill="#1E3A5F" />
            <circle cx="156" cy="174" r="5" fill="#FFFFFF" />
            
            {/* Mata Kanan (Bisa berkedip) */}
            <circle cx="240" cy="180" r="14" fill="#1E3A5F" />
            <circle cx="236" cy="174" r="5" fill="#FFFFFF" />

            {/* Pipi Merona Merah Muda (Blushing) */}
            <circle cx="135" cy="205" r="15" fill="#FF6B9B" opacity="0.6" />
            <circle cx="265" cy="205" r="15" fill="#FF6B9B" opacity="0.6" />

            {/* Senyuman Bahagia */}
            <path 
              d="M 185,200 Q 200,220 215,200" 
              fill="none" 
              stroke="#1E3A5F" 
              strokeWidth="6" 
              strokeLinecap="round" 
            />

            {/* Bintang-bintang Penghias di Sekitar */}
            <path d="M 50,80 L 53,86 L 60,87 L 55,92 L 56,98 L 50,95 L 44,98 L 45,92 L 40,87 L 47,86 Z" fill="#FFB347" />
            <path d="M 340,70 L 342,74 L 347,75 L 343,79 L 344,84 L 340,81 L 336,84 L 337,79 L 333,75 L 338,74 Z" fill="#FFB347" />
            <path d="M 320,250 L 322,254 L 327,255 L 323,259 L 324,264 L 320,261 L 316,264 L 317,259 L 313,255 L 318,254 Z" fill="#FFB347" />
          </svg>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full text-center py-6 text-sm text-brandNavy/60 font-quicksand font-bold z-10 border-t-4 border-brandBlue/5 bg-white/30 backdrop-blur-sm">
        {t('footer.copyright')}
      </footer>

      {/* 4. MODAL LOGIN (PLAYFUL POP-UP) */}
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
