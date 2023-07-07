const express = require("express");
const fileUpload = require("express-fileupload");
let fs = require('fs')


const path = require("path");
const Usuario = require("../models/usuario");
const Medico = require("../models/medico");
const Hospital = require("../models/hospital");
const usuario = require("../models/usuario");


const app = express();



app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
  let tipo = req.params.tipo;
  let id = req.params.id;

  // ...

  // Obtener nombre del archivo
  let archivo = req.files.imagen;
  let nombreCortado = archivo.name.split(".");
  let extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Solo estas extensiones se aceptan
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  let nombreArchivo;

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extensión no válida",
      errors: {
        message: "Las extensiones deben ser: " + extensionesValidas.join(", "),
      },
    });
  } else {
    // Nombre de archivo personalizado
    nombreArchivo = `${id}-${new Date().getSeconds()}.${extensionArchivo}`;
  }

  // Mover el archivo del temporal a un path
  var newPath = path.join(__dirname, "..", "uploads", tipo, nombreArchivo);

  archivo.mv(newPath, (err) => {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err,
      });
    } else {

      subirPorTipo(tipo, id, nombreArchivo, res);
      // res.status(200).json({
      //   ok: true,
      //   mensaje: "Archivo movido",
      //   extensionArchivo,
      // });
    }
  });
});



function subirPorTipo(tipo, id, nombreArchivo, res){

  if (tipo === 'usuarios') {
    
    Usuario.findById(id).then((usuario)=>{

      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: "Usuario no existe",
          errors: { message: "Usuario no encontrado" },
        });
      }

      let pathViejo = path.resolve(
        __dirname,
        "..",
        "uploads",
        "usuarios",
        usuario.img
      );


      //Si existe elimina la imagen anterior

      // Verificar si la imagen ya existe
      if (fs.existsSync(pathViejo)) {
        // Eliminar la imagen existente
        fs.unlinkSync(pathViejo);
      }
      usuario.img = nombreArchivo;

      usuario.save().then((usuarioActualizado) => {
        usuarioActualizado.password = ':D'
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actulizada",
          usuario: usuarioActualizado,
        });
      });
    }).catch()

  }else if (tipo === 'medicos') {
     Medico.findById(id)
       .then((medico) => {

        if (!medico) {
          return res.status(400).json({
            ok: false,
            mensaje: "Medico no existe",
            errors: { message: "Medico no encontrado" },
          });
        }


         //  let pathViejo = '../uploads/medicos/' + medico.img;
         let pathViejo = path.resolve(
           __dirname,
           "..",
           "uploads",
           "medicos",
           medico.img
         );

         //Si existe elimina la imagen anterior

         // Verificar si la imagen ya existe
         if (fs.existsSync(pathViejo)) {
           // Eliminar la imagen existente
           fs.unlinkSync(pathViejo);
         }

         medico.img = nombreArchivo;

         medico.save().then((medicoActualizado) => {
           return res.status(200).json({
             ok: true,
             mensaje: "Imagen de medico actulizada",
             usuario: medicoActualizado,
           });
         });
       }).catch();


  }else if (tipo === 'hospitales') {
     Hospital.findById(id)
       .then((hospital) => {

        if (!hospital) {
          return res.status(400).json({
            ok: false,
            mensaje: "Hospital no existe",
            errors: {message: "Hospital no encontrado"},
          });
        }


          // let pathViejo = '../uploads/medicos/' + hospital.img;
          let pathViejo = path.resolve(
            __dirname,
            "..",
            "uploads",
            "hospitales",
            hospital.img
          );
        

         //Si existe elimina la imagen anterior

         // Verificar si la imagen ya existe
         if (fs.existsSync(pathViejo)) {
           // Eliminar la imagen existente
           fs.unlinkSync(pathViejo);
         }

         hospital.img = nombreArchivo;

         hospital.save().then((hospitalActualizado) => {
           return res.status(200).json({
             ok: true,
             mensaje: "Imagen de hospital actulizada",
             usuario: hospitalActualizado,
           });
         });
       }).catch();
  }

  
}

module.exports = app;
