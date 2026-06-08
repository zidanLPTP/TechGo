const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database');

// Inisialisasi Google Gen AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_API_KEY');

/**
 * Controller untuk menembak API Gemini Flash untuk merumuskan kuis secara dinamis.
 * POST /api/quiz/generate
 */
const generateQuiz = async (req, res) => {
  const { innovation_id, language, skill_level } = req.body;

  // Validasi input parameter
  if (!innovation_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Parameter innovation_id wajib disertakan.'
    });
  }

  const activeLang = language === 'en' ? 'en' : 'id';
  const activeLevel = ['Beginner', 'Intermediate', 'Expert'].includes(skill_level) ? skill_level : 'Beginner';

  try {
    // 1. Ambil deskripsi inovasi dari database MySQL
    const [rows] = await pool.query('SELECT description_id, description_en, title_id, title_en FROM innovations WHERE id = ?', [innovation_id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data inovasi teknologi tidak ditemukan.'
      });
    }

    const description = activeLang === 'id' ? rows[0].description_id : rows[0].description_en;
    const title = activeLang === 'id' ? rows[0].title_id : rows[0].title_en;

    // Jika API Key belum diset, gunakan data kuis tiruan (mock) agar frontend tidak macet
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('GEMINI_API_KEY tidak ditemukan atau berupa placeholder. Menggunakan kuis mock.');
      const mockQuiz = generateMockQuiz(innovation_id, title, activeLang);
      return res.status(200).json({
        status: 'success',
        source: 'mock',
        quizzes: mockQuiz
      });
    }

    // 2. Siapkan model Gemini (gemini-1.5-flash sangat cocok untuk JSON cepat di cPanel)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      // Mengunci output model agar wajib mengembalikan struktur JSON
      generationConfig: { responseMimeType: 'application/json' }
    });

    // 3. Rancang Prompt dengan System Instruction untuk Kuis Anak
    const prompt = `
      Anda adalah asisten guru sekolah menengah pertama global untuk materi teknologi.
      Tugas Anda adalah membuat 5 pertanyaan pilihan ganda (A, B, C) dalam BAHASA [${activeLang}] berdasarkan materi teks berikut:
      Materi: "${description}"

      Sesuaikan tingkat kesulitan dengan SKILL LEVEL siswa: [${activeLevel}]
      
      Aturan pembuatan soal untuk anak usia 10-14 tahun:
      - Bahasa harus ramah anak, seru, mudah dipahami, dan tidak terlalu formal.
      - 3 opsi jawaban (A, B, C) dengan 1 jawaban yang benar.
      - Soal bertingkat kesulitan ${activeLevel}.

      Kembalikan respons WAJIB dalam format JSON murni dengan skema berikut:
      {
        "quizzes": [
          {
            "id": 1,
            "question": "Pertanyaan mengenai materi?",
            "options": {
              "A": "Pilihan A",
              "B": "Pilihan B",
              "C": "Pilihan C"
            },
            "correct_answer": "A"
          }
        ]
      }
    `;

    // 4. Kirim prompt ke Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text().trim();

    // Pembersihan tambahan jika Gemini mengembalikan markdown wrapper ```json ... ```
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    // Parse data JSON dari Gemini
    const quizData = JSON.parse(responseText);

    res.status(200).json({
      status: 'success',
      source: 'gemini',
      quizzes: quizData.quizzes
    });

  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal merumuskan soal kuis otomatis menggunakan AI Gemini.',
      error: error.message
    });
  }
};

/**
 * Controller untuk mencatat skor kuis dan menerapkan sistem kuis adaptif (leveling).
 * POST /api/quiz/submit
 */
