const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const pool = require('../db');
require('dotenv').config();

// 📦 Brevo
const SibApiV3Sdk = require('sib-api-v3-sdk');
const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Obtener estadísticas globales
const ticketController = require('../controllers/ticketController');
router.get('/stats', ticketController.obtenerEstadisticas);

// Ruta para separar tickets creados por el usuario y asignados por área
router.get('/mis-tickets', verifyToken, async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Usuario no autenticado' });

  try {
    const creados = await pool.query(
      `SELECT t.*, a.name AS area_name
       FROM tickets t
       JOIN areas a ON a.id = t.area_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    const asignados = await pool.query(
      `SELECT t.*, u.name AS user_name, a.name AS area_name
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       JOIN areas a ON a.id = t.area_id
       WHERE t.user_id <> $1 AND t.area_id IN (
         SELECT area_id FROM user_areas WHERE user_id = $1
       )
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json({
      creados: creados.rows,
      asignados: asignados.rows
    });
  } catch (err) {
    console.error('❌ Error al obtener tickets separados:', err);
    res.status(500).json({ message: 'Error al obtener tickets del usuario' });
  }
});

// 1. CREAR TICKET
router.post('/', verifyToken, async (req, res) => {
  const { title, description, priority = 'media', area_id } = req.body;
  const user_id = req.user?.id;

  if (!user_id || !title || !description || !area_id) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const area = await pool.query('SELECT 1 FROM areas WHERE id = $1', [area_id]);
    if (!area.rowCount) return res.status(400).json({ message: 'Área no encontrada' });

    const result = await pool.query(
      `INSERT INTO tickets (title, description, priority, user_id, status, area_id)
       VALUES ($1,$2,$3,$4,'pendiente',$5) RETURNING *`,
      [title, description, priority, user_id, area_id]
    );

    const ticketCreado = result.rows[0];

    // 🔔 Notificación por correo
    const usuariosAsignados = await pool.query(
      `SELECT u.name, u.email 
       FROM users u
       INNER JOIN user_areas ua ON ua.user_id = u.id
       WHERE ua.area_id = $1`,
      [area_id]
    );

    for (const usuario of usuariosAsignados.rows) {
      const color = getColorForPriority(priority);
      const sendSmtpEmail = {
        sender: {
          name: "FUNDESOEMCO Soporte",
          email: "sistemas@fundesoemco.com"
        },
        to: [{
          email: usuario.email,
          name: usuario.name
        }],
        subject: "Nuevo ticket asignado a tu área",
        htmlContent: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2c3e50;">Hola ${usuario.name},</h2>
      <p>Se ha creado un nuevo ticket asignado a tu área:</p>
      <ul>
        <li><strong>Título:</strong> ${title}</li>
        <li><strong>Descripción:</strong> ${description}</li>
        <li>
          <strong>Prioridad:</strong> 
          <span style="background-color: ${color}; color: white; padding: 3px 8px; border-radius: 4px;">
            ${priority.toUpperCase()}
          </span>
        </li>
      </ul>
      <p>Por favor ingresa al sistema para atenderlo.</p>
    </div>
  `
      };

      try {
        await emailApi.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Correo enviado a ${usuario.email}`);
      } catch (error) {
        console.error(`❌ Error enviando correo a ${usuario.email}:`, error.message);
      }
    }

    res.status(201).json(ticketCreado);
  } catch (err) {
    console.error('❌ Error al crear ticket:', err);
    res.status(500).json({ message: 'Error al crear ticket' });
  }
});

const getColorForPriority = (priority) => {
  switch (priority.toLowerCase()) {
    case 'alta':
      return '#e74c3c'; // rojo
    case 'media':
      return '#f1c40f'; // amarillo
    case 'baja':
      return '#3498db'; // azul
    default:
      return '#7f8c8d'; // gris por defecto
  }
};

// 2. OBTENER TODOS LOS TICKETS (según permisos)
router.get('/', verifyToken, async (req, res) => {
  const user = req.user;

  try {
    if (user.role === 'admin') {
      const result = await pool.query(
        `SELECT t.*, u.name AS user_name, a.name AS area_name
         FROM tickets t
         JOIN users u ON u.id = t.user_id
         JOIN areas a ON a.id = t.area_id
         ORDER BY t.created_at DESC`
      );
      result.rows = result.rows.map((r) => ({ ...r, can_edit: true }));
      return res.json(result.rows);
    }

    const result = await pool.query(
      `SELECT 
        t.*, u.name AS user_name, a.name AS area_name,
        (
          $1 = 'admin' OR EXISTS (
            SELECT 1 FROM user_areas ua
            WHERE ua.user_id = $2 AND ua.area_id = t.area_id
          )
        ) AS can_edit
      FROM tickets t
      JOIN users u ON u.id = t.user_id
      JOIN areas a ON a.id = t.area_id
      WHERE (
        t.user_id = $2 OR EXISTS (
          SELECT 1 FROM user_areas ua
          WHERE ua.user_id = $2 AND ua.area_id = t.area_id
        )
      )
      ORDER BY t.created_at DESC`,
      [user.role, user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener tickets:', err);
    res.status(500).json({ message: 'Error al obtener tickets' });
  }
});

// 3. ACTUALIZAR ESTADO DEL TICKET
router.put('/:id/status', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pendiente', 'en_proceso', 'cerrado'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  try {
    const t = await pool.query('SELECT area_id FROM tickets WHERE id = $1', [id]);
    if (!t.rowCount) return res.status(404).json({ message: 'Ticket no encontrado' });

    const areaId = t.rows[0].area_id;

    if (req.user.role !== 'admin') {
      const perteneceAlArea = await pool.query(
        `SELECT 1 FROM user_areas WHERE user_id = $1 AND area_id = $2`,
        [req.user.id, areaId]
      );
      if (!perteneceAlArea.rowCount) {
        return res.status(403).json({ message: 'No autorizado para cambiar el estado' });
      }
    }

    const result = await pool.query(
      'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar estado:', err);
    res.status(500).json({ message: 'Error al actualizar estado del ticket' });
  }
});

// 4. EDITAR TICKET (solo admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, area_id } = req.body;
  const allowedStatus = ['pendiente', 'en_proceso', 'cerrado'];
  const allowedPrio = ['baja', 'media', 'alta'];

  if (!allowedStatus.includes(status) || !allowedPrio.includes(priority)) {
    return res.status(400).json({ message: 'Valores de prioridad/estado no válidos' });
  }

  try {
    const result = await pool.query(
      `UPDATE tickets
       SET title = $1, description = $2, priority = $3,
           status = $4, area_id = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, priority, status, area_id, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al editar ticket:', err);
    res.status(500).json({ message: 'Error al editar ticket' });
  }
});

// 5. ELIMINAR TICKET (solo admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING id', [id]);
    if (!deleted.rowCount) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json({ message: `Ticket ${id} eliminado` });
  } catch (err) {
    console.error('❌ Error al eliminar ticket:', err);
    res.status(500).json({ message: 'Error al eliminar ticket' });
  }
});

module.exports = router;
