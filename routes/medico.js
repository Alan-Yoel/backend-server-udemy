const express = require("express");

const mdAuntenticacion = require("../middleware/auntenticacion");

const app = express();

const Medico = require("../models/medico");
// const SEED = require('../config/config').SEED

//====================
//Obtener todos los medico
//====================
app.get("/", (req, res, next) => {
  console.log("Solicitud recibida en la ruta raíz.");

  let desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .populate("usuario", "nombre email")
    .populate("hospital")
    .limit(5)
    .exec()
    .then((medicos) => {
      Medico.count({}).then((conteo) => {
        console.log("medicos cargados correctamente:", medicos);
        res.status(200).json({
          ok: true,
          medicos,
          total: conteo,
        });
      });
    })

    .catch((err) => {
      console.log("Error al cargar medicos:", err);

      res.status(500).json({
        ok: false,
        mensaje: "Error cargando medicos",
        errors: err,
      });
    });
});

//=========================
//Actualizar medico
//=========================
app.put("/:id", mdAuntenticacion.verificaToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const medico = await Medico.findById(id);

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: `El medico con el id: ${id} no existe`,
        errors: { message: "No existe un medico con ese id" },
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    const medicoGuardado = await medico.save();

    res.status(200).json({
      ok: true,
      usuario: medicoGuardado,
      mensaje: "Medico actualizado exitosamente",
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      mensaje: "Error al actualizar Medico",
      errors: err,
    });
  }
});

//=========================
//Crear un nuevo medico
//=========================
app.post("/", mdAuntenticacion.verificaToken, async (req, res) => {
  const body = req.body;

  const medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital,
  });

  try {
    const medicoGuardado = await medico.save();
    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      mensaje: "Error al crear medico",
      errors: err,
    });
  }
});

//=========================
//Borrar un medico por el id
//=========================

app.delete("/:id", mdAuntenticacion.verificaToken, async (req, res) => {
  const id = req.params.id;

  try {
    const medicoBorrado = await Medico.findByIdAndRemove(id);

    if (!medicoBorrado) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró un medico con el id: ${id}`,
        errors: { message: "No existe un medico con ese id" },
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado,
      mensaje: "medico eliminado exitosamente",
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
