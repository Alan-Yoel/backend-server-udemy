const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const Usuario  = require('../models/usuario');
const SEED = require('../config/config').SEED

app.post('/', (req, res) => {
    const body = req.body;
  
    Usuario.findOne({ email: body.email })
      .then((usuarioDB) => {
        if (!usuarioDB) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - email',
            errors: 'Usuario no encontrado',
          });
        }
  
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - password',
            errors: 'Contraseña incorrecta',
          });
        }
  
        // Crear un token aquí
        usuarioDB.password = ':)';
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 } ) //4 horas

  
        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
        });
      })
      .catch((err) => {
        res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuario',
          errors: err,
        });
      });
  });
  


module.exports = app;