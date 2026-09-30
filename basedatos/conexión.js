const mongoose = require('mongoose');

const conexion = async () => {
  try {
    const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prueba2';
    await mongoose.connect(url);
    console.log('Conectado a la base de datos prueba2');
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  conexion
};
