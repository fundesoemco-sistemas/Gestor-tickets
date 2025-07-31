const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const ticketRoutes = require('./routes/ticketRoutes');
const areaRoutes = require('./routes/areaRoutes');
const authRoutes = require('./routes/authRoutes');
const userAreaRoutes = require('./routes/userAreaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = ['https://gestor-tickets-blue.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('No autorizado por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', (req, res) => res.sendStatus(204)); // ✅ CORS preflight compatible

app.use(express.json());

// Rutas
app.use('/api/areas', areaRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/user-areas', userAreaRoutes);
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

// DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`🟢 Conectado a PostgreSQL - Fecha: ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${process.env.PORT}`);
});
