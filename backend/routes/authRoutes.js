const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

// --- LOGIN CON JWT ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Correo no registrado' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Consultar áreas asignadas desde tabla intermedia
    const areaResult = await pool.query(
      'SELECT area_id FROM user_areas WHERE user_id = $1',
      [user.id]
    );

    const areasAsignadas = areaResult.rows.map(row => row.area_id); // [1, 3, 5]

    // Generar token con áreas incluidas
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        areas: areasAsignadas
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    //  Retornar token + datos relevantes
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        areas: areasAsignadas
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
  }
});

module.exports = router;
