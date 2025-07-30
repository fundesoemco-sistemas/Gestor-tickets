const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['user-id']; // Esperamos el ID en el encabezado

    if (!userId) {
      return res.status(401).json({ message: 'ID de usuario no proporcionado' });
    }

    const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso no autorizado. Solo admins.' });
    }

    next(); // Tiene permiso
  } catch (error) {
    console.error('❌ Error en middleware de admin:', error);
    res.status(500).json({ message: 'Error al verificar permisos' });
  }
};

module.exports = checkAdmin;
