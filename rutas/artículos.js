const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const ArticuloControlador = require('../controladores/artículos');

const directorioImagenes = './imagenes/articulos/';
if (!fs.existsSync(directorioImagenes)) {
  fs.mkdirSync(directorioImagenes, { recursive: true });
}

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directorioImagenes);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, 'articulo-' + Date.now() + extension);
  }
});

const subidas = multer({ storage: almacenamiento });

const procesarSubida = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return subidas.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: 'error', mensaje: err.message });
      }
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  }
  next();
};

router.get('/', ArticuloControlador.listar);
router.get('/new', ArticuloControlador.formularioNuevo);
router.post('/', procesarSubida, ArticuloControlador.crear);
router.get('/:id', ArticuloControlador.uno);
router.get('/:id/edit', ArticuloControlador.formularioEditar);
router.put('/:id', procesarSubida, ArticuloControlador.actualizar);
router.delete('/:id', ArticuloControlador.eliminar);
router.post('/subir-imagen/:id', procesarSubida, ArticuloControlador.subirImagen);
router.post('/imagen/:id', procesarSubida, ArticuloControlador.subirImagen);
router.get('/imagen/:fichero', ArticuloControlador.obtenerImagen);

module.exports = router;
