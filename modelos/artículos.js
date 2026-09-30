const mongoose = require('mongoose');

const ArticuloSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  contenido: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    default: 'default.png'
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

ArticuloSchema.virtual('title').get(function() {
  return this.titulo;
});

ArticuloSchema.virtual('content').get(function() {
  return this.contenido;
});

ArticuloSchema.virtual('image').get(function() {
  return this.imagen;
});

ArticuloSchema.virtual('createdAt').get(function() {
  return this.fecha;
});

ArticuloSchema.set('toJSON', { virtuals: true });
ArticuloSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Articulo', ArticuloSchema);
