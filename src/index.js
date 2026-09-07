const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Importamos el archivo de conexión
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const recargaRoutes = require('./routes/recargaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes'); // <- NUEVO
const reporteRoutes = require('./routes/reporteRoutes');
const publicidadRoutes = require('./routes/publicidadRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const path = require('path');
const app = express();




// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/recargas', recargaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes); // <- NUEVO
app.use('/api/reportes', reporteRoutes);   // <- NUEVO
app.use('/api/publicidad', publicidadRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta para probar la base de datos
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            mensaje: '¡Conexión exitosa con PostgreSQL!', 
            hora_servidor: result.rows[0] 
        });
    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ error: 'Fallo al conectar a la base de datos' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor del local corriendo en el puerto ${PORT}`);
});