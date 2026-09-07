const express = require('express');
const router = express.Router();
const { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente, obtenerDatosCliente } = require('../controllers/clienteController');

// 1. IMPORTANTE: Importamos ambas funciones de seguridad aquí arriba
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

// 2. Ruta para el cliente (NO lleva verificarAdmin)
router.get('/perfil-datos', verificarToken, obtenerDatosCliente);

// 3. Rutas exclusivas para administradores
router.get('/', verificarToken, verificarAdmin, obtenerClientes);
router.post('/', verificarToken, verificarAdmin, crearCliente);
router.put('/:id', verificarToken, verificarAdmin, actualizarCliente);
router.delete('/:id', verificarToken, verificarAdmin, eliminarCliente);

module.exports = router;