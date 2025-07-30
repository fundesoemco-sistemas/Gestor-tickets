const pool = require('../db');

// Función para convertir horas decimales a formato "Xh Ym Zs"
function formatearHoras(horasDecimales) {
  if (!horasDecimales || isNaN(horasDecimales)) return 'N/A';

  const totalSegundos = Math.floor(horasDecimales * 3600);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  return `${horas}h ${minutos}m ${segundos}s`;
}

const Ticket = {
  async obtenerEstadisticas() {
    try {
      const totalResult = await pool.query(`SELECT COUNT(*) FROM tickets`);

      const estadoResult = await pool.query(`
        SELECT status, COUNT(*) AS count
        FROM tickets
        GROUP BY status
      `);

      const prioridadResult = await pool.query(`
        SELECT priority, COUNT(*) AS count
        FROM tickets
        GROUP BY priority
      `);

      const areaResult = await pool.query(`
        SELECT a.name AS area, COUNT(*) AS count
        FROM tickets t
        JOIN areas a ON t.area_id = a.id
        GROUP BY a.name
      `);

      const tiempoPromedioResult = await pool.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) AS horas
        FROM tickets
        WHERE status = 'cerrado'
      `);

      const tiempoPorAreaResult = await pool.query(`
        SELECT 
          a.name AS area,
          AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600) AS horas
        FROM tickets t
        JOIN areas a ON t.area_id = a.id
        WHERE t.status = 'cerrado'
        GROUP BY a.name
      `);

      const horasPromedio = parseFloat(tiempoPromedioResult.rows[0].horas);

      const tiempoPorArea = tiempoPorAreaResult.rows.map(row => ({
        area: row.area,
        horasDecimales: parseFloat(row.horas).toFixed(2),
        tiempoFormateado: formatearHoras(parseFloat(row.horas))
      }));

      return {
        total: parseInt(totalResult.rows[0].count),
        porEstado: estadoResult.rows.map(row => ({
          status: row.status,
          count: parseInt(row.count),
        })),
        porPrioridad: prioridadResult.rows.map(row => ({
          priority: row.priority,
          count: parseInt(row.count),
        })),
        porArea: areaResult.rows.map(row => ({
          area: row.area,
          count: parseInt(row.count),
        })),
        tiempoPromedioHoras: isNaN(horasPromedio) ? null : parseFloat(horasPromedio.toFixed(2)),
        tiempoPromedio: isNaN(horasPromedio) ? 'N/A' : formatearHoras(horasPromedio),
        tiempoPromedioPorArea: tiempoPorArea,
      };
    } catch (error) {
      console.error('❌ Error completo en obtenerEstadisticas:', error);
      throw error;
    }
  },
};

module.exports = Ticket;
