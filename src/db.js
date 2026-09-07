const { Pool } = require('pg');
require('dotenv').config();

// Creamos un "Pool" de conexiones para que sea eficiente con varios clientes
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

pool.on('connect', () => {
    console.log('🔗 Conectado exitosamente a la base de datos de Agua');
});

module.exports = pool;