const submitQuizScore = async (req, res) => {
  const { innovation_id, score, username, email, authProvider } = req.body;

  if (!innovation_id || score === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'Parameter innovation_id dan score wajib dikirim.'
    });
  }

  // Jika masuk sebagai Tamu (Guest), tidak perlu menyimpan progres ke database MySQL
  if (authProvider === 'guest') {
    return res.status(200).json({
      status: 'success',
      message: 'Skor tamu berhasil dihitung (tidak disimpan di database).',
      data: {
        score,
        promotion: 'none',
        currentLevel: 'Beginner'
      }
    });
  }

  try {
    // 1. Cari atau buat user berdasarkan email login Google
    let userId;
    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (userRows.length === 0) {
      // Daftarkan pengguna baru otomatis
      const [insertUser] = await pool.query(
        'INSERT INTO users (username, email, auth_provider) VALUES (?, ?, ?)',
        [username || 'Pelajar Google', email, 'google']
      );
      userId = insertUser.insertId;
    } else {
      userId = userRows[0].id;
    }

    // 2. Ambil progres kuis adaptif saat ini untuk inovasi tersebut
    const [progressRows] = await pool.query(
      'SELECT student_skill_level, highest_score, attempts_count FROM user_progress WHERE user_id = ? AND innovation_id = ?',
      [userId, innovation_id]
    );

    let currentLevel = 'Beginner';
    let attemptsCount = 0;
    let highestScore = 0;
    let progressExist = false;

    if (progressRows.length > 0) {
      currentLevel = progressRows[0].student_skill_level;
      attemptsCount = progressRows[0].attempts_count;
      highestScore = progressRows[0].highest_score;
      progressExist = true;
    }

    // 3. Logika Adaptif Naik/Turun Level
    // - Naik level jika skor >= 4 (Skor maksimum 5)
    // - Turun level jika skor <= 2
    // - Tetap jika skor == 3
    let nextLevel = currentLevel;
    let promotion = 'none'; // 'up', 'down', atau 'none'

    if (score >= 4) {
      if (currentLevel === 'Beginner') {
        nextLevel = 'Intermediate';
        promotion = 'up';
      } else if (currentLevel === 'Intermediate') {
        nextLevel = 'Expert';
        promotion = 'up';
      }
    } else if (score <= 2) {
      if (currentLevel === 'Expert') {
        nextLevel = 'Intermediate';
        promotion = 'down';
      } else if (currentLevel === 'Intermediate') {
        nextLevel = 'Beginner';
        promotion = 'down';
      }
    }

    // 4. Update data progres ke tabel 'user_progress'
    const newHighestScore = Math.max(highestScore, score);
    const newAttemptsCount = attemptsCount + 1;

    if (progressExist) {
      await pool.query(
        `UPDATE user_progress 
         SET highest_score = ?, attempts_count = ?, student_skill_level = ?, last_updated = NOW() 
         WHERE user_id = ? AND innovation_id = ?`,
        [newHighestScore, newAttemptsCount, nextLevel, userId, innovation_id]
      );
    } else {
      await pool.query(
        `INSERT INTO user_progress (user_id, innovation_id, highest_score, attempts_count, student_skill_level) 
         VALUES (?, ?, ?, 1, ?)`,
        [userId, innovation_id, score, nextLevel]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Skor progres berhasil diperbarui.',
      data: {
        score,
        previousLevel: currentLevel,
        currentLevel: nextLevel,
        highestScore: newHighestScore,
        attemptsCount: newAttemptsCount,
        promotion
      }
    });

  } catch (error) {
    console.error('Error submitting quiz score:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menyimpan hasil kuis adaptif ke database.',
      error: error.message
    });
  }
};

/**
 * Generator kuis tiruan (fallback mock) untuk mengantisipasi API key kosong
 */
function generateMockQuiz(innovation_id, title, lang) {
  const isId = lang === 'id';
  return [
    {
      id: 1,
      question: isId 
        ? `Apakah tujuan utama pengembangan teknologi "${title}"?`
        : `What is the primary goal of "${title}" technology?`,
      options: {
        A: isId ? "Meningkatkan efisiensi dan membantu kehidupan manusia." : "To increase efficiency and assist human lives.",
        B: isId ? "Hanya sebagai mainan untuk dipamerkan ke luar negeri." : "Just as a toy to show off abroad.",
        C: isId ? "Membuat bumi menjadi lebih padat polusinya." : "To make the earth more polluted."
      },
      correct_answer: "A"
    },
    {
      id: 2,
      question: isId 
        ? `Bahan dasar atau infrastruktur pendukung apa yang sangat penting bagi "${title}"?`
        : `Which supporting material or infrastructure is crucial for "${title}"?`,
      options: {
        A: isId ? "Tenaga uap batubara kuno." : "Ancient coal steam power.",
        B: isId ? "Koneksi energi bersih atau listrik stabil." : "Clean energy connection or stable electricity.",
        C: isId ? "Penggunaan kertas tisu tebal." : "The use of thick tissue paper."
      },
      correct_answer: "B"
    },
    {
      id: 3,
      question: isId 
        ? `Siapa target pengguna utama teknologi "${title}" di masyarakat?`
        : `Who is the primary target user of "${title}" in society?`,
      options: {
        A: isId ? "Hewan liar di kebun binatang." : "Wild animals in the zoo.",
        B: isId ? "Komunitas robot otonom saja." : "Only autonomous robot communities.",
        C: isId ? "Warga masyarakat untuk kemudahan hidup sehari-hari." : "Citizens for ease in their daily lives."
      },
      correct_answer: "C"
    },
    {
      id: 4,
      question: isId 
        ? `Mengapa teknologi "${title}" dikategorikan sebagai inovasi masa depan?`
        : `Why is "${title}" classified as a future innovation?`,
      options: {
        A: isId ? "Karena menggunakan sistem ramah lingkungan atau kecerdasan buatan." : "Because it utilizes eco-friendly systems or artificial intelligence.",
        B: isId ? "Karena harganya murah dan mudah dibuang ke tong sampah." : "Because it is cheap and easily thrown in the trash.",
        C: isId ? "Karena tidak membutuhkan uji coba keselamatan sama sekali." : "Because it does not require safety trials at all."
      },
      correct_answer: "A"
    },
    {
      id: 5,
      question: isId 
        ? `Bagaimana sikap terbaik siswa saat mempelajari materi "${title}"?`
        : `What is the best attitude for a student learning about "${title}"?`,
      options: {
        A: isId ? "Mempelajarinya dengan antusias dan peduli dampaknya bagi bumi." : "Learning it with enthusiasm and caring for its impact on Earth.",
        B: isId ? "Menghafal jawabannya saja tanpa perlu memahaminya." : "Just memorizing answers without understanding them.",
        C: isId ? "Mengabaikan teknologi baru karena takut terlalu sulit." : "Ignoring new tech out of fear that it is too hard."
      },
      correct_answer: "A"
    }
  ];
}

module.exports = {
  generateQuiz,
  submitQuizScore
};
