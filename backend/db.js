require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usa tu .env
  ssl: {
    rejectUnauthorized: false, // para cuando desplegue 
  },
});

module.exports = pool;
