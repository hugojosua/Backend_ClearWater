const pool = require('../db');

const obtenerPublicidad = async (req, res) => {
    try {
        const ads = await pool.query('SELECT * FROM publicidad WHERE activa = TRUE');
        res.json(ads.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener publicidad' });
    }
};

module.exports = { obtenerPublicidad };