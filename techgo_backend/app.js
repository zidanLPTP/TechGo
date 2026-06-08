const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Determine port
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allowed all for EdTech accessibility, can be restricted later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets directory if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import database configuration to trigger connection
const pool = require('./config/database');

// Import rute API
const apiRouter = require('./routes/api');

// Pasang rute API dengan prefix /api
app.use('/api', apiRouter);

// Healthcheck Route
app.get('/api/health', async (req, res) => {
  try {
    // Quick test query to ensure MySQL connection pool is responsive
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.status(200).json({
      status: 'success',
      message: 'TechGo API server is healthy and running.',
      database: rows[0].result === 2 ? 'connected' : 'disconnected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'TechGo API server is running, but database connection failed.',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Default 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'An internal server error occurred.'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 TechGo API Server running on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

module.exports = app;
