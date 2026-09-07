const express = require('express');
const router = express.Router();

// ¡AQUÍ ESTÁ EL DETALLE! Asegúrate de importar ambas funciones separadas por coma:
const { obtenerReportes, obtenerHistorialDetallado } = require('../controllers/reporteController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarAdmin, obtenerReportes);

// NUEVA RUTA PARA LA TABLA
router.get('/historial', verificarToken, verificarAdmin, obtenerHistorialDetallado); 

module.exports = router;