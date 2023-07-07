const express = require("express");

const mdAuntenticacion = require("../middleware/auntenticacion");

const app = express();

const Hospital = require("../models/hospital");
// const SEED = require('../config/config').SEED

//====================
//Obtener todos los hospitales
//====================
app.get("/", (req, res, next) => {
  console.log("Solicitud recibida en la ruta raíz.");

  Hospital.find({})
    .populate("usuario", "nombre email")
    .limit(5)
    .exec()
    .then((hospital) => {
      Hospital.count({}).then((conteo) => {
        res.status(200).json({
          ok: true,
          hospital,
          total: conteo,
        });
      });
    })

    .catch((err) => {
      console.log("Error al cargar hospital:", err);

      res.status(500).json({
        ok: false,
        mensaje: "Error cargando hospital",
        errors: err,
      });
    });
});

//=========================
//Actualizar usurio
//=========================
app.put("/:id", mdAuntenticacion.verificaToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: `El hospital con el id: ${id} no existe`,
        errors: { message: "No existe un hospital con ese id" },
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    const hospitalGuardado = await hospital.save();

    res.status(200).json({
      ok: true,
      usuario: hospitalGuardado,
      mensaje: "Hospital actualizado exitosamente",
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      mensaje: "Error al actualizar Hospital",
      errors: err,
    });
  }
});

//=========================
//Crear un nuevo hospital
//=========================
app.post("/", mdAuntenticacion.verificaToken, async (req, res) => {
  const body = req.body;

  const hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id,
  });

  try {
    const hospitalGuardado = await hospital.save();
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      mensaje: "Error al crear hospital",
      errors: err,
    });
  }
});

//=========================
//Borrar un hospital por el id
//=========================

app.delete("/:id", mdAuntenticacion.verificaToken, async (req, res) => {
  const id = req.params.id;

  try {
    const hospitalBorrado = await Hospital.findByIdAndRemove(id);

    if (!hospitalBorrado) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró un hospital con el id: ${id}`,
        errors: { message: "No existe un hospital con ese id" },
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado,
      mensaje: "hospital eliminado exitosamente",
    });

    //Manejo de errores
  } catch (err) {
    res.status(400).json({
      ok: false,
      mensaje: "Error al borrar usuario",
      errors: err,
    });
  }
});

module.exports = app;
