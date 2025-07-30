const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

/* Rutas */
const ticketRoutes = require('./routes/ticketRoutes');
const areaRoutes = require('./routes/areaRoutes');
const authRoutes = require('./routes/authRoutes');
const userAreaRoutes = require('./routes/userAreaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ CORS configurado para permitir solo los orígenes autorizados
const allowedOrigins = [
  'https://gestor-tickets-blue.vercel.app', // frontend en producción
  'http://localhost:5173',                  // desarrollo local
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // permitir herramientas como Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('No autorizado por CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

/* Endpoints */
app.use('/api/areas', areaRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/user-areas', userAreaRoutes);
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

// 🔗 Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Ruta raíz para verificar conexión
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`🟢 Conectado a PostgreSQL - Fecha: ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

// 🚀 Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${process.env.PORT}`);
});
