const express = require("express");
const app = express();

const fs = require('fs')

const path = require('path')

app.get("/:tipo/:img", (req, res, next) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    
    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}` )
    
    if(fs.existsSync( pathImagen )){
        res.sendFile(pathImagen)
    }else{
        var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`)
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;
