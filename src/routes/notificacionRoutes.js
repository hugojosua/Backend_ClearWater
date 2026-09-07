const express = require('express');
const router = express.Router();
const { obtenerNotificaciones, enviarNotificacion, crearNotificacionCliente } = require('../controllers/notificacionController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarAdmin, obtenerNotificaciones);

// Ruta unificada para POST /api/notificaciones
router.post('/', verificarToken, (req, res, next) => {
    // Si el usuario es administrador y envía destinatario o mensaje general, usa enviarNotificacion
    // Si es cliente, usa crearNotificacionCliente
    if (req.usuario.rol === 'admin') {
        return enviarNotificacion(req, res, next);
    } else {
        return crearNotificacionCliente(req, res, next);
    }
});

module.exports = router;