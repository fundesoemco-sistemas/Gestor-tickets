const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const verifyAdmin = require('../middleware/verifyAdmin');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Obtener todos los usuarios activos (solo admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE activo = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario (solo admin)
router.post('/', verifyAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role, activo) VALUES ($1, $2, $3, $4, true)',
      [name, email, hashedPassword, role || 'usuario']
    );
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
  console.error('❌ Error al crear usuario:', error.message, error.code);

  // Capturar error por correo duplicado
  if (error.code === '23505') {
    return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
  }

  res.status(500).json({ message: 'Error al crear usuario' });
}
});

// Editar usuario (solo admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  try {
    await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
      [name, email, role, userId]
    );
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Eliminar o desactivar usuario (solo admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    // Verificar si tiene tickets asociados
    const ticketCheck = await pool.query(
      'SELECT COUNT(*) FROM tickets WHERE user_id = $1',
      [userId]
    );
    const ticketCount = parseInt(ticketCheck.rows[0].count);

    if (ticketCount > 0) {
      // Tiene tickets → marcar como inactivo
      await pool.query('UPDATE users SET activo = false WHERE id = $1', [userId]);
      return res.json({ message: 'Usuario tiene tickets, se ha desactivado en lugar de eliminar' });
    }

    // Eliminar relaciones con áreas si existen
    await pool.query('DELETE FROM user_areas WHERE user_id = $1', [userId]);

    // Eliminar usuario
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// Reactivar usuario desactivado (solo admin)
router.patch('/reactivar/:id', verifyAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    await pool.query('UPDATE users SET activo = true WHERE id = $1', [userId]);
    res.json({ message: 'Usuario reactivado correctamente' });
  } catch (error) {
    console.error('❌ Error al reactivar usuario:', error);
    res.status(500).json({ message: 'Error al reactivar usuario' });
  }
});

// Obtener usuarios encargados de un área específica
router.get('/encargados/:areaId', async (req, res) => {
  const areaId = req.params.areaId;

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email 
       FROM users u
       INNER JOIN user_areas ua ON u.id = ua.user_id
       WHERE ua.area_id = $1 AND u.activo = true`,
      [areaId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener encargados:', error);
    res.status(500).json({ message: 'Error al obtener encargados del área' });
  }
});

module.exports = router;
