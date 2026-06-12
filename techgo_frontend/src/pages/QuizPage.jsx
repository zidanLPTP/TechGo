import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Award, CheckCircle, XCircle } from 'lucide-react';

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Ambil state rute yang dikirim dari MapPage
  // Fallback ke innovationId = 1 (Sensor IoT Pertanian) jika diakses langsung
  const innovationId = location.state?.innovationId || 1;
  const innovationTitle = location.state?.innovationTitle || (language === 'id' ? 'Sensor Pertanian Pintar IoT' : 'Smart Agriculture IoT Sensors');

  // State kuis
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State gameplay kuis
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 'A', 'B', atau 'C'
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0); // Jumlah jawaban benar (0-5)
  const [quizFinished, setQuizFinished] = useState(false);

  // State kuis adaptif (leveling) dari server setelah submit
  const [adaptiveResult, setAdaptiveResult] = useState(null);
  
  // Ambil tingkat skill level saat ini dari local storage untuk inovasi ini
  const [skillLevel, setSkillLevel] = useState(() => {
    return localStorage.getItem(`techgo_skill_${innovationId}`) || 'Beginner';
  });

  // Referensi untuk Canvas Confetti
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 1. Jalankan proses loading tiruan (progress bar) dan tembak API backend
  const loadQuizData = () => {
    setLoading(true);
    setLoadingProgress(0);
    setErrorMsg('');
    setQuizzes([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setAdaptiveResult(null);

    // Animasi progress bar imut untuk anak-anak
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 150);

    // Kirim permintaan pembuatan kuis otomatis ke AI Gemini backend
    fetch('http://localhost:5000/api/quiz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        innovation_id: innovationId,
        language: language,
        skill_level: skillLevel
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('API server gagal memproses kuis');
        return res.json();
      })
      .then((json) => {
        if (json.status === 'success' && json.quizzes && json.quizzes.length > 0) {
          setQuizzes(json.quizzes);
          setLoadingProgress(100);
          // Berikan jeda sedikit agar anak-anak melihat bar 100%
          setTimeout(() => {
            setLoading(false);
          }, 500);
        } else {
          throw new Error('Format kuis dari AI tidak valid');
        }
      })
      .catch((err) => {
        console.error('Error generating quiz:', err);
        clearInterval(interval);
        setErrorMsg(err.message || 'Koneksi terputus atau API Gemini timeout.');
        setLoading(false);
      });
  };

  // Panggil loading kuis pertama kali saat halaman dimuat
  useEffect(() => {
    loadQuizData();
  }, [innovationId, language]);

  // 2. Kirim skor akhir kuis ke server saat kuis selesai
  const submitFinalScore = (finalScore) => {
    // Simpan skor tertinggi di local storage untuk Guest/Offline
    const currentMaxScore = Math.max(parseInt(localStorage.getItem(`techgo_score_${innovationId}`) || '0'), finalScore);
    localStorage.setItem(`techgo_score_${innovationId}`, currentMaxScore.toString());

    fetch('http://localhost:5000/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        innovation_id: innovationId,
        score: finalScore,
        username: user?.username || 'Petualang Tamu',
        email: user?.email || '',
        authProvider: user?.authProvider || 'guest'
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success') {
          // Khusus untuk pengguna non-guest (Google), gunakan level dari server
          if (user && !user.isGuest) {
            setAdaptiveResult(json.data);
            const newLevel = json.data.currentLevel;
            setSkillLevel(newLevel);
            localStorage.setItem(`techgo_skill_${innovationId}`, newLevel);
            
            const serverMaxScore = Math.max(currentMaxScore, json.data.highestScore || finalScore);
            localStorage.setItem(`techgo_score_${innovationId}`, serverMaxScore.toString());
          } else {
            // Untuk Guest, jalankan simulasi adaptif lokal agar level tetap berprogres di browser
            let nextLevel = skillLevel;
            let promotion = 'none';
            
            if (finalScore >= 4) {
              if (skillLevel === 'Beginner') { nextLevel = 'Intermediate'; promotion = 'up'; }
              else if (skillLevel === 'Intermediate') { nextLevel = 'Expert'; promotion = 'up'; }
            } else if (finalScore <= 2) {
              if (skillLevel === 'Expert') { nextLevel = 'Intermediate'; promotion = 'down'; }
              else if (skillLevel === 'Intermediate') { nextLevel = 'Beginner'; promotion = 'down'; }
            }

            const mockData = {
              score: finalScore,
              previousLevel: skillLevel,
              currentLevel: nextLevel,
              promotion
            };
            setAdaptiveResult(mockData);
            setSkillLevel(nextLevel);
            localStorage.setItem(`techgo_skill_${innovationId}`, nextLevel);
          }
        }
      })
      .catch((err) => {
        console.warn('Gagal submit skor ke server (bekerja dalam mode lokal):', err.message);
        
        // Simulasikan kuis adaptif lokal jika server offline
        let nextLevel = skillLevel;
        let promotion = 'none';
        
        if (finalScore >= 4) {
          if (skillLevel === 'Beginner') { nextLevel = 'Intermediate'; promotion = 'up'; }
          else if (skillLevel === 'Intermediate') { nextLevel = 'Expert'; promotion = 'up'; }
        } else if (finalScore <= 2) {
          if (skillLevel === 'Expert') { nextLevel = 'Intermediate'; promotion = 'down'; }
          else if (skillLevel === 'Intermediate') { nextLevel = 'Beginner'; promotion = 'down'; }
        }

        const mockData = {
          score: finalScore,
          previousLevel: skillLevel,
          currentLevel: nextLevel,
          promotion
        };
        setAdaptiveResult(mockData);
        setSkillLevel(nextLevel);
        localStorage.setItem(`techgo_skill_${innovationId}`, nextLevel);
      });
  };

  // 3. Efek Animasi Kembang Api / Confetti Canvas (Skor selesai)
  useEffect(() => {
    if (quizFinished && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#FF6B9B', '#5CC2F2', '#FFB347', '#2EC4B6', '#FFD166'];
      const particles = [];

      // Generate 120 butiran kertas warna-warni
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 6 + 5,
          d: Math.random() * canvas.height,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.08 + 0.02,
          tiltAngle: 0
        });
      }

      const drawConfetti = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, idx) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(p.tiltAngle);
          p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();

          // Jika menyentuh batas bawah, kembalikan ke atas
          if (p.y > canvas.height) {
            p.x = Math.random() * canvas.width;
            p.y = -20;
            p.tilt = Math.random() * 10 - 5;
          }
        });

        animationFrameRef.current = requestAnimationFrame(drawConfetti);
      };

      drawConfetti();

      // Tangani resize window
      const handleResize = () => {
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [quizFinished]);

  // Menangani klik opsi jawaban oleh siswa
  const handleOptionClick = (option) => {
    if (isAnswered) return; // Kunci jawaban jika sudah memilih

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === quizzes[currentIdx].correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  // Menangani peralihan soal berikutnya
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Kuis selesai!
      setQuizFinished(true);
      submitFinalScore(score + (selectedOption === quizzes[currentIdx].correct_answer ? 1 : 0));
    }
  };

  // Menghitung persentase progres bermain
  const progressPercent = ((currentIdx + (isAnswered ? 1 : 0)) / quizzes.length) * 100;

  return (
    <div className="min-h-screen bg-brandCream font-quicksand flex flex-col justify-between overflow-x-hidden relative selection:bg-brandRose selection:text-white">
      
      {/* 1. STATE LOADING (AI GERMINATING QUESTIONS) */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="bg-white p-8 rounded-5xl border-8 border-brandBlue max-w-md w-full shadow-2xl transition-playful hover:scale-[1.01]">
            
            {/* Animasi Bintang Sparkle */}
            <div className="w-20 h-20 bg-brandBlue/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brandBlue">
              <Sparkles size={40} className="animate-pulse" />
            </div>

            <h2 className="text-3xl text-brandNavy font-fredoka mb-2">
              Merumuskan Kuis AI...
            </h2>
            
            <p className="text-brandNavy/70 text-sm sm:text-base font-semibold mb-6">
              AI Gemini sedang merumuskan 5 soal khusus untukmu berdasarkan materi teknologi <span className="text-brandRose">"{innovationTitle}"</span> dengan tingkat kesulitan <span className="text-brandTeal">{skillLevel}</span>.
            </p>

            {/* Progress Bar Imut */}
            <div className="w-full h-6 bg-brandNavy/5 rounded-full overflow-hidden border-2 border-brandNavy/10 p-0.5 mb-2">
              <div 
                className="h-full bg-brandBlue rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <span className="font-fredoka text-brandNavy/60 text-sm">{loadingProgress}% Terisi</span>
          </div>
        </div>
      )}

      {/* 2. STATE ERROR (KID-FRIENDLY FALLBACK) */}
      {!loading && errorMsg && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="bg-white p-8 rounded-5xl border-8 border-brandRose max-w-md w-full shadow-2xl transition-playful hover:scale-[1.01]">
            
            <div className="w-20 h-20 bg-brandRose/25 rounded-full flex items-center justify-center mx-auto mb-6 text-brandRose">
              <AlertCircle size={44} />
            </div>

            <h2 className="text-2xl text-brandNavy font-fredoka mb-2">
              Aduh, Robot Kuis Kami Kebingungan!
            </h2>
            
            <p className="text-brandNavy/80 text-sm leading-relaxed mb-6">
              Koneksi gagal atau model AI Gemini sedang beristirahat sejenak. Jangan khawatir, kita bisa mencoba menghubunginya lagi!<br />
              <span className="text-xs text-brandRose/70 font-mono block mt-2">Pesan Error: {errorMsg}</span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/map')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-2xl font-fredoka text-sm transition-playful border-b-4 border-slate-300"
              >
                <ArrowLeft size={16} className="inline mr-1" /> Kembali ke Peta
              </button>
              <button
                onClick={loadQuizData}
                className="flex-1 py-3 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-2xl font-fredoka text-sm transition-playful border-b-4 border-brandBlue/70 flex items-center justify-center gap-1 shadow-md"
              >
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATE GAMEPLAY KUIS */}
      {!loading && !errorMsg && !quizFinished && quizzes[currentIdx] && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10">
          <div className="bg-white rounded-5xl border-8 border-brandBlue p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
            
            {/* Header Soal & Progres */}
            <div className="flex justify-between items-center mb-4">
              <span className="font-fredoka text-brandOrange text-sm sm:text-base uppercase tracking-wider">
                Soal {currentIdx + 1} dari {quizzes.length}
              </span>
              <span className="font-fredoka bg-brandBlue/10 border-2 border-brandBlue/30 text-brandBlue px-3 py-1 rounded-full text-xs sm:text-sm">
                Level: {skillLevel}
              </span>
            </div>

            {/* Progres Bar Kuis */}
            <div className="w-full h-4 bg-brandNavy/5 rounded-full overflow-hidden border-2 border-brandNavy/10 p-0.5 mb-6">
              <div 
                className="h-full bg-brandOrange rounded-full transition-playful"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Soal Kuis */}
            <h3 className="text-xl sm:text-2xl text-brandNavy font-fredoka leading-snug mb-8">
              {quizzes[currentIdx].question}
            </h3>

            {/* Pilihan Jawaban (A, B, C) */}
            <div className="flex flex-col gap-4 mb-8">
              {Object.entries(quizzes[currentIdx].options).map(([key, value]) => {
                
                let btnColor = "bg-brandCream/50 border-brandBlue/20 text-brandNavy hover:bg-brandBlue/10";
                let iconComponent = null;

                if (isAnswered) {
                  const isCorrectKey = key === quizzes[currentIdx].correct_answer;
                  const isSelectedKey = key === selectedOption;

                  if (isCorrectKey) {
                    btnColor = "bg-brandTeal/20 border-brandTeal text-brandNavy font-bold";
                    iconComponent = <CheckCircle size={20} className="text-brandTeal shrink-0" />;
                  } else if (isSelectedKey) {
                    btnColor = "bg-brandRose/20 border-brandRose text-brandNavy font-bold";
                    iconComponent = <XCircle size={20} className="text-brandRose shrink-0" />;
                  } else {
                    btnColor = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={key}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(key)}
                    className={`
                      w-full px-5 py-4 text-left border-4 rounded-3xl font-quicksand font-bold text-sm sm:text-base 
                      flex items-center justify-between gap-4 transition-playful border-b-6
                      ${btnColor}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brandNavy shadow-sm border border-brandNavy/10 font-fredoka">
                        {key}
                      </span>
                      <span>{value}</span>
                    </div>
                    {iconComponent}
                  </button>
                );
              })}
            </div>

            {/* Tombol Lanjut Soal Berikutnya */}
            <div className="flex justify-end">
              <button
                disabled={!isAnswered}
                onClick={handleNextQuestion}
                className={`
                  px-8 py-3.5 rounded-3xl font-fredoka text-lg flex items-center gap-2 border-b-4 transition-playful
                  ${isAnswered 
                    ? 'bg-brandOrange hover:bg-brandOrange/90 border-brandOrange/70 text-white shadow-md hover:scale-105 active:scale-95' 
                    : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                <span>{currentIdx === quizzes.length - 1 ? 'Lihat Hasil' : 'Lanjut'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. STATE CELEBRATION SCREEN (LAYAR SELESAI KUIS) */}
      {!loading && !errorMsg && quizFinished && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10">
          
          {/* Canvas Confetti */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-15"
          />

          <div className="bg-white rounded-5xl border-8 border-brandBlue p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative z-20 transition-playful hover:scale-[1.01]">
            
            {/* Ikon Piala / Trofi Medali */}
            <div className="w-24 h-24 bg-brandOrange/20 rounded-full flex items-center justify-center mx-auto mb-6 text-brandOrange">
              <Award size={48} className="animate-pulse" />
            </div>

            <h2 className="text-3xl text-brandNavy font-fredoka mb-2">Kuis Selesai!</h2>
            <p className="text-brandNavy/60 text-sm font-semibold mb-6">Materi: "{innovationTitle}"</p>

            {/* Lingkaran Skor Kuis */}
            <div className="w-32 h-32 rounded-full border-8 border-brandTeal bg-brandCream mx-auto flex flex-col items-center justify-center mb-6 shadow-inner">
              <span className="text-sm font-fredoka text-brandNavy/50">Skormu</span>
              <span className="text-4xl font-fredoka text-brandNavy font-bold">{score * 20}</span>
              <span className="text-xs font-semibold text-brandTeal">{score} / 5 Benar</span>
            </div>

            {/* Hasil Leveling Adaptif */}
            {adaptiveResult && (
              <div className="bg-brandTeal/10 border-4 border-brandTeal/30 p-4 rounded-3xl mb-6">
                <span className="text-xs uppercase font-fredoka font-bold text-brandTeal tracking-wide block mb-1">
                  Evaluasi Kuis Adaptif AI
                </span>
                
                {adaptiveResult.promotion === 'up' && (
                  <p className="text-brandNavy font-semibold text-sm sm:text-base">
                    Luar biasa! Kamu naik level ke tingkat <span className="font-bold text-brandTeal">{adaptiveResult.currentLevel}</span>!
                  </p>
                )}
                {adaptiveResult.promotion === 'down' && (
                  <p className="text-brandNavy font-semibold text-sm sm:text-base">
                    Tidak apa-apa! Level belajarmu disesuaikan ke tingkat <span className="font-bold text-brandOrange">{adaptiveResult.currentLevel}</span> untuk pemahaman lebih baik.
                  </p>
                )}
                {adaptiveResult.promotion === 'none' && (
                  <p className="text-brandNavy font-semibold text-sm sm:text-base">
                    Mantap! Kamu tetap berada di tingkat <span className="font-bold text-brandBlue">{adaptiveResult.currentLevel}</span>.
                  </p>
                )}
              </div>
            )}

            {/* Warning Guest Banner */}
            {(!user || user.isGuest) && (
              <div className="bg-brandOrange/15 border-2 border-brandOrange/30 text-brandNavy p-4 rounded-2xl mb-6 flex gap-2 items-start text-xs text-left font-bold">
                <AlertCircle size={16} className="text-brandOrange shrink-0 mt-0.5" />
                <div>
                  <span className="text-brandOrange font-fredoka block mb-0.5">Skor Tamu</span>
                  Karena kamu bermain sebagai Tamu, skor ini tidak disimpan di database. Progres belajarmu akan hilang saat browser ditutup.
                </div>
              </div>
            )}

            {/* Tombol Aksi Akhir */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/map')}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-brandNavy rounded-3xl font-fredoka text-base transition-playful border-b-4 border-slate-300"
              >
                Kembali ke Peta
              </button>
              <button
                onClick={loadQuizData}
                className="flex-1 py-3.5 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-3xl font-fredoka text-base transition-playful border-b-4 border-brandBlue/70 shadow-md flex items-center justify-center gap-1"
              >
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full text-center py-4 text-xs text-brandNavy/40 font-quicksand font-bold z-10 border-t-2 border-brandBlue/5 bg-white/20">
        © 2026 TechGo - Didukung oleh Google Gemini Flash API.
      </footer>
    </div>
  );
}
