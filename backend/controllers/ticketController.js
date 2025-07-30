const Ticket = require('../models/Ticket');
const pool = require('../db');
const nodemailer = require('nodemailer');

const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await Ticket.obtenerEstadisticas();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error en el controlador de estadísticas:', error.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

const getMisTicketsSeparados = async (req, res) => {
  try {
    const userId = req.user.id;

    const creadosPorMi = await pool.query(
      'SELECT t.*, a.nombre AS area_nombre FROM tickets t LEFT JOIN areas a ON t.area_id = a.id WHERE t.creador_id = $1 ORDER BY t.fecha_creacion DESC',
      [userId]
    );

    const asignadosAMi = await pool.query(
      'SELECT t.*, a.nombre AS area_nombre FROM tickets t LEFT JOIN areas a ON t.area_id = a.id WHERE t.asignado_id = $1 ORDER BY t.fecha_creacion DESC',
      [userId]
    );

    res.json({
      creadosPorMi: creadosPorMi.rows,
      asignadosAMi: asignadosAMi.rows
    });
  } catch (error) {
    console.error('❌ Error obteniendo mis tickets:', error);
    res.status(500).json({ error: 'Error al obtener los tickets del usuario' });
  }
};

module.exports = {obtenerEstadisticas, getMisTicketsSeparados};
