const path = require('path');
const fs = require('fs');
const Articulo = require('../modelos/artículos');
const { validarArticulo } = require('../helpers/validar');

const listar = async (req, res) => {
  try {
    const articulos = await Articulo.find().sort({ fecha: -1 });
    return res.status(200).json(articulos);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      mensaje: error.message
    });
  }
};

const formularioNuevo = (req, res) => {
  if (req.accepts('html') && !req.accepts('json')) {
    return res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
  return res.status(200).json({
    status: 'success',
    mensaje: 'Formulario de creación de artículo'
  });
};

const crear = async (req, res) => {
  try {
    const datosValidados = validarArticulo(req.body);
    if (req.file) {
      datosValidados.imagen = req.file.filename;
    }
    const articulo = new Articulo(datosValidados);
    const articuloGuardado = await articulo.save();

    return res.status(201).json({
      status: 'success',
      articulo: articuloGuardado,
      post: articuloGuardado
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      status: 'error',
      mensaje: error.message
    });
  }
};

const uno = async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'Artículo no encontrado'
      });
    }

    return res.status(200).json({
      status: 'success',
      articulo,
      post: articulo
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Identificador no válido o error en la consulta'
    });
  }
};

const formularioEditar = async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'Artículo no encontrado'
      });
    }

    if (req.accepts('html') && !req.accepts('json')) {
      return res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }

    return res.status(200).json({
      status: 'success',
      articulo,
      post: articulo
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Identificador no válido'
    });
  }
};

const actualizar = async (req, res) => {
  try {
    const datosValidados = validarArticulo(req.body);
    if (req.file) {
      datosValidados.imagen = req.file.filename;
    }
    const articuloActualizado = await Articulo.findByIdAndUpdate(
      req.params.id,
      datosValidados,
      { new: true, runValidators: true }
    );

    if (!articuloActualizado) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'Artículo no encontrado para actualizar'
      });
    }

    return res.status(200).json({
      status: 'success',
      articulo: articuloActualizado,
      post: articuloActualizado
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      status: 'error',
      mensaje: error.message
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const articuloEliminado = await Articulo.findByIdAndDelete(req.params.id);
    if (!articuloEliminado) {
      return res.status(404).json({
        status: 'error',
        mensaje: 'Artículo no encontrado para eliminar'
      });
    }

    const archivoImagen = articuloEliminado.imagen || articuloEliminado.image;
    if (archivoImagen && archivoImagen !== 'default.png') {
      const rutaImagen = path.resolve('./imagenes/articulos/' + archivoImagen);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }

    return res.status(200).json({
      status: 'success',
      mensaje: 'Artículo eliminado correctamente',
      id: req.params.id
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      mensaje: error.message
    });
  }
};

const subirImagen = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Petición no incluye la imagen'
    });
  }

  const nombreArchivo = req.file.originalname;
  const extension = nombreArchivo.split('.').pop().toLowerCase();
  const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

  if (!extensionesValidas.includes(extension)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      status: 'error',
      mensaje: 'Extensión de archivo no válida'
    });
  }

  try {
    const articuloActualizado = await Articulo.findByIdAndUpdate(
      req.params.id,
      { imagen: req.file.filename },
      { new: true }
    );

    if (!articuloActualizado) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        status: 'error',
        mensaje: 'El artículo no existe'
      });
    }

    return res.status(200).json({
      status: 'success',
      articulo: articuloActualizado,
      post: articuloActualizado,
      fichero: req.file
    });
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 'error',
      mensaje: error.message
    });
  }
};

const obtenerImagen = (req, res) => {
  const fichero = req.params.fichero;
  const rutaFisica = path.resolve('./imagenes/articulos/' + fichero);

  fs.stat(rutaFisica, (error, existe) => {
    if (!error && existe) {
      return res.sendFile(rutaFisica);
    }
    return res.status(404).json({
      status: 'error',
      mensaje: 'No existe la imagen'
    });
  });
};

module.exports = {
  listar,
  formularioNuevo,
  crear,
  uno,
  formularioEditar,
  actualizar,
  eliminar,
  subirImagen,
  obtenerImagen
};
