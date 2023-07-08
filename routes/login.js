const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const Usuario  = require('../models/usuario');
const SEED = require('../config/config').SEED


//Google
const CLIENT_ID = require('../config/config').CLIENT_ID
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);


//=============================
//Auntenticacion de Google
//=============================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  // const userid = payload["sub"];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  } 
}





app.post('/google', async (req, res)=>{
  let token = req.body.token;

  let googleUser = await verify(token).catch(e =>{
    return res.status(403).json({
      ok: false,
      mensaje: "token no valido",
    });
  })

  Usuario.findOne({email: googleUser.email})
  .then((usuarioDB)=>{

    if (usuarioDB) {

       if (usuarioDB.google === false) {

         return res.status(400).json({
           ok: false,
           mensaje: "Debe su autentificacion normal",
         });

       } else {

         const token = jwt.sign({ usuario: usuarioDB }, SEED, {
           expiresIn: 14400,
         }); //4 horas

         res.status(200).json({

           ok: true,
           usuario: usuarioDB,
           token: token,
           id: usuarioDB._id,

         });
       }
    }else{
      //El usuario no existe... hay que crearlo 
      let usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':D';

      usuario.save().then((usuarioDB)=>{
        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400,
        }); //4 horas

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
        });
      }).catch((err)=>{
        
      })

    }
   

  }).catch((err)=>{
     res.status(500).json({
       ok: false,
       mensaje: "Error al buscar usuario",
       errors: err,
     });
  })


  // return res.status(200).json({
  //   ok: true,
  //   mensaje: "Funcionando desde login",
  //   errors: "Todo BIen",
  //   googleUser,
    
  // });
})




//==================
//Auntenticacion normal
//==================

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