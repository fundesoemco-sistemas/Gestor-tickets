const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// ✅ CORS robusto: habilita origin desde Vercel + manejo de preflight
const allowedOrigins = ['https://gestor-tickets-blue.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS bloqueado: origen no autorizado'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Responde a preflight OPTIONS
app.use(express.json());

// =======================================================
// ✅ BLOQUE DE RUTAS ACTIVAS
// =======================================================
const ticketRoutes = require('./routes/ticketRoutes');
const areaRoutes = require('./routes/areaRoutes');
const authRoutes = require('./routes/authRoutes');
const userAreaRoutes = require('./routes/userAreaRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/areas', areaRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/user-areas', userAreaRoutes);
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

// =======================================================

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Ruta raíz simple para test de despliegue
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`🟢 Conectado a PostgreSQL - Fecha: ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

// Fallback por si no encuentra ninguna ruta
app.use((req, res) => {
  res.sendStatus(404);
});

// Inicialización del servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${process.env.PORT}`);
});
