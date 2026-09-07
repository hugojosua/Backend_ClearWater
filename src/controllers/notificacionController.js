const pool = require('../db');

// Obtener todas las notificaciones para el historial
const obtenerNotificaciones = async (req, res) => {
    try {
        const query = `
            SELECT n.id, n.mensaje, n.fecha, u.nombre AS usuario_nombre 
            FROM notificaciones n 
            LEFT JOIN usuarios u ON n.usuario_id = u.id 
            ORDER BY n.fecha DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
};

// Enviar una nueva notificación
const enviarNotificacion = async (req, res) => {
    const { usuario_id, mensaje } = req.body;
    try {
        if (usuario_id) {
            // Notificación para un usuario específico
            await pool.query(
                'INSERT INTO notificaciones (usuario_id, mensaje) VALUES ($1, $2)',
                [usuario_id, mensaje]
            );
        } else {
            // Notificación masiva para todos los clientes
            const clientes = await pool.query("SELECT id FROM usuarios WHERE rol = 'cliente'");
            for (let cliente of clientes.rows) {
                await pool.query(
                    'INSERT INTO notificaciones (usuario_id, mensaje) VALUES ($1, $2)',
                    [cliente.id, mensaje]
                );
            }
        }
        res.status(201).json({ mensaje: 'Notificación enviada correctamente' });
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({ error: 'Error al enviar notificación' });
    }
};

// Crear notificación enviada por un cliente (ej. solicitud de producto o reserva)
const crearNotificacionCliente = async (req, res) => {
    const { mensaje } = req.body;
    const usuarioId = req.usuario.id; // Viene del token de autenticación del cliente
    try {
        await pool.query(
            'INSERT INTO notificaciones (usuario_id, mensaje) VALUES ($1, $2)',
            [usuarioId, mensaje]
        );
        res.status(201).json({ mensaje: 'Solicitud enviada al administrador correctamente' });
    } catch (error) {
        console.error('Error al enviar la notificación del cliente:', error);
        res.status(500).json({ error: 'Error al enviar la solicitud' });
    }
};

module.exports = { obtenerNotificaciones, enviarNotificacion, crearNotificacionCliente };
