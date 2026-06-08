const mysql = require('mysql2/promise');
const path = require('path');

// Ensure environmental variables are loaded (in case app.js is run from a nested path)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create a database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'techgo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection pool established successfully.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
}

// Automatically test connection on import (will show warning/success on startup)
testConnection();

module.exports = pool;
