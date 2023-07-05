const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mdAuntenticacion = require("../middleware/auntenticacion")

const app = express();


const Usuario  = require('../models/usuario');
// const SEED = require('../config/config').SEED


//====================
//Obtener todos los usuarios
//====================
app.get('/', (req, res, next) => {
    console.log("Solicitud recibida en la ruta raíz.");
  
    Usuario.find({}, 'nombre email img role')
        .exec()
      .then(usuarios => {
        
        console.log("Usuarios cargados correctamente:", usuarios);
        
        res.status(200).json({
          ok: true,
          usuarios
        });

      })

      .catch(err => {
        console.log("Error al cargar usuarios:", err);

        res.status(500).json({
          ok: false,
          mensaje: 'Error cargando usuarios',
          errors: err
        });
      });
});





//=========================
//Actualizar usurio
//=========================
app.put('/:id',mdAuntenticacion.verificaToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el id: ${id} no existe`,
        errors: { message: 'No existe un usuario con ese id' }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    const usuarioGuardado = await usuario.save();

    usuarioGuardado.password = ':)'

    res.status(200).json({
      ok: true,
      usuario: usuarioGuardado,
      mensaje: 'Usuario actualizado exitosamente'
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      mensaje: 'Error al actualizar usuario',
      errors: err
    });
  }
});

//=========================
//Crear un nuevo usurio
//=========================
app.post('/',mdAuntenticacion.verificaToken,async (req, res) => {
    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10)  ,
        img: body.img,
        role: body.role,
    });

    try {
        const usuarioGuardado = await usuario.save();
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear usuario',
            errors: err
        });
    }
});



//=========================
//Borrar un usuario por el id
//=========================

app.delete('/:id',mdAuntenticacion.verificaToken, async (req, res) => {
  const id = req.params.id;

  try {
    const usuarioBorrado = await Usuario.findByIdAndRemove(id);

    if (!usuarioBorrado) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró un usuario con el id: ${id}`,
        errors: { message: 'No existe un usuario con ese id' }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
      mensaje: 'Usuario eliminado exitosamente'
    });

    //Manejo de errores
  } catch (err) {
    res.status(400).json({
      ok: false,
      mensaje: 'Error al borrar usuario',
      errors: err
    });
  }
});

module.exports = app;