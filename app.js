console.log("App iniciada");

const clientId = '0b846cb7b3c3428183710075f7150cf4';
const clientSecret = 'aeb8452911f54bd78de8645f5f024492';
let token = '';

// Obtener el token de acceso desde Spotify
async function obtenerToken() {
  const respuesta = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const datos = await respuesta.json();
  token = datos.access_token;
}

// Buscar artista por nombre
async function buscarArtista() {
  const nombre = document.getElementById('artistInput').value;

  if (!token) {
    await obtenerToken();
  }

  const respuesta = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(nombre)}&type=artist`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const datos = await respuesta.json();
  const artistas = datos.artists.items;
  const resultado = document.getElementById('artistResult');

  resultado.innerHTML = '<h2>Resultados:</h2>';

  if (artistas.length === 0) {
    resultado.innerHTML += '<p>No se encontraron artistas.</p>';
    return;
  }

  artistas.forEach(a => {
    resultado.innerHTML += `
      <div onclick="verArtista('${a.id}')" style="margin-bottom: 15px; cursor: pointer;">
        <img src="${a.images[0]?.url || ''}" width="100" />
        <p><strong>${a.name}</strong></p>
      </div>
    `;
  });

  mostrarPantalla('artistScreen');
}

// Mostrar información del artista
async function verArtista(id) {
  if (!token) {
    await obtenerToken();
  }

  const respuesta = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const artista = await respuesta.json();
  const contenedor = document.getElementById('artistResult');

  contenedor.innerHTML = `
    <h2>${artista.name}</h2>
    <img src="${artista.images[0]?.url || ''}" width="150">
    <p>Popularidad: ${artista.popularity}</p>
    <p>Seguidores: ${artista.followers.total.toLocaleString()}</p>
    <h3>Álbumes:</h3>
    <div id="albumsContainer">Cargando álbumes...</div>
  `;

  mostrarPantalla('artistScreen');
  mostrarAlbums(artista.id);
}

// Mostrar los álbumes del artista
async function mostrarAlbums(id) {
  const respuesta = await fetch(`https://api.spotify.com/v1/artists/${id}/albums?limit=5`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const datos = await respuesta.json();
  const contenedor = document.getElementById('albumsContainer');

  contenedor.innerHTML = datos.items.map(album => `
    <div>
      <strong>${album.name}</strong><br>
      <img src="${album.images[0]?.url}" width="100">
    </div>
  `).join('');
}

// Mostrar la pantalla deseada
function mostrarPantalla(id) {
  document.querySelectorAll('.screen').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
