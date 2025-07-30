const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyToken = require('../middleware/verifyToken'); 
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Asignar usuario a un área (solo admin)
router.post('/', verifyAdmin, async (req, res) => {
  const { user_id, area_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO user_areas (user_id, area_id) VALUES ($1, $2) RETURNING *',
      [user_id, area_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al asignar usuario a área:', error);
    res.status(500).json({ message: 'Error al asignar usuario a área' });
  }
});

// Obtener áreas asignadas a un usuario (requiere estar autenticado)
router.get('/por-usuario/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.* FROM user_areas ua
       JOIN areas a ON a.id = ua.area_id
       WHERE ua.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener áreas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener áreas' });
  }
});

// Obtener usuarios asignados a un área (requiere estar autenticado)
router.get('/por-area/:areaId', verifyToken, async (req, res) => {
  const { areaId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role FROM user_areas ua
       JOIN users u ON u.id = ua.user_id
       WHERE ua.area_id = $1`,
      [areaId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener usuarios del área:', error);
    res.status(500).json({ message: 'Error al obtener usuarios del área' });
  }
});

// Eliminar asignación usuario-área (solo admin)
router.delete('/:userId/:areaId', verifyAdmin, async (req, res) => {
  const { userId, areaId } = req.params;
  try {
    await pool.query(
      'DELETE FROM user_areas WHERE user_id = $1 AND area_id = $2',
      [userId, areaId]
    );
    res.json({ message: 'Asignación eliminada' });
  } catch (error) {
    console.error('❌ Error al eliminar asignación:', error);
    res.status(500).json({ message: 'Error al eliminar asignación' });
  }
}); 

module.exports = router;
