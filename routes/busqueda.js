const express = require("express");

const Hospital = require("../models/hospital");
const Medico = require("../models/medico");
const Usuario = require("../models/usuario");


const app = express();
//=======================
// Busqueda por coleccion
//=======================

app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  let busqueda = req.params.busqueda;
  let tabla = req.params.tabla;

  let promesa;

  let regex = new RegExp(busqueda, "i");

  switch (tabla) {
    case "usuario":
      promesa = buscarUsuario(busqueda, regex);
      break;
    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          "Los tipos de búsquedas solo son: usuarios, médicos y hospitales",
        error: { mensaje: "tipo de tabla no válido" },
      });
  }

  promesa
    .then((data) => {
      res.status(200).json({
        ok: true,
        [tabla]: data,
      });
    })
    .catch((error) => {
      res.status(500).json({
        ok: false,
        error: error.message,
      });
    });
});






//=====================
// Busqueda general
//=====================

app.get("/todo/:busqueda", (req, res, next) => {

  let busqueda = req.params.busqueda;
  
  let regex = new RegExp(busqueda, "i");

  Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuario(busqueda, regex),
    ])
  .then((respuestas) => {

    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuario: respuestas[2],
    });

  });

});

function buscarHospitales(busqueda, regex) {

  return new Promise((resolve, reject) => {

    Hospital.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .exec()
      .then((hospitales) => {
        resolve(hospitales);
      })
      .catch((err) => {
        reject("Error al cargar hospitales");
      });
  });
}

function buscarMedicos(busqueda, regex) {

  return new Promise((resolve, reject) => {

    Medico.find({ nombre: regex })
        .populate('nombre', 'nombre email')
        .populate('hospital')
        .exec()
        .then((medicos) => {
            
            resolve(medicos);

        })
        .catch((err) => {
            reject("Error al cargar hospitales");
        });
   });
}
function buscarUsuario(busqueda, regex) {

  return new Promise((resolve, reject) => {
    
    Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex },{'email': regex} ])
            .exec()
            .then((usuario)=>{
                resolve(usuario)

            }).catch( err=>{
                reject("usuario no encontrado");
            })
  });
}

module.exports = app;
