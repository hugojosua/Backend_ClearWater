const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// RF2: Registro de Usuario
const registrar = async (req, res) => {
    const { nombre, cedula, telefono, direccion, password, rol, usa_app } = req.body;
    try {
        // Verificar si la cédula ya existe
        const userExist = await pool.query('SELECT * FROM usuarios WHERE cedula = $1', [cedula]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: 'La cédula ya está registrada' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar en base de datos
        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre, cedula, telefono, direccion, password, rol, usa_app) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre, rol',
            [nombre, cedula, telefono, direccion, hashedPassword, rol || 'cliente', usa_app !== false]
        );

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// RF1: Inicio de Sesión
const login = async (req, res) => {
    const { cedula, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE cedula = $1', [cedula]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' });

        const user = result.rows[0];

        if (!user.usa_app) return res.status(403).json({ error: 'Este cliente no usa la app' });

        // Comparar contraseñas
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

        // Generar Token
        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ mensaje: 'Bienvenido', token, usuario: { id: user.id, nombre: user.nombre, rol: user.rol } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { registrar, login };