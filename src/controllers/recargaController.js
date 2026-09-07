const pool = require('../db');

const registrarRecarga = async (req, res) => {
    // 1. Ahora extraemos también el "valor" del frontend
    const { usuario_id, metodo_pago, valor } = req.body; 
    try {
        const conteoQuery = await pool.query(
            `SELECT COUNT(*) FROM recargas 
             WHERE usuario_id = $1 AND es_promocion = FALSE 
             AND fecha > COALESCE((SELECT MAX(fecha) FROM recargas WHERE usuario_id = $1 AND es_promocion = TRUE), '2000-01-01')`,
            [usuario_id]
        );
        
        const recargasAcumuladas = parseInt(conteoQuery.rows[0].count);
        const es_promocion = recargasAcumuladas >= 5; 

        // 2. Si es promoción el valor es 0, de lo contrario usamos el valor enviado
        const valorFinal = es_promocion ? 0.00 : (valor || 2.00);

        // 3. Insertamos el valor en la base de datos
        const nuevaRecarga = await pool.query(
            'INSERT INTO recargas (usuario_id, metodo_pago, es_promocion, valor) VALUES ($1, $2, $3, $4) RETURNING *',
            [usuario_id, es_promocion ? 'efectivo' : metodo_pago, es_promocion, valorFinal]
        );

        res.status(201).json({
            mensaje: es_promocion ? '¡Sexta recarga gratis aplicada!' : 'Recarga registrada',
            recarga: nuevaRecarga.rows[0],
            faltan_para_gratis: es_promocion ? 5 : 5 - (recargasAcumuladas + 1)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la recarga' });
    }
};

const verificarEstadoCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const conteoQuery = await pool.query(
            `SELECT COUNT(*) FROM recargas 
             WHERE usuario_id = $1 AND es_promocion = FALSE 
             AND fecha > COALESCE((SELECT MAX(fecha) FROM recargas WHERE usuario_id = $1 AND es_promocion = TRUE), '2000-01-01')`,
            [id]
        );
        const recargasAcumuladas = parseInt(conteoQuery.rows[0].count);
        const esGratisProxima = recargasAcumuladas >= 5; // Si tiene 5, la siguiente es gratis

        res.json({
            recargasAcumuladas,
            esGratisProxima,
            faltantes: esGratisProxima ? 0 : 5 - recargasAcumuladas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar estado del cliente' });
    }
};

module.exports = { registrarRecarga, verificarEstadoCliente };