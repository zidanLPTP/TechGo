const express = require('express');
const router = express.Router();
const { getCountriesWithInnovations } = require('../controllers/innovationController');
const { generateQuiz, submitQuizScore } = require('../controllers/aiController');

// Route untuk mengambil daftar negara beserta inovasi teknologi (One-to-Many)
router.get('/countries', getCountriesWithInnovations);

// Route untuk merumuskan kuis otomatis via AI Gemini Flash
router.post('/quiz/generate', generateQuiz);

// Route untuk mengirim skor kuis dan memperbarui level keahlian secara adaptif
router.post('/quiz/submit', submitQuizScore);

module.exports = router;
