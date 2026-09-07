const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    try {
        // Extraemos el token (formato: "Bearer TOKEN_AQUI")
        const verificado = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.usuario = verificado;
        next(); // Permite continuar a la siguiente función
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

const verificarAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
};

module.exports = { verificarToken, verificarAdmin };