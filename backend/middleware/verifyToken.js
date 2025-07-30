const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('⛔ Token no recibido en encabezado Authorization');
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Token verificado con éxito:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('🚫 Token inválido o expirado:', err.message);
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
}

module.exports = verifyToken;
