//Require
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


//Variables
const app = express()
const port = 3000


//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// Importar rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');



//Conexion a la base de datos

mongoose.connect('mongodb://127.0.0.1:27017/hospitalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexión a la base de datos establecida');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });



//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


//Escuchando peticiones: puerto
app.listen(port, () => {
  console.log(`Corriendo en el puerto: ${port}`)
})















// // Requires
// var express = require("express");
// var mongoose = require("mongoose");

// //inicializar variables
// var app = express();


// //Conexion a la base de datos
// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
//   if (err) {
//     console.log('Error al conectar a la base de datos:', err);
//   } else {
//     console.log('Base de datos: online');
//   }
// });


// //rutas
// app.get('/', (req, res, next)=>{

//     res.status(200).json({
//         ok: true,
//         mensaje: 'Peticion realizada correctamente'
//     })
// })


// //Escuchar peticiones
// app.listen(3000, ()=>{
//     console.log("Express server puerto 3000: \x1b[32m%s\x1b[0m","online")
// })

// const express = require('express');
// const mongoose = require('mongoose');

// const app = express();

// // Conexión a la base de datos
// mongoose.connect('mongodb://localhost:27017/hospitalDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => {
//     console.log('Base de datos: online');
//     // Configuración adicional y rutas
//     // ...

//     // Iniciar el servidor
//     app.listen(3000, () => {
//       console.log('Servidor en ejecución en el puerto 3000');
//     });
//   })
//   .catch((err) => {
//     console.error('Error al conectar a la base de datos:', err);
//   });


