const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED

// =========================
// Verificar token
// =========================
exports.verificaToken = function (req, res, next) {
    const token = req.query.token;
  
    jwt.verify(token, SEED, (err, decoded) => {
      if (err) {
        console.log("Error al verificar el token:", err);
  
        return res.status(401).json({
          ok: false,
          mensaje: 'Token incorrecto',
          errors: err
        });
      }

  
      // Si el token es válido, puedes acceder a los datos decodificados a través de `decoded`
      req.usuario = decoded.usuario;
      next();
    });
}
