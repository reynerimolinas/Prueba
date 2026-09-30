const API_URL = '/posts';

const views = {
  list: document.getElementById('view-list'),
  show: document.getElementById('view-show'),
  new: document.getElementById('view-new'),
  edit: document.getElementById('view-edit')
};

const postsGrid = document.getElementById('posts-grid');
const emptyState = document.getElementById('empty-state');
const loadingSpinner = document.getElementById('loading-spinner');
const postsCountEl = document.getElementById('posts-count');
const toastEl = document.getElementById('toast');

let currentPost = null;
let newImageFile = null;
let editImageFile = null;

function showToast(message, type = 'success') {
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type}`;
  setTimeout(() => {
    toastEl.className = 'toast hidden';
  }, 3500);
}

function showView(viewName) {
  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.remove('hidden');
    } else {
      views[key].classList.add('hidden');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDate(dateStr) {
  if (!dateStr) return 'Reciente';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatFullDate(dateStr) {
  if (!dateStr) return 'Fecha no disponible';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function cargarPosts() {
  loadingSpinner.classList.remove('hidden');
  postsGrid.innerHTML = '';
  emptyState.classList.add('hidden');

  try {
    const res = await fetch(API_URL, {
      headers: { 'Accept': 'application/json' }
    });
    const posts = await res.json();
    loadingSpinner.classList.add('hidden');

    postsCountEl.textContent = posts.length;

    if (!Array.isArray(posts) || posts.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'post-card';
      const titulo = post.titulo || post.title || 'Sin título';
      const contenido = post.contenido || post.content || '';
      const imagen = post.imagen || post.image;
      const fecha = post.fecha || post.createdAt;
      const excerpt = contenido.length > 140 ? contenido.substring(0, 140) + '...' : contenido;
      const tieneImagen = imagen && imagen !== 'default.png';
      const imagenSrc = tieneImagen ? `${API_URL}/imagen/${imagen}` : null;

      card.innerHTML = `
        ${tieneImagen ? `
          <div class="card-image-box" data-id="${post._id}">
            <img src="${imagenSrc}" alt="${escapeHTML(titulo)}" class="card-image" loading="lazy">
          </div>
        ` : ''}
        <div class="card-inner">
          <div class="card-header">
            <div class="post-meta">
              <span class="meta-tag">Artículo</span>
              <span class="meta-date">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ${formatDate(fecha)}
              </span>
            </div>
            <h2 class="card-title" data-id="${post._id}">${escapeHTML(titulo)}</h2>
          </div>
          <div class="card-body">
            <p class="card-excerpt">${escapeHTML(excerpt)}</p>
          </div>
          <div class="card-footer">
            <button class="read-more-btn" data-id="${post._id}">
              Leer artículo
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <div class="card-quick-actions">
              <button class="btn-icon btn-edit-quick" data-id="${post._id}" title="Editar">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger btn-delete-quick" data-id="${post._id}" title="Eliminar">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      postsGrid.appendChild(card);
    });

    attachGridEvents();
  } catch (error) {
    loadingSpinner.classList.add('hidden');
    showToast('Error al cargar artículos', 'error');
  }
}

function attachGridEvents() {
  document.querySelectorAll('.card-title, .read-more-btn, .card-image-box').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-id');
      verPost(id);
    });
  });

  document.querySelectorAll('.btn-edit-quick').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      abrirEditor(id);
    });
  });

  document.querySelectorAll('.btn-delete-quick').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      confirmarEliminar(id);
    });
  });
}

