const express = require('express');
const ticketRoutes = require('./routes/ticketRoutes');
const areaRoutes = require('./routes/areaRoutes');
const authRoutes = require('./routes/authRoutes');
const userAreaRoutes = require('./routes/userAreaRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// CORS: permitir tu frontend de Vercel
const allowedOrigins = ['https://gestor-tickets-blue.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir llamadas desde herramientas internas (como Postman) sin 'origin'
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('No autorizado por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*',cors());

app.use(express.json());

app.use('/api/areas', areaRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/user-areas', userAreaRoutes);
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Ruta raíz para validar conexión
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
