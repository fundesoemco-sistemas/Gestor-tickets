const verifyToken = require('./verifyToken');

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }
  });
}

module.exports = verifyAdmin;
