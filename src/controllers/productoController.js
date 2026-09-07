const pool = require('../db');

const obtenerProductos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    // Guardamos la ruta relativa limpia para usarla en el frontend
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, precio, imagen_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    
    try {
        // Verificamos si se subió una nueva imagen en la actualización
        if (req.file) {
            const imagen_url = `/uploads/${req.file.filename}`;
            const result = await pool.query(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, imagen_url = $4 WHERE id = $5 RETURNING *',
                [nombre, descripcion, precio, imagen_url, id]
            );
            return res.json(result.rows[0]);
        } else {
            // Si no se sube imagen nueva, actualizamos los datos sin tocar la imagen existente
            const result = await pool.query(
                'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3 WHERE id = $4 RETURNING *',
                [nombre, descripcion, precio, id]
            );
            return res.json(result.rows[0]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };