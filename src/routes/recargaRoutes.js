const express = require('express');
const router = express.Router();
const { registrarRecarga } = require('../controllers/recargaController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

// Solo los admins autenticados pueden registrar recargas
router.post('/registrar', verificarToken, verificarAdmin, registrarRecarga);

module.exports = router;