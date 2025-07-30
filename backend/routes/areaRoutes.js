const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyAdmin = require('../middleware/verifyAdmin');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Obtener todas las áreas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM areas ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener áreas:', error);
    res.status(500).json({ message: 'Error al obtener áreas' });
  }
});

// Crear nueva área (nombre)
router.post('/create', verifyAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }

  try {
    await pool.query('INSERT INTO areas (name) VALUES ($1)', [name]);
    res.status(201).json({ message: 'Área creada exitosamente' });
  } catch (error) {
    console.error('❌ Error al crear área:', error);
    res.status(500).json({ message: 'Error al crear área' });
  }
});

// Asignar area (solo admin)
router.post('/', verifyAdmin, async (req, res) => {
  const { user_id, area_id, is_manager = false } = req.body;

  try {
    // upsert simple: si ya existe, actualiza is_manager
    await pool.query(`
      INSERT INTO user_areas (user_id, area_id, is_manager)
      VALUES ($1,$2,$3)
      ON CONFLICT (user_id, area_id)
      DO UPDATE SET is_manager = EXCLUDED.is_manager
    `, [user_id, area_id, is_manager]);

    res.json({ message: 'Área asignada' });
  } catch (err) {
    console.error('❌ Error asignando área:', err);
    res.status(500).json({ message: 'Error al asignar área' });
  }
});

// Actualizar una área existente (solo admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await pool.query('UPDATE areas SET name = $1 WHERE id = $2', [name, id]);
    res.json({ message: 'Área actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar área:', error);
    res.status(500).json({ message: 'Error al actualizar área' });
  }
});

// Eliminar área (solo admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM areas WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error al eliminar área:', error);
    res.status(500).json({ message: 'Error al eliminar área' });
  }
});

// Obtener usuarios por área
router.get('/:areaId/users', async (req, res) => {
  const { areaId } = req.params;
  try {
    const result = await pool.query(
      `SELECT users.id, users.name, users.email
       FROM user_areas ua
       JOIN users ON ua.user_id = users.id
       WHERE ua.area_id = $1`,
      [areaId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener usuarios por área:', error);
    res.status(500).json({ message: 'Error al obtener usuarios por área' });
  }
});

module.exports = router;
