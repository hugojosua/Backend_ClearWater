const express = require('express');
const router = express.Router();
const { obtenerPublicidad } = require('../controllers/publicidadController');

// Ruta pública para que los clientes vean la publicidad en la app
router.get('/', obtenerPublicidad);

module.exports = router;