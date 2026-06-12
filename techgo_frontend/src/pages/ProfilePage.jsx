import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  MapPin, 
  BookOpen, 
  Globe, 
  ArrowLeft, 
  User, 
  Lock, 
  Sparkles, 
  CheckCircle, 
  Smartphone, 
  Train, 
  Cpu, 
  Plane, 
  Laptop, 
  Leaf, 
  Rocket, 
  Sun,
  Flame,
  BarChart2,
  Compass,
  Wifi,
  Terminal
} from 'lucide-react';
import logoImg from '../assets/logo.png';

// Data negara fallback lokal untuk pembacaan lencana
const COUNTRIES_DATA = [
  { id: 1, code: 'IDN', nameId: 'Indonesia', nameEn: 'Indonesia', titleId: 'Sensor Pertanian Pintar IoT', titleEn: 'Smart Agriculture IoT Sensors', icon: 'iot', color: 'brandRose' },
  { id: 2, code: 'JPN', nameId: 'Jepang', nameEn: 'Japan', titleId: 'Kereta Cepat Magnetik Shinkansen', titleEn: 'Shinkansen Magnetic Bullet Train', icon: 'train', color: 'brandBlue' },
  { id: 3, code: 'KOR', nameId: 'Korea Selatan', nameEn: 'South Korea', titleId: 'Jaringan Robotik & Kota Pintar 5G', titleEn: '5G Robotic Smart City Network', icon: '5g', color: 'brandTeal' },
  { id: 4, code: 'DEU', nameId: 'Jerman', nameEn: 'Germany', titleId: 'Otomasi Industri Robotik 4.0', titleEn: 'Industry 4.0 Robotic Automation', icon: 'industry', color: 'brandOrange' },
  { id: 5, code: 'FRA', nameId: 'Prancis', nameEn: 'France', titleId: 'Pesawat Terbang Bertenaga Surya Bersih', titleEn: 'Clean Solar-Powered Aircraft', icon: 'plane', color: 'brandRose' },
  { id: 6, code: 'GBR', nameId: 'Inggris', nameEn: 'United Kingdom', titleId: 'Komputer Mikro Edukasi Raspberry Pi', titleEn: 'Raspberry Pi Educational Micro-Computer', icon: 'pi', color: 'brandBlue' },
  { id: 7, code: 'USA', nameId: 'Amerika Serikat', nameEn: 'United States', titleId: 'Roket Reusable SpaceX Falcon 9', titleEn: 'SpaceX Falcon 9 Reusable Rocket', icon: 'rocket', color: 'brandTeal' },
  { id: 8, code: 'BRA', nameId: 'Brasil', nameEn: 'Brazil', titleId: 'Bahan Bakar Bersih Bioetanol Tebu', titleEn: 'Clean Sugarcane Bioethanol Fuel', icon: 'biofuel', color: 'brandOrange' },
  { id: 9, code: 'KEN', nameId: 'Kenya', nameEn: 'Kenya', titleId: 'Sistem Uang Elektronik Seluler M-Pesa', titleEn: 'M-Pesa Mobile Money Network', icon: 'money', color: 'brandRose' },
  { id: 10, code: 'EGY', nameId: 'Mesir', nameEn: 'Egypt', titleId: 'Mega Proyek Surya Gurun Benban', titleEn: 'Benban Desert Mega Solar Grid', icon: 'solar', color: 'brandBlue' },
  { id: 11, code: 'AUS', nameId: 'Australia', nameEn: 'Australia', titleId: 'Jaringan Wi-Fi Nirkabel Komersial', titleEn: 'Commercial Wireless Wi-Fi Network', icon: 'wifi', color: 'brandTeal' },
  { id: 12, code: 'FIN', nameId: 'Finlandia', nameEn: 'Finland', titleId: 'Sistem Operasi Open Source Linux', titleEn: 'Linux Open Source Operating System', icon: 'linux', color: 'brandOrange' }
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { user } = useAuth();
  
  // State data progres per negara
  const [progresList, setProgresList] = useState([]);
  const [stats, setStats] = useState({
    countriesExplored: 0,
    avgScore: 0,
    overallRank: 'Beginner'
  });

  useEffect(() => {
    // Membaca data progress dari localStorage untuk ke-12 negara
    const list = COUNTRIES_DATA.map((c) => {
      const level = localStorage.getItem(`techgo_skill_${c.id}`) || 'Beginner';
      const score = parseInt(localStorage.getItem(`techgo_score_${c.id}`) || '0');
      return {
        ...c,
        level,
        score
      };
    });

    setProgresList(list);

    // Hitung Statistik
    const explored = list.filter(item => item.score > 0 || item.level !== 'Beginner').length;
    
    const playedItems = list.filter(item => item.score > 0);
    const sumScore = playedItems.reduce((sum, item) => sum + (item.score * 20), 0); // jadikan skala 100
    const avg = playedItems.length > 0 ? Math.round(sumScore / playedItems.length) : 0;

    // Tentukan Pangkat/Rank berdasarkan level tertinggi yang ada
    let rank = 'Beginner';
    const hasExpert = list.some(item => item.level === 'Expert');
    const hasIntermediate = list.some(item => item.level === 'Intermediate');
    
    if (hasExpert) {
      rank = 'Expert';
    } else if (hasIntermediate) {
      rank = 'Intermediate';
    }

    setStats({
      countriesExplored: explored,
      avgScore: avg,
      overallRank: rank
    });
  }, []);

  // Mendapatkan komponen ikon yang cocok berdasarkan string
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'iot': return <Cpu className="w-8 h-8 text-brandRose" />;
      case 'train': return <Train className="w-8 h-8 text-brandBlue" />;
      case '5g': return <Smartphone className="w-8 h-8 text-brandTeal" />;
      case 'industry': return <Cpu className="w-8 h-8 text-brandOrange" />;
      case 'plane': return <Plane className="w-8 h-8 text-brandRose" />;
      case 'pi': return <Laptop className="w-8 h-8 text-brandBlue" />;
      case 'rocket': return <Rocket className="w-8 h-8 text-brandTeal" />;
      case 'biofuel': return <Leaf className="w-8 h-8 text-brandOrange" />;
      case 'money': return <Smartphone className="w-8 h-8 text-brandRose" />;
      case 'solar': return <Sun className="w-8 h-8 text-brandBlue" />;
      case 'wifi': return <Wifi className="w-8 h-8 text-brandTeal" />;
      case 'linux': return <Terminal className="w-8 h-8 text-brandOrange" />;
      default: return <Award className="w-8 h-8 text-brandBlue" />;
    }
  };

  // Helper mendapatkan warna level tag
  const getLevelStyles = (lvl) => {
    if (lvl === 'Expert') return { bg: 'bg-brandTeal/15 text-brandTeal border-brandTeal/40', text: t('profilePage.levelExpert') };
    if (lvl === 'Intermediate') return { bg: 'bg-brandOrange/15 text-brandOrange border-brandOrange/40', text: t('profilePage.levelIntermediate') };
    return { bg: 'bg-brandBlue/15 text-brandBlue border-brandBlue/40', text: t('profilePage.levelBeginner') };
  };

  // Helper mendapatkan warna lencana medallion
  const getBadgeColors = (lvl, isLocked) => {
    if (isLocked) return 'bg-brandBlue/5 border-dashed border-brandBlue/35 text-brandBlue/40';
    if (lvl === 'Expert') return 'bg-brandTeal/20 border-brandTeal shadow-[0_0_12px_rgba(46,196,182,0.25)] text-brandTeal';
    if (lvl === 'Intermediate') return 'bg-brandOrange/20 border-brandOrange text-brandOrange';
    return 'bg-brandBlue/20 border-brandBlue text-brandBlue';
  };

  return (
    <div className="min-h-screen bg-brandCream font-quicksand flex flex-col justify-between overflow-x-hidden relative selection:bg-brandRose selection:text-white">
      
      {/* HEADER NAVIGASI */}
      <header className="w-full px-6 py-3 flex justify-between items-center bg-white/70 backdrop-blur-md border-b-4 border-brandBlue/10 z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/map')}>
          <img src={logoImg} alt="TechGo Logo" className="h-12 w-auto hover:scale-105 transition-playful" />
        </div>

        {/* Language & Action buttons */}
        <div className="flex items-center gap-3">
          <div className="bg-brandNavy/5 p-1 rounded-xl flex border-2 border-brandNavy/10">
            <button 
              onClick={() => changeLanguage('id')}
              className={`px-3 py-1 rounded-lg font-fredoka text-xs transition-playful cursor-pointer ${
                language === 'id' ? 'bg-brandBlue text-white shadow-sm font-bold' : 'text-brandNavy hover:bg-brandNavy/10'
              }`}
            >
              ID
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-lg font-fredoka text-xs transition-playful cursor-pointer ${
                language === 'en' ? 'bg-brandBlue text-white shadow-sm font-bold' : 'text-brandNavy hover:bg-brandNavy/10'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 px-4 py-2 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-2xl font-fredoka text-sm shadow-md border-b-4 border-brandBlue/70 transition-playful cursor-pointer font-bold"
          >
            <ArrowLeft size={16} />
            <span>{t('profilePage.btnBack')}</span>
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 z-10 flex flex-col gap-8">
        
        {/* ROW 1: KARTU PROFIL & STATS */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* KARTU PROFIL USER */}
          <div className="flex-1 bg-white border-8 border-brandBlue rounded-[3rem] p-6 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden transition-playful hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brandRose/10 rounded-bl-[6rem] -z-10"></div>
            
            {/* Avatar Playful */}
            <div className="w-24 h-24 rounded-full bg-brandRose border-8 border-brandCream flex items-center justify-center text-white text-3xl font-fredoka font-bold shadow-xl mb-4 select-none">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'PT'}
            </div>

            <h2 className="text-2xl text-brandNavy font-fredoka mb-1 flex items-center justify-center gap-1.5">
              <User size={20} className="text-brandRose" />
              <span>{user?.username || t('profilePage.guestUser')}</span>
            </h2>
            
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${
              user && !user.isGuest 
                ? 'bg-brandTeal/10 text-brandTeal border-brandTeal/30' 
                : 'bg-brandOrange/10 text-brandOrange border-brandOrange/30'
            }`}>
              {user && !user.isGuest ? t('profilePage.googleUser') : t('profilePage.guestUser')}
            </span>

            {user?.email && (
              <span className="text-xs text-brandNavy/50 font-bold mt-2 font-mono">{user.email}</span>
            )}
          </div>

          {/* KARTU STATISTIK PETUALANG */}
          <div className="lg:w-2/3 bg-white border-8 border-brandOrange rounded-[3rem] p-6 shadow-2xl flex flex-col justify-between transition-playful hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-brandNavy font-fredoka flex items-center gap-2">
                <BarChart2 className="text-brandOrange" size={24} />
                <span>{t('profilePage.statsTitle')}</span>
              </h3>
              <Sparkles className="text-brandOrange" size={20} />
            </div>

            {/* Grid 3 Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Stat 1: Negara Dijelajahi */}
              <div className="bg-brandBlue/10 border-4 border-brandBlue/35 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                <Globe className="text-brandBlue mb-2" size={32} />
                <span className="text-3xl font-fredoka text-brandNavy font-bold">{stats.countriesExplored} / {progresList.length}</span>
                <span className="text-xs text-brandNavy/60 font-bold mt-1">{t('profilePage.statCountries')}</span>
              </div>

              {/* Stat 2: Rata-rata Skor */}
              <div className="bg-brandTeal/10 border-4 border-brandTeal/35 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                <Flame className="text-brandTeal mb-2" size={32} />
                <span className="text-3xl font-fredoka text-brandNavy font-bold">{stats.avgScore}</span>
                <span className="text-xs text-brandNavy/60 font-bold mt-1">{t('profilePage.statAvgScore')}</span>
              </div>

              {/* Stat 3: Level Peringkat */}
              <div className="bg-brandRose/10 border-4 border-brandRose/35 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                <Award className="text-brandRose mb-2" size={32} />
                <span className="text-2xl font-fredoka text-brandNavy font-bold">
                  {stats.overallRank === 'Expert' ? t('profilePage.levelExpert') : 
                   stats.overallRank === 'Intermediate' ? t('profilePage.levelIntermediate') : 
                   t('profilePage.levelBeginner')}
                </span>
                <span className="text-xs text-brandNavy/60 font-bold mt-1">{t('profilePage.statLevel')}</span>
              </div>

            </div>

            {/* Progress Bar Visual */}
            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold text-brandNavy/70 mb-1.5 items-center">
                <span className="flex items-center gap-1.5">
                  <Compass className="text-brandTeal" size={16} />
                  <span>{language === 'en' ? 'Global Exploration Progress' : 'Progres Eksplorasi Global'}</span>
                </span>
                <span>{Math.round((stats.countriesExplored / (progresList.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full h-5 bg-brandNavy/5 rounded-full overflow-hidden border-2 border-brandNavy/10 p-0.5">
                <div 
                  className="h-full bg-brandTeal rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.round((stats.countriesExplored / (progresList.length || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

          </div>

        </div>

        {/* ROW 2: KOLEKSI BADGES/LENCANA */}
        <div className="bg-white border-8 border-brandTeal rounded-[3rem] p-6 sm:p-8 shadow-2xl">
          
          <h3 className="text-2xl text-brandNavy font-fredoka mb-6 flex items-center gap-2">
            <Award className="text-brandTeal" size={28} />
            <span>{t('profilePage.badgesTitle')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {progresList.map((item) => {
              const isLocked = item.score === 0 && item.level === 'Beginner';
              const levelStyle = getLevelStyles(item.level);
              
              return (
                <div 
                  key={item.id}
                  className={`
                    border-4 rounded-3xl p-5 flex flex-col items-center text-center relative transition-playful border-b-6 cursor-default
                    ${isLocked 
                      ? 'border-brandBlue/20 bg-brandCream/40 border-dashed hover:-translate-y-1 hover:border-brandOrange/40' 
                      : 'border-brandBlue/35 bg-[#white] hover:-translate-y-2 hover:scale-[1.03] hover:shadow-lg'
                    }
                  `}
                >
                  
                  {/* Badge Medallion */}
                  <div className={`
                    w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 transition-all duration-500 relative
                    ${getBadgeColors(item.level, isLocked)}
                  `}>
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-brandBlue/45" />
                    ) : (
                      getIcon(item.icon)
                    )}

                    {/* Efek Bintang jika Expert */}
                    {item.level === 'Expert' && !isLocked && (
                      <span className="absolute -top-1.5 -right-1.5 text-xs">✨</span>
                    )}
                  </div>

                  {/* Bendera / Nama Negara */}
                  <span className={`font-fredoka text-base leading-tight ${
                    isLocked ? 'text-brandNavy/50' : 'text-brandNavy'
                  }`}>
                    {language === 'id' ? item.nameId : item.nameEn}
                  </span>

                  {/* Judul Inovasi */}
                  <span className={`text-[10px] font-semibold line-clamp-2 min-h-[2.5rem] mt-1 mb-3 ${
                    isLocked ? 'text-brandNavy/40' : 'text-brandNavy/65'
                  }`}>
                    {language === 'id' ? item.titleId : item.titleEn}
                  </span>

                  {/* Level & Score Badge */}
                  {isLocked ? (
                    <div className="mt-auto w-full">
                      <span className="bg-brandBlue/10 text-brandBlue text-[9px] font-fredoka px-2.5 py-0.5 rounded-full border border-brandBlue/30">
                        {t('profilePage.lockedBadge')}
                      </span>
                      <span className="text-[8px] text-brandNavy/45 font-semibold block mt-1.5 leading-tight">
                        {t('profilePage.unlockHint')}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-auto flex flex-col items-center gap-1.5 w-full">
                      {/* Tag Level */}
                      <span className={`text-[10px] font-fredoka px-2.5 py-0.5 rounded-full border-2 ${levelStyle.bg}`}>
                        {levelStyle.text}
                      </span>
                      {/* Skor Tertinggi */}
                      <span className="text-[9px] text-brandNavy/65 font-bold font-mono">
                        {t('profilePage.highestScore')} <span className="text-brandRose font-black">{item.score * 20}</span>
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 text-xs text-brandNavy/40 font-quicksand font-bold z-10 border-t-2 border-brandBlue/5 bg-white/20">
        © 2026 TechGo - Didukung oleh Google Gemini Flash API.
      </footer>
    </div>
  );
}
