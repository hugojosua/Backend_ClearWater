const pool = require('../db');

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.nombre, u.cedula, u.telefono, u.direccion, u.usa_app,
                   (SELECT COUNT(*) FROM recargas r 
                    WHERE r.usuario_id = u.id AND r.es_promocion = FALSE 
                    AND r.fecha > COALESCE((SELECT MAX(fecha) FROM recargas WHERE usuario_id = u.id AND es_promocion = TRUE), '2000-01-01')
                   ) AS recargas_actuales
            FROM usuarios u 
            WHERE u.rol = 'cliente'
            ORDER BY u.nombre ASC;
        `;
        const clientes = await pool.query(query);
        res.json(clientes.rows);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({ error: 'Error al obtener los clientes' });
    }
};

// Crear cliente (ideal para clientes físicos que no usan la app)
const crearCliente = async (req, res) => {
    const { nombre, cedula, telefono, direccion, usa_app } = req.body;
    try {
        const nuevoCliente = await pool.query(
            'INSERT INTO usuarios (nombre, cedula, telefono, direccion, rol, usa_app) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, cedula',
            [nombre, cedula, telefono, direccion, 'cliente', usa_app || false]
        );
        res.status(201).json({ mensaje: 'Cliente creado', cliente: nuevoCliente.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el cliente o cédula duplicada' });
    }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, direccion, usa_app } = req.body;
    try {
        const clienteActualizado = await pool.query(
            'UPDATE usuarios SET nombre = $1, telefono = $2, direccion = $3, usa_app = $4 WHERE id = $5 RETURNING id, nombre',
            [nombre, telefono, direccion, usa_app, id]
        );
        if (clienteActualizado.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ mensaje: 'Cliente actualizado', cliente: clienteActualizado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

// Eliminar cliente
const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
};

// Obtener datos del perfil y recargas para el dashboard del cliente
const obtenerDatosCliente = async (req, res) => {
    try {
        const usuarioId = req.usuario.id; // Obtenido del token del cliente logueado

        // 1. Contar recargas acumuladas desde la última promoción gratis
        const conteoQuery = await pool.query(
            `SELECT COUNT(*) FROM recargas 
             WHERE usuario_id = $1 AND es_promocion = FALSE 
             AND fecha > COALESCE((SELECT MAX(fecha) FROM recargas WHERE usuario_id = $1 AND es_promocion = TRUE), '2000-01-01')`,
            [usuarioId]
        );
        const totalRecargas = parseInt(conteoQuery.rows[0].count);

        // 2. Obtener notificaciones del usuario
        const notiQuery = await pool.query(
            'SELECT * FROM notificaciones WHERE usuario_id = $1 OR usuario_id IS NULL ORDER BY fecha DESC',
            [usuarioId]
        );

        // 3. Obtener el historial detallado de recargas de este cliente (¡ESTO FALTABA!)
        const recargasQuery = await pool.query(
            'SELECT id, fecha, valor, metodo_pago, es_promocion FROM recargas WHERE usuario_id = $1 ORDER BY fecha DESC',
            [usuarioId]
        );

        res.json({
            totalRecargas,
            notificaciones: notiQuery.rows,
            recargas: recargasQuery.rows // <--- Enviamos el historial al frontend
        });
    } catch (error) {
        console.error('Error al obtener datos del cliente:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
};



// Asegúrate de incluirla en el module.exports junto con las demás:
module.exports = { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente, obtenerDatosCliente};