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

  // ─── MASKOT BUMI STATE ────────────────────────────────────────────────────
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [emotion, setEmotion] = useState('neutral'); // 'neutral', 'happy', 'angry'
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);    // goyang saat marah
  const [isBlinking, setIsBlinking] = useState(false);  // blink manual

  const earthRef = useRef(null);
  const emotionTimeoutRef = useRef(null);
  const blinkIntervalRef = useRef(null);

  // ─── TIME-BASED THEME ENGINE ─────────────────────────────────────────────
  const getThemeByHour = (hour) => {
    if (hour >= 5 && hour < 11) return 'pagi';
    if (hour >= 11 && hour < 15) return 'siang';
    if (hour >= 15 && hour < 18.5) return 'sore';
    return 'malam';
  };

  const [themeMode, setThemeMode] = useState(() => {
    const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
    return getThemeByHour(currentHour);
  });

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const themeConfigs = {
    pagi: {
      bgClass: 'bg-gradient-to-br from-pink-200 via-orange-100 to-yellow-50',
      textClass: 'text-brandNavy',
      textMutedClass: 'text-brandNavy/80',
      borderClass: 'border-brandBlue/10',
      navButtonClass: 'text-brandNavy hover:bg-brandNavy/10',
      logoBlur: 'bg-brandRose/20',
      glowBlur: 'bg-brandBlue/25'
    },
    siang: {
      bgClass: 'bg-gradient-to-br from-blue-100 via-sky-100 to-amber-50',
      textClass: 'text-brandNavy',
      textMutedClass: 'text-brandNavy/80',
      borderClass: 'border-brandBlue/10',
      navButtonClass: 'text-brandNavy hover:bg-brandNavy/10',
      logoBlur: 'bg-brandBlue/20',
      glowBlur: 'bg-brandOrange/20'
    },
    sore: {
      bgClass: 'bg-gradient-to-br from-indigo-300 via-purple-200 to-orange-200',
      textClass: 'text-brandNavy',
      textMutedClass: 'text-brandNavy/80',
      borderClass: 'border-brandOrange/10',
      navButtonClass: 'text-brandNavy hover:bg-brandNavy/10',
      logoBlur: 'bg-brandOrange/20',
      glowBlur: 'bg-brandRose/20'
    },
    malam: {
      bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900',
      textClass: 'text-white',
      textMutedClass: 'text-white/80',
      borderClass: 'border-indigo-800/30',
      navButtonClass: 'text-white/80 hover:bg-white/10',
      logoBlur: 'bg-brandBlue/10',
      glowBlur: 'bg-indigo-500/20'
    }
  };

  const currentTheme = themeConfigs[themeMode] || themeConfigs.pagi;

  // ─── EFEK EYE-TRACKING ───────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!earthRef.current) return;
      const rect = earthRef.current.getBoundingClientRect();
      const earthCenterX = rect.left + rect.width * 0.5;
      const earthCenterY = rect.top + rect.height * 0.5;
      const dx = e.clientX - earthCenterX;
      const dy = e.clientY - earthCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) return;
      const maxOffset = 6;
      const offsetX = (dx / distance) * Math.min(distance / 15, maxOffset);
      const offsetY = (dy / distance) * Math.min(distance / 15, maxOffset);
      setPupilOffset({ x: offsetX, y: offsetY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── AUTO BLINK RANDOM ────────────────────────────────────────────────────
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000; // 2.5–5.5 detik sekali
      blinkIntervalRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkIntervalRef.current);
  }, []);

  // ─── INTERAKTIVITAS MASKOT BUMI ───────────────────────────────────────────

  // Klik Bumi
  const handleEarthClick = () => {
    if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount <= 3) {
      setEmotion('happy');
    } else {
      setEmotion('angry');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }

    emotionTimeoutRef.current = setTimeout(() => {
      setEmotion('neutral');
      setClickCount(0);
    }, 1800);
  };

  // Logo klik debug panel
  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 5) {
      setShowDebugPanel(true);
      setLogoClickCount(0);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Bersihkan timeout saat unmount
  useEffect(() => {
    return () => {
      if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);
      if (blinkIntervalRef.current) clearTimeout(blinkIntervalRef.current);
    };
  }, []);

  // ─── LOGIN HANDLERS ───────────────────────────────────────────────────────
  const openLoginModal = (mode) => {
    setLoginMode(mode === 'guest' ? 'guest' : 'select');
    setNickname('');
    setEmail('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

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

  // ─── RENDER HELPERS: EYES ─────────────────────────────────────────────────
  const eyeScaleY = isBlinking ? 0.1 : 1;

  const renderNeutralEyes = (extra = null) => (
    <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '200px 200px', transition: 'transform 0.08s' }}>
      <ellipse cx={160 + pupilOffset.x} cy={200 + pupilOffset.y} rx="9" ry="14" fill="#1E3A5F" />
      <circle cx={156 + pupilOffset.x} cy={194 + pupilOffset.y} r="3" fill="#FFF" />
      <circle cx={163 + pupilOffset.x} cy={207 + pupilOffset.y} r="1.5" fill="#FFF" opacity="0.5" />
      <ellipse cx={240 + pupilOffset.x} cy={200 + pupilOffset.y} rx="9" ry="14" fill="#1E3A5F" />
      <circle cx={236 + pupilOffset.x} cy={194 + pupilOffset.y} r="3" fill="#FFF" />
      <circle cx={243 + pupilOffset.x} cy={207 + pupilOffset.y} r="1.5" fill="#FFF" opacity="0.5" />
      {extra}
    </g>
  );

  // ─── SVG BUMI MASKOT HELPER ───────────────────────────────────────────────
  const renderEarthFace = () => {
    // Happy eyes (mata melengkung)
    const happyEyes = (
      <g>
        <path d="M 145,200 Q 160,184 175,200" fill="none" stroke="#1E3A5F" strokeWidth="6" strokeLinecap="round" />
        <path d="M 225,200 Q 240,184 255,200" fill="none" stroke="#1E3A5F" strokeWidth="6" strokeLinecap="round" />
      </g>
    );

    // Angry eyes dengan alis miring (kunci cy di 200)
    const angryEyes = (
      <g>
        <path d="M 143,179 L 172,188" stroke="#1E3A5F" strokeWidth="6" strokeLinecap="round" />
        <path d="M 257,179 L 228,188" stroke="#1E3A5F" strokeWidth="6" strokeLinecap="round" />
        <circle cx="160" cy="200" r="12" fill="#1E3A5F" />
        <circle cx="155" cy="195" r="3" fill="#FFF" />
        <circle cx="240" cy="200" r="12" fill="#1E3A5F" />
        <circle cx="235" cy="195" r="3" fill="#FFF" />
      </g>
    );

    // Pipi selalu ada
    const cheeks = (
      <g>
        <ellipse cx="133" cy="232" rx="15" ry="9" fill="#FF6B9B"
          opacity={emotion === 'happy' ? '0.85' : '0.5'}
          className="transition-all duration-500" />
        <ellipse cx="267" cy="232" rx="15" ry="9" fill="#FF6B9B"
          opacity={emotion === 'happy' ? '0.85' : '0.5'}
          className="transition-all duration-500" />
      </g>
    );

    if (emotion === 'happy') return (
      <g className="animate-scale-up">
        {cheeks}
        {happyEyes}
        {/* Mulut senyum lebar dengan gigi */}
        <path d="M 178,220 Q 200,248 222,220 Z" fill="#1E3A5F" />
        <path d="M 180,228 Q 200,246 220,228" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      </g>
    );

    if (emotion === 'angry') return (
      <g className="animate-scale-up">
        {cheeks}
        {angryEyes}
        {/* Mulut cemberut dengan gigi */}
        <path d="M 182,236 Q 200,220 218,236 Z" fill="#1E3A5F" />
        <path d="M 183,232 L 217,232" stroke="#1E3A5F" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
      </g>
    );

    // NEUTRAL — sesuaikan per tema
    return (
      <>
        {cheeks}
        {themeMode === 'pagi' && (
          <>
            {renderNeutralEyes()}
            {/* Senyum cerah pagi */}
            <path d="M 180,224 Q 200,244 220,224" fill="none" stroke="#1E3A5F" strokeWidth="5.5" strokeLinecap="round" />
          </>
        )}
        {themeMode === 'siang' && (
          <>
            {/* Alis sedikit berkeringat */}
            <path d="M 147,183 Q 160,180 173,185" fill="none" stroke="#1E3A5F" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 227,185 Q 240,180 253,183" fill="none" stroke="#1E3A5F" strokeWidth="3.5" strokeLinecap="round" />
            {renderNeutralEyes()}
            {/* Mulut sedikit terbuka kepanasan */}
            <path d="M 186,228 L 214,228" stroke="#1E3A5F" strokeWidth="5.5" strokeLinecap="round" />
            <ellipse cx="200" cy="234" rx="8" ry="5" fill="#1E3A5F" opacity="0.4" />
          </>
        )}
        {themeMode === 'sore' && (
          <>
            {/* Mata sedikit lelah — setengah tutup */}
            <path d="M 143,196 Q 160,207 177,196" fill="none" stroke="#1E3A5F" strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="160" cy="200" rx="9" ry="10" fill="#1E3A5F" />
            <circle cx="156" cy="196" r="2.5" fill="#FFF" />
            <path d="M 223,196 Q 240,207 257,196" fill="none" stroke="#1E3A5F" strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="240" cy="200" rx="9" ry="10" fill="#1E3A5F" />
            <circle cx="236" cy="196" r="2.5" fill="#FFF" />
            {/* Senyum lelah */}
            <path d="M 184,226 Q 200,236 216,226" fill="none" stroke="#1E3A5F" strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}
        {themeMode === 'malam' && (
          <>
            {/* Mata mengantuk separuh tutup (kunci cy di 200) */}
            <path d="M 143,200 Q 160,192 177,200" fill="none" stroke="#1E3A5F" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="160" cy="200" rx="9" ry="7" fill="#1E3A5F" />
            <circle cx="156" cy="197" r="2" fill="#FFF" />
            <path d="M 223,200 Q 240,192 257,200" fill="none" stroke="#1E3A5F" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="240" cy="200" rx="9" ry="7" fill="#1E3A5F" />
            <circle cx="236" cy="197" r="2" fill="#FFF" />
            {/* Mulut kantuk */}
            <ellipse cx="200" cy="230" rx="7" ry="5" fill="#1E3A5F" opacity="0.6" />
          </>
        )}
      </>
    );
  };

  // ─── ORNAMEN LUAR SVG BUMI ────────────────────────────────────────────────

  // Tetes keringat (siang, di luar bumi)
  const renderSweat = () => (
    <div className="absolute pointer-events-none" style={{ top: '12%', right: '-5%', zIndex: 25 }}>
      <svg viewBox="0 0 60 100" className="w-8 h-14">
        {/* Tetes 1 — besar */}
        <path d="M 20,15 Q 10,30 20,45 Q 30,30 20,15 Z" fill="#5CC2F2" stroke="#1E3A5F" strokeWidth="2.5" className="animate-sweat" />
        {/* Tetes 2 — kecil, delay */}
        <path d="M 38,35 Q 32,46 38,58 Q 44,46 38,35 Z" fill="#5CC2F2" stroke="#1E3A5F" strokeWidth="2" style={{ animationDelay: '1.8s' }} className="animate-sweat" />
      </svg>
    </div>
  );

  // Topi tidur (malam, di luar bumi di atas)
  const renderSleepingCap = () => (
    <div
      className="absolute pointer-events-none animate-scale-up"
      style={{ top: '-14%', left: '50%', transform: 'translateX(-58%)', zIndex: 25, width: '55%' }}
    >
      <svg viewBox="0 0 220 130" className="w-full h-auto overflow-visible">
        {/* Badan topi — runcing ke kiri atas */}
        <path d="M 30,100 Q 60,60 90,30 Q 110,10 120,5 Q 115,20 105,40 Q 90,70 70,95 Z"
          fill="#FF6B9B" stroke="#1E3A5F" strokeWidth="5" strokeLinejoin="round" />
        {/* Brim putih bawah topi */}
        <path d="M 10,95 Q 55,82 100,90 Q 120,93 130,97 Q 100,108 55,108 Q 25,108 10,95 Z"
          fill="#FFFFFF" stroke="#1E3A5F" strokeWidth="4" />
        {/* Strip dekorasi bintang kecil di brim */}
        <circle cx="35" cy="99" r="3" fill="#FFD23F" />
        <circle cx="60" cy="96" r="2.5" fill="#FFD23F" />
        <circle cx="85" cy="97" r="3" fill="#FFD23F" />
        <circle cx="110" cy="99" r="2" fill="#FFD23F" />
        {/* Pompom bulat di ujung topi */}
        <circle cx="122" cy="6" r="16" fill="#FFFFFF" stroke="#1E3A5F" strokeWidth="4" />
        <circle cx="120" cy="4" r="5" fill="#FFB3CC" opacity="0.5" />
      </svg>
    </div>
  );

  // Gelembung ZZZ (malam, di luar bumi kanan atas)
  const renderZzz = () => (
    <div className="absolute pointer-events-none" style={{ top: '0%', right: '-18%', zIndex: 25 }}>
      <svg viewBox="0 0 90 120" className="w-16 h-22 overflow-visible">
        {/* Z kecil */}
        <text x="10" y="90" fontSize="22" fontFamily="Fredoka, sans-serif" fontWeight="bold"
          fill="#C4B5FD" stroke="#1E3A5F" strokeWidth="1.5" paintOrder="stroke"
          className="animate-zzz-1" style={{ transformOrigin: '22px 85px' }}>Z</text>
        {/* Z sedang */}
        <text x="30" y="60" fontSize="30" fontFamily="Fredoka, sans-serif" fontWeight="bold"
          fill="#A78BFA" stroke="#1E3A5F" strokeWidth="2" paintOrder="stroke"
          className="animate-zzz-2" style={{ transformOrigin: '45px 52px' }}>Z</text>
        {/* Z besar */}
        <text x="50" y="28" fontSize="40" fontFamily="Fredoka, sans-serif" fontWeight="bold"
          fill="#7C3AED" stroke="#1E3A5F" strokeWidth="2.5" paintOrder="stroke"
          className="animate-zzz-3" style={{ transformOrigin: '70px 16px' }}>Z</text>
      </svg>
    </div>
  );

  return (
    <div className={`min-h-screen max-w-full flex flex-col justify-between ${currentTheme.bgClass} font-quicksand relative selection:bg-brandRose selection:text-white select-none ${currentTheme.textClass} py-4 md:py-0 transition-playful`}>

      {/* ── ORNAMEN LATAR BELAKANG ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${currentTheme.logoBlur} rounded-full blur-3xl transition-playful`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 ${currentTheme.glowBlur} rounded-full blur-3xl transition-playful`}></div>

        {/* PAGI: awan dan cahaya fajar */}
        {themeMode === 'pagi' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[30%] right-[15%] w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <svg className="absolute top-[8%] left-[-150px] w-40 h-24 text-pink-100/60 animate-float-cloud-1" viewBox="0 0 100 60" fill="currentColor">
              <path d="M 20 40 a 20 20 0 0 1 20 -20 a 25 25 0 0 1 45 5 a 15 15 0 0 1 5 30 a 10 10 0 0 1 -10 10 l -50 0 a 15 15 0 0 1 -10 -25 z" />
            </svg>
            <svg className="absolute top-[22%] left-[-200px] w-52 h-32 text-white/85 animate-float-cloud-2" viewBox="0 0 100 60" fill="currentColor">
              <path d="M 20 40 a 20 20 0 0 1 20 -20 a 25 25 0 0 1 45 5 a 15 15 0 0 1 5 30 a 10 10 0 0 1 -10 10 l -50 0 a 15 15 0 0 1 -10 -25 z" />
            </svg>
          </div>
        )}

        {/* SIANG: Matahari dengan wajah lucu */}
        {themeMode === 'siang' && (
          <div className="absolute top-[80px] md:top-[100px] right-[5%] w-20 h-20 md:w-28 md:h-28 pointer-events-none select-none z-10 transform-gpu">
            <div className="relative w-full h-full">
              <div className="absolute inset-[10%] bg-brandOrange/40 rounded-full blur-md animate-pulse"></div>
              <svg className="absolute inset-0 w-full h-full text-brandOrange animate-spin-slow" viewBox="0 0 100 100" fill="currentColor">
                <path d="M 50,2 L 54,20 L 46,20 Z" /><path d="M 50,98 L 54,80 L 46,80 Z" />
                <path d="M 2,50 L 20,54 L 20,46 Z" /><path d="M 98,50 L 80,54 L 80,46 Z" />
                <path d="M 16,16 L 31,29 L 24,36 Z" /><path d="M 84,84 L 69,71 L 76,64 Z" />
                <path d="M 16,84 L 31,71 L 24,64 Z" /><path d="M 84,16 L 69,29 L 76,36 Z" />
              </svg>
              <svg className="absolute inset-[16%] w-[68%] h-[68%] drop-shadow-md" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="#FFD23F" stroke="#1E3A5F" strokeWidth="3" />
                {/* Kacamata hitam */}
                <rect x="11" y="20" width="18" height="14" rx="6" fill="#1E3A5F" />
                <rect x="41" y="20" width="18" height="14" rx="6" fill="#1E3A5F" />
                <path d="M 29,27 L 41,27" stroke="#1E3A5F" strokeWidth="3" strokeLinecap="round" />
                <path d="M 11,27 L 5,25" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 59,27 L 65,25" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="27" r="4" fill="#334155" />
                <circle cx="49" cy="27" r="4" fill="#334155" />
                <circle cx="16" cy="25" r="1.5" fill="#FFF" opacity="0.7" />
                <circle cx="46" cy="25" r="1.5" fill="#FFF" opacity="0.7" />
                <path d="M 26,45 Q 35,52 44,45" fill="none" stroke="#1E3A5F" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}

        {/* SORE: burung terbang */}
        {themeMode === 'sore' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 transform-gpu">
            <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-orange-400/20 via-pink-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl"></div>
            <div className="absolute inset-0 select-none">
              <div className="absolute top-[12%] left-[-10vw] animate-fly-bird-1">
                <svg className="w-12 h-9 text-indigo-950/20 animate-flap-fast" viewBox="0 0 60 40" fill="currentColor">
                  <path d="M 5,25 Q 18,5 30,22 Q 45,8 55,28 Q 40,16 30,32 Q 18,18 5,25 Z M 28,24 Q 30,20 33,23 Z" />
                </svg>
              </div>
              <div className="absolute top-[28%] left-[-15vw] animate-fly-bird-2">
                <svg className="w-9 h-6 text-indigo-950/15 animate-flap-slow" viewBox="0 0 60 40" fill="currentColor">
                  <path d="M 5,25 Q 18,5 30,22 Q 45,8 55,28 Q 40,16 30,32 Q 18,18 5,25 Z" />
                </svg>
              </div>
              <div className="absolute top-[20%] left-[-20vw] scale-75 opacity-75 animate-fly-bird-1" style={{ animationDelay: '1.2s' }}>
                <svg className="w-10 h-7 text-indigo-950/10 animate-flap-fast" viewBox="0 0 60 40" fill="currentColor">
                  <path d="M 5,25 Q 18,5 30,22 Q 45,8 55,28 Q 40,16 30,32 Q 18,18 5,25 Z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* MALAM: bintang berkelip */}
        {themeMode === 'malam' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-80">
            {[
              { top: '10%', left: '12%', size: 'w-4 h-4', color: 'text-yellow-200', delay: '0.1s' },
              { top: '16%', right: '16%', size: 'w-5 h-5', color: 'text-yellow-100', delay: '0.7s' },
              { top: '42%', left: '6%', size: 'w-3 h-3', color: 'text-white', delay: '1.3s' },
              { top: '32%', right: '28%', size: 'w-4 h-4', color: 'text-yellow-200', delay: '1.9s' },
              { bottom: '22%', left: '22%', size: 'w-4 h-4', color: 'text-white', delay: '0.4s' },
              { top: '55%', right: '8%', size: 'w-3 h-3', color: 'text-yellow-100', delay: '1.1s' },
              { top: '68%', left: '35%', size: 'w-4 h-4', color: 'text-yellow-200', delay: '2.2s' },
              { top: '20%', left: '50%', size: 'w-3 h-3', color: 'text-white', delay: '0.6s' },
            ].map((star, i) => (
              <svg key={i} className={`absolute ${star.size} ${star.color} animate-twinkle`}
                style={{ top: star.top, left: star.left, right: star.right, bottom: star.bottom, animationDelay: star.delay }}
                viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
              </svg>
            ))}
            {/* Bulan Sabit */}
            <svg className="absolute top-[8%] left-[18%] w-14 h-14 text-yellow-100 opacity-60" viewBox="0 0 60 60">
              <path d="M 42,10 A 22,22 0 1 1 10,42 A 16,16 0 1 0 42,10 Z" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="w-full px-6 py-2 md:py-3 flex justify-between items-center z-10 bg-white/40 backdrop-blur-md border-b-4 border-brandBlue/5 transition-playful">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <img src={logoImg} alt="TechGo Logo" className="h-12 w-auto object-contain hover:scale-105 transition-playful" />
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-brandNavy/5 p-1 rounded-2xl flex gap-1 border-2 border-brandNavy/10">
            <button onClick={() => changeLanguage('id')} className={`px-3 py-1 rounded-xl font-fredoka text-sm transition-playful cursor-pointer ${language === 'id' ? 'bg-brandBlue text-white shadow-sm' : `${currentTheme.navButtonClass}`}`}>ID</button>
            <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded-xl font-fredoka text-sm transition-playful cursor-pointer ${language === 'en' ? 'bg-brandBlue text-white shadow-sm' : `${currentTheme.navButtonClass}`}`}>EN</button>
          </div>
        </div>
      </header>

      {/* ── HERO & MASKOT BUMI ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 md:py-20 flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12 items-center z-10 justify-between md:justify-center">
        <h1 className={`text-3xl sm:text-4xl md:text-6xl ${themeMode === 'malam' ? 'text-white' : 'text-brandNavy'} font-fredoka leading-tight max-w-xl text-center md:text-left order-1 md:col-start-1 md:row-start-1`}>
          {t('hero.title')}
        </h1>

        {/* Maskot Bumi */}
        <div className="flex justify-center items-center order-2 md:col-start-2 md:row-start-1 md:row-span-3 relative z-10">

          {/* Glow aura di belakang Bumi */}
          {themeMode === 'pagi' && (
            <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-t from-orange-400 to-yellow-300 opacity-60 blur-2xl transform -translate-y-8 animate-pulse pointer-events-none z-0"></div>
          )}
          {themeMode === 'malam' && (
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-indigo-700/30 blur-3xl pointer-events-none z-0 animate-pulse-slow"></div>
          )}
          {themeMode === 'siang' && (
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-amber-300/30 blur-3xl pointer-events-none z-0 animate-pulse-slow"></div>
          )}

          {/* Container Bumi + Ornamen Luar */}
          <div className="relative" style={{ width: 'clamp(190px, 48vw, 384px)', height: 'clamp(190px, 48vw, 384px)' }}>

            {/* Ornamen Luar: bergantung tema & state */}
            {themeMode === 'malam' && emotion === 'neutral' && renderSleepingCap()}
            {themeMode === 'malam' && emotion === 'neutral' && renderZzz()}
            {themeMode === 'siang' && emotion === 'neutral' && renderSweat()}

            {/* Bola Bumi SVG */}
            <div
              ref={earthRef}
              onClick={handleEarthClick}
              className="w-full h-full relative cursor-pointer select-none pointer-events-auto flex justify-center items-center transition-playful z-10"
              style={{
                animation: isShaking
                  ? 'earth-shake 0.5s ease-in-out'
                  : 'float 4s ease-in-out infinite',
              }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl overflow-visible">
                <defs>
                  <clipPath id="earth-boundary">
                    <circle cx="200" cy="200" r="180" />
                  </clipPath>
                  {/* Filter glow marah */}
                  {emotion === 'angry' && (
                    <filter id="angry-glow">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  )}
                </defs>

                {/* Samudra */}
                <circle cx="200" cy="200" r="180"
                  fill={emotion === 'angry' ? '#FF8C69' : themeMode === 'malam' ? '#3B4F8A' : '#5CC2F2'}
                  stroke={emotion === 'angry' ? '#C0392B' : '#1E3A5F'}
                  strokeWidth={themeMode === 'malam' ? '6' : '8'}
                  className="transition-all duration-700" />

                {/* Benua */}
                <g clipPath="url(#earth-boundary)" className="opacity-95">
                  <path d="M 50,230 C 80,180 140,160 170,220 C 160,280 120,330 80,310 Z"
                    fill={themeMode === 'malam' ? '#2D6A4F' : '#2EC4B6'} stroke="#1E3A5F" strokeWidth="2" />
                  <path d="M 120,150 C 140,90 190,70 230,110 C 210,160 170,170 130,170 Z"
                    fill={themeMode === 'malam' ? '#2D6A4F' : '#2EC4B6'} stroke="#1E3A5F" strokeWidth="2" />
                  <path d="M 200,160 C 250,80 340,90 360,200 C 300,240 250,230 200,210 Z"
                    fill={themeMode === 'malam' ? '#2D6A4F' : '#2EC4B6'} stroke="#1E3A5F" strokeWidth="2" />
                  {/* Salju di kutub saat malam */}
                  {themeMode === 'malam' && (
                    <>
                      <ellipse cx="200" cy="30" rx="70" ry="22" fill="#E0F2FE" opacity="0.7" />
                      <ellipse cx="200" cy="370" rx="75" ry="20" fill="#E0F2FE" opacity="0.6" />
                    </>
                  )}
                </g>

                {/* Kilat di mata saat marah (di dalam bumi) */}
                {emotion === 'angry' && (
                  <g>
                    <path d="M 110,120 L 100,145 L 112,140 L 100,165" stroke="#FFD23F" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-pulse" />
                    <path d="M 290,120 L 300,145 L 288,140 L 300,165" stroke="#FFD23F" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-pulse" />
                  </g>
                )}

                {/* WAJAH EMOSI */}
                {renderEarthFace()}
              </svg>
            </div>
          </div>

          {/* Label tooltip interaktif */}
          <div className={`absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 text-xs font-fredoka px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-300 pointer-events-none
            ${themeMode === 'malam' ? 'bg-white/10 text-white/70' : 'bg-brandNavy/10 text-brandNavy/60'}`}>
            {emotion === 'angry' ? 'Jangan spam klik!' : emotion === 'happy' ? 'Hore!' : 'Klik aku!'}
          </div>
        </div>

        <p className={`text-base md:text-xl ${themeMode === 'malam' ? 'text-white/80' : 'text-brandNavy/80'} font-quicksand leading-relaxed max-w-lg text-center md:text-left order-3 md:col-start-1 md:row-start-2`}>
          {t('hero.description')}
        </p>

        <div className="flex flex-row gap-3 w-full sm:w-auto justify-center md:justify-start order-4 md:col-start-1 md:row-start-3">
          <button onClick={() => openLoginModal('guest')} className="py-3 px-4 sm:py-4 sm:px-8 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-2xl md:rounded-3xl font-fredoka text-base sm:text-xl shadow-lg shadow-brandBlue/25 hover:scale-105 active:scale-95 transition-playful border-b-4 sm:border-b-8 border-brandBlue/70 text-center flex-1 sm:flex-initial cursor-pointer">
            {t('hero.btnExplore')}
          </button>
          <button onClick={() => openLoginModal('google')} className="py-3 px-4 sm:py-4 sm:px-8 bg-brandRose hover:bg-brandRose/90 text-white rounded-2xl md:rounded-3xl font-fredoka text-base sm:text-xl shadow-lg shadow-brandRose/25 hover:scale-105 active:scale-95 transition-playful border-b-4 sm:border-b-8 border-brandRose/70 text-center flex-1 sm:flex-initial cursor-pointer">
            {t('navbar.login')}
          </button>
        </div>
      </main>

      <footer className="w-full py-4 z-10"></footer>

      {/* ── DEBUG PANEL ────────────────────────────────────────────────── */}
      {showDebugPanel && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-xl flex flex-wrap justify-center gap-2 max-w-[90vw] md:max-w-md animate-scale-up">
          <div className="w-full text-center text-xs font-bold text-brandNavy mb-1">Mode Debug Suasana</div>
          <button onClick={() => setThemeMode('pagi')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-playful cursor-pointer ${themeMode === 'pagi' ? 'bg-pink-500 text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Pagi</button>
          <button onClick={() => setThemeMode('siang')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-playful cursor-pointer ${themeMode === 'siang' ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Siang</button>
          <button onClick={() => setThemeMode('sore')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-playful cursor-pointer ${themeMode === 'sore' ? 'bg-orange-500 text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Sore</button>
          <button onClick={() => setThemeMode('malam')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-playful cursor-pointer ${themeMode === 'malam' ? 'bg-indigo-900 text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Malam</button>
          <button onClick={() => { const h = new Date().getHours() + new Date().getMinutes() / 60; setThemeMode(getThemeByHour(h)); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brandTeal text-white shadow hover:bg-brandTeal/90 transition-playful cursor-pointer">Reset</button>
          <button onClick={() => setShowDebugPanel(false)} className="px-2 py-1.5 rounded-lg text-xs font-bold bg-slate-300 text-slate-800 hover:bg-slate-400 transition-playful cursor-pointer">Tutup</button>
        </div>
      )}

      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brandTeal text-white px-4 py-2 rounded-full shadow-lg font-fredoka text-sm animate-scale-up">
          🛠️ Mode Debug Aktif! Panel muncul di bawah.
        </div>
      )}

      {/* ── MODAL LOGIN ───────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brandNavy/45 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full z-20 shadow-2xl relative animate-float">
            <div className="text-center mb-8">
              <h2 className="text-3xl text-brandNavy font-fredoka">Halo Sahabat TechGo!</h2>
            </div>

            {loginMode === 'select' && (
              <div className="flex flex-col gap-4">
                <button type="button" onClick={() => setLoginMode('google_select')} className="flex items-center justify-center w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-4 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{language === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}</span>
                </button>
                <button type="button" onClick={() => setLoginMode('guest')} className="w-full py-3.5 bg-brandRose hover:bg-brandRose/90 text-white rounded-2xl font-fredoka text-lg transition-playful shadow-md border-b-4 border-brandRose/70 text-center cursor-pointer">
                  {language === 'en' ? 'Sign in as Guest' : 'Masuk sebagai Tamu'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 text-sm text-brandNavy/60 hover:text-brandNavy font-semibold text-center cursor-pointer">
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
              </div>
            )}

            {loginMode === 'google_select' && (
              <div className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <div className="flex justify-center mb-2">
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{language === 'en' ? 'Choose an account' : 'Pilih akun'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{language === 'en' ? 'to continue to TechGo' : 'untuk melanjutkan ke TechGo'}</p>
                </div>
                <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  <button type="button" onClick={() => { loginWithGoogle("zidan@gmail.com", "Zidan TechGo"); setIsModalOpen(false); navigate('/map'); }} className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-brandBlue text-white font-fredoka flex items-center justify-center font-bold text-lg mr-3">Z</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Zidan TechGo</div>
                      <div className="text-xs text-gray-400">zidan@gmail.com</div>
                    </div>
                  </button>
                  <button type="button" onClick={() => { loginWithGoogle("sahabat@gmail.com", "Sahabat TechGo"); setIsModalOpen(false); navigate('/map'); }} className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-brandRose text-white font-fredoka flex items-center justify-center font-bold text-lg mr-3">S</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Sahabat TechGo</div>
                      <div className="text-xs text-gray-400">sahabat@gmail.com</div>
                    </div>
                  </button>
                  <button type="button" onClick={() => { setNickname(''); setEmail(''); setLoginMode('google_input'); }} className="flex items-center w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer text-gray-600 font-semibold text-sm">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>{language === 'en' ? 'Use another account' : 'Gunakan akun lain'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed text-center px-2 mt-2">
                  {language === 'en' ? 'To continue, Google will share your name, email address, language preference, and profile picture with TechGo.' : 'Untuk melanjutkan, Google akan membagikan nama, alamat email, preferensi bahasa, dan foto profil Anda dengan TechGo.'}
                </p>
                <button type="button" onClick={() => setLoginMode('select')} className="mt-2 text-sm text-brandNavy/60 hover:text-brandNavy font-semibold text-center cursor-pointer">
                  {language === 'en' ? 'Back' : 'Kembali'}
                </button>
              </div>
            )}

            {loginMode === 'google_input' && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-bold text-brandNavy">{language === 'en' ? 'Add Google Account' : 'Tambah Akun Google'}</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={language === 'en' ? 'Enter nickname...' : 'Tulis nama panggilanmu...'} className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40" maxLength={15} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={language === 'en' ? 'Enter Google email...' : 'Masukkan email Google...'} className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40" />
                </div>
                {errorMsg && <p className="text-brandRose font-fredoka text-sm text-center">{errorMsg}</p>}
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={() => { setLoginMode('google_select'); setErrorMsg(''); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-2xl font-fredoka text-base transition-playful border-b-4 border-slate-300 cursor-pointer">{language === 'en' ? 'Back' : 'Kembali'}</button>
                  <button type="submit" className="flex-1 py-3 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-2xl font-fredoka text-base transition-playful border-b-4 border-brandTeal/70 shadow-md cursor-pointer">{language === 'en' ? "Let's Go!" : 'Ayo Mulai!'}</button>
                </div>
              </form>
            )}

            {loginMode === 'guest' && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <div>
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={language === 'en' ? 'Enter your nickname...' : 'Tulis nama panggilanmu...'} className="w-full px-5 py-3 bg-brandCream rounded-2xl border-4 border-brandBlue/20 focus:border-brandBlue outline-none text-brandNavy font-quicksand font-bold transition-playful placeholder:text-brandNavy/40" maxLength={15} />
                </div>
                {errorMsg && <p className="text-brandRose font-fredoka text-sm text-center">{errorMsg}</p>}
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={() => { setLoginMode('select'); setNickname(''); setErrorMsg(''); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-2xl font-fredoka text-base transition-playful border-b-4 border-slate-300 cursor-pointer">{language === 'en' ? 'Back' : 'Kembali'}</button>
                  <button type="submit" className="flex-1 py-3 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-2xl font-fredoka text-base transition-playful border-b-4 border-brandTeal/70 shadow-md cursor-pointer">{language === 'en' ? "Let's Go!" : 'Ayo Mulai!'}</button>
                </div>
                <p className="text-[11px] text-brandNavy/60 text-center leading-normal mt-2 font-semibold">
                  {language === 'en' ? '* Note: Learning progress and quiz scores will not be saved permanently.' : '* Info: Progres belajar dan hasil kuis tidak disimpan permanen.'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
