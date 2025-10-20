// service/authMiddleware.js
const jwt = require('jsonwebtoken');
// IMPORTANTE: Asegúrate de que JWT_SECRET esté cargado en process.env (debe estar en .env e index.js)
const JWT_SECRET = process.env.JWT_SECRET; 

/**
 * Middleware para verificar si un usuario está autenticado (tiene un JWT válido).
 */
const protect = (req, res, next) => {
    // 1. Obtener la cabecera de autorización
    const authHeader = req.headers.authorization;
    
    // 2. Verificar formato de la cabecera
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message: 'Acceso denegado. Se requiere un token de autenticación válido.' 
        });
    }

    // Extraer solo el token (quitando "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 4. Adjuntar la información del usuario (id, email) al objeto de la solicitud
        req.user = decoded; 
        
        // 5. Continuar al siguiente middleware o controlador
        next();
        
    } catch (error) {
        // El token es inválido (ej: expirado, firma incorrecta)
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = protect;