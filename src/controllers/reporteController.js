const pool = require('../db');

const obtenerReportes = async (req, res) => {
    try {
        const clientesRes = await pool.query("SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente'");
        const total_clientes = parseInt(clientesRes.rows[0].count);

        const recargasRes = await pool.query("SELECT COUNT(*) FROM recargas");
        const total_recargas = parseInt(recargasRes.rows[0].count);

        // AQUÍ ESTÁ LA MAGIA: Sumamos la columna valor de las recargas pagadas
        const ingresosRes = await pool.query("SELECT SUM(valor) as total FROM recargas WHERE es_promocion = FALSE");
        
        // Verificamos que no sea nulo (por si no hay ventas aún)
        const ingresos_totales = ingresosRes.rows[0].total ? parseFloat(ingresosRes.rows[0].total).toFixed(2) : '0.00';

        res.json({
            total_clientes,
            total_recargas,
            ingresos_totales
        });
    } catch (error) {
        console.error('Error al calcular reportes:', error);
        res.status(500).json({ error: 'Error interno al generar métricas financieras' });
    }
};

const obtenerHistorialDetallado = async (req, res) => {
    try {
        const query = `
            SELECT r.id, r.fecha, r.valor, r.metodo_pago, r.es_promocion, 
                   u.id AS usuario_id, u.nombre AS cliente_nombre 
            FROM recargas r
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.fecha DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

// No olvides exportarla junto a la que ya tenías
module.exports = { obtenerReportes, obtenerHistorialDetallado };