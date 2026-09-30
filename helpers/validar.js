const validarArticulo = (parametros) => {
  const titulo = parametros.titulo || parametros.title;
  const contenido = parametros.contenido || parametros.content;

  const validar_titulo = typeof titulo === 'string' && titulo.trim().length > 0;
  const validar_contenido = typeof contenido === 'string' && contenido.trim().length > 0;

  if (!validar_titulo || !validar_contenido) {
    throw new Error('El título y el contenido son obligatorios');
  }

  return {
    titulo: titulo.trim(),
    contenido: contenido.trim()
  };
};

module.exports = {
  validarArticulo
};
