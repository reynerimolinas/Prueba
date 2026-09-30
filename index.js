require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { conexion } = require('./basedatos/conexión');
const rutasArticulos = require('./rutas/artículos');

const app = express();
const PORT = process.env.PORT || 3001;

conexion();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

app.use('/posts', rutasArticulos);
app.use('/articulos', rutasArticulos);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
