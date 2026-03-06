import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Middleware de autenticación JWT.
 * Verifica el token en el header Authorization: Bearer <token>
 * Si es válido, agrega req.usuario con el payload decodificado.
 */
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // { id: usuario_id, iat, exp }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expirado. Por favor inicia sesión de nuevo." });
        }
        return res.status(403).json({ error: "Token inválido." });
    }
};