async function verPost(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    const articulo = data.articulo || data.post;
    if (!res.ok || !articulo) {
      showToast(data.mensaje || 'Error al cargar el artículo', 'error');
      return;
    }

    currentPost = articulo;
    const titulo = currentPost.titulo || currentPost.title;
    const contenido = currentPost.contenido || currentPost.content;
    const imagen = currentPost.imagen || currentPost.image;
    const fecha = currentPost.fecha || currentPost.createdAt;

    document.getElementById('show-post-title').textContent = titulo;
    document.getElementById('show-post-date').textContent = formatFullDate(fecha);

    const imageContainer = document.getElementById('show-post-image-container');
    const imageEl = document.getElementById('show-post-image');
    if (imagen && imagen !== 'default.png') {
      imageEl.src = `${API_URL}/imagen/${imagen}`;
      imageContainer.classList.remove('hidden');
    } else {
      imageContainer.classList.add('hidden');
      imageEl.src = '';
    }

    const contentContainer = document.getElementById('show-post-content');
    contentContainer.innerHTML = '';
    const paragraphs = contenido.split('\n').filter(p => p.trim() !== '');
    paragraphs.forEach(p => {
      const pEl = document.createElement('p');
      pEl.textContent = p;
      contentContainer.appendChild(pEl);
    });

    showView('show');
  } catch (error) {
    showToast('Error al abrir la publicación', 'error');
  }
}

async function abrirEditor(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/edit`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    const articulo = data.articulo || data.post;
    if (!res.ok || !articulo) {
      showToast(data.mensaje || 'Error al cargar los datos', 'error');
      return;
    }

    currentPost = articulo;
    editImageFile = null;
    const titulo = currentPost.titulo || currentPost.title;
    const contenido = currentPost.contenido || currentPost.content;
    const imagen = currentPost.imagen || currentPost.image;

    document.getElementById('edit-id').value = currentPost._id;
    document.getElementById('edit-title').value = titulo;
    document.getElementById('edit-content').value = contenido;
    document.getElementById('edit-error-box').classList.add('hidden');
    document.getElementById('edit-image').value = '';

    const previewWrapper = document.getElementById('edit-image-preview');
    const previewImg = document.getElementById('edit-preview-img');
    const labelText = document.getElementById('edit-image-text');

    if (imagen && imagen !== 'default.png') {
      previewImg.src = `${API_URL}/imagen/${imagen}`;
      previewWrapper.classList.remove('hidden');
      labelText.textContent = 'Haz clic para cambiar la imagen actual';
    } else {
      previewWrapper.classList.add('hidden');
      previewImg.src = '';
      labelText.textContent = 'Haz clic para seleccionar una imagen';
    }

    actualizarContador('edit-title', 'edit-title-counter', 150);
    actualizarContadorPalabras('edit-content', 'edit-content-counter');

    showView('edit');
  } catch (error) {
    showToast('Error al preparar el editor', 'error');
  }
}

async function confirmarEliminar(id) {
  const seguro = confirm('¿Deseas eliminar este artículo de la base de datos?');
  if (!seguro) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Artículo eliminado correctamente', 'success');
      cargarPosts();
      showView('list');
    } else {
      showToast(data.mensaje || 'Error al eliminar', 'error');
    }
  } catch (error) {
    showToast('Error de conexión al eliminar', 'error');
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function actualizarContador(inputId, counterId, max) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (!input || !counter) return;
  const len = input.value.length;
  counter.textContent = `${len}/${max}`;
  counter.style.color = len > max - 10 ? '#ef4444' : '';
}

function actualizarContadorPalabras(textareaId, counterId) {
  const textarea = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!textarea || !counter) return;
  const text = textarea.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  counter.textContent = `${words} ${words === 1 ? 'palabra' : 'palabras'}`;
}

document.addEventListener('DOMContentLoaded', () => {
  cargarPosts();

  document.getElementById('nav-brand').addEventListener('click', (e) => {
    e.preventDefault();
    cargarPosts();
    showView('list');
  });

  document.getElementById('btn-nav-list').addEventListener('click', () => {
    cargarPosts();
    showView('list');
  });

  const abrirFormularioCrear = () => {
    document.getElementById('form-new-post').reset();
    document.getElementById('new-error-box').classList.add('hidden');
    document.getElementById('new-image-preview').classList.add('hidden');
    document.getElementById('new-image-text').textContent = 'Haz clic para seleccionar o arrastra una imagen';
    newImageFile = null;
    actualizarContador('new-title', 'new-title-counter', 150);
    actualizarContadorPalabras('new-content', 'new-content-counter');
    showView('new');
  };

  document.getElementById('btn-nav-new').addEventListener('click', abrirFormularioCrear);
  document.getElementById('btn-hero-new').addEventListener('click', abrirFormularioCrear);
  document.getElementById('btn-empty-new').addEventListener('click', abrirFormularioCrear);
  document.getElementById('btn-show-another').addEventListener('click', abrirFormularioCrear);

  document.getElementById('btn-back-to-list').addEventListener('click', () => {
    cargarPosts();
    showView('list');
  });

  document.getElementById('btn-cancel-new').addEventListener('click', () => {
    showView('list');
  });

  document.getElementById('btn-new-discard').addEventListener('click', () => {
    showView('list');
  });

  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    if (currentPost) {
      verPost(currentPost._id);
    } else {
      showView('list');
    }
  });

  document.getElementById('btn-edit-discard').addEventListener('click', () => {
    if (currentPost) {
      verPost(currentPost._id);
    } else {
      showView('list');
    }
  });

  document.getElementById('btn-show-edit').addEventListener('click', () => {
    if (currentPost) {
      abrirEditor(currentPost._id);
    }
  });

  document.getElementById('btn-show-delete').addEventListener('click', () => {
    if (currentPost) {
      confirmarEliminar(currentPost._id);
    }
  });

  document.getElementById('new-title').addEventListener('input', () => {
    actualizarContador('new-title', 'new-title-counter', 150);
  });

  document.getElementById('new-content').addEventListener('input', () => {
    actualizarContadorPalabras('new-content', 'new-content-counter');
  });

  document.getElementById('edit-title').addEventListener('input', () => {
    actualizarContador('edit-title', 'edit-title-counter', 150);
  });

  document.getElementById('edit-content').addEventListener('input', () => {
    actualizarContadorPalabras('edit-content', 'edit-content-counter');
  });

  document.getElementById('new-image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    newImageFile = file;
    document.getElementById('new-image-text').textContent = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('new-preview-img').src = event.target.result;
      document.getElementById('new-image-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-remove-new-image').addEventListener('click', () => {
    newImageFile = null;
    document.getElementById('new-image').value = '';
    document.getElementById('new-image-preview').classList.add('hidden');
    document.getElementById('new-image-text').textContent = 'Haz clic para seleccionar o arrastra una imagen';
  });

  document.getElementById('edit-image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    editImageFile = file;
    document.getElementById('edit-image-text').textContent = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('edit-preview-img').src = event.target.result;
      document.getElementById('edit-image-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-remove-edit-image').addEventListener('click', () => {
    editImageFile = null;
    document.getElementById('edit-image').value = '';
    document.getElementById('edit-image-preview').classList.add('hidden');
    document.getElementById('edit-image-text').textContent = 'Haz clic para cambiar la imagen actual';
  });

  document.getElementById('form-new-post').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const content = document.getElementById('new-content').value.trim();
    const errorBox = document.getElementById('new-error-box');

    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('contenido', content);
    formData.append('title', title);
    formData.append('content', content);
    if (newImageFile) {
      formData.append('file0', newImageFile);
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      const data = await res.json();
      const articulo = data.articulo || data.post;

      if (res.ok && articulo) {
        showToast('Artículo publicado exitosamente', 'success');
        currentPost = articulo;
        verPost(articulo._id);
      } else {
        errorBox.textContent = data.mensaje || 'Error al guardar el artículo';
        errorBox.classList.remove('hidden');
      }
    } catch (err) {
      errorBox.textContent = 'Error de conexión con el servidor';
      errorBox.classList.remove('hidden');
    }
  });

  document.getElementById('form-edit-post').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value.trim();
    const content = document.getElementById('edit-content').value.trim();
    const errorBox = document.getElementById('edit-error-box');

    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('contenido', content);
    formData.append('title', title);
    formData.append('content', content);
    if (editImageFile) {
      formData.append('file0', editImageFile);
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      const data = await res.json();
      const articulo = data.articulo || data.post;

      if (res.ok && articulo) {
        showToast('Artículo actualizado correctamente', 'success');
        currentPost = articulo;
        verPost(articulo._id);
      } else {
        errorBox.textContent = data.mensaje || 'Error al actualizar el artículo';
        errorBox.classList.remove('hidden');
      }
    } catch (err) {
      errorBox.textContent = 'Error de conexión con el servidor';
      errorBox.classList.remove('hidden');
    }
  });
});
