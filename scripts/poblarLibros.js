const axios = require('axios');
const { Libro } = require('../models');

async function poblarLibros(busqueda = 'fantasy', cantidad = 10) {
  try {
    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(busqueda)}&language=spa&limit=${cantidad}`
    );

    const libros = response.data.docs;

    for (const item of libros) {
      const titulo = item.title || 'Sin título';
      const autor = item.author_name ? item.author_name[0] : 'Desconocido';
      const isbn = item.isbn ? item.isbn[0] : null;
      const estado = 'Disponible';

      // 🧠 Determinar la mejor URL de cover disponible
      let cover_url = null;
      if (item.cover_i) {
        cover_url = `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`;
      } else if (isbn) {
        cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
      }

      // Evitar duplicados usando ISBN si lo hay, si no, usar título como fallback
      await Libro.findOrCreate({
        where: isbn ? { ISBN: isbn } : { titulo },
        defaults: { titulo, autor, estado, cover_url, ISBN: isbn || `NO-ISBN-${Math.random()}` }
      });
    }

    console.log(`✅ Se poblaron ${libros.length} libros en la base de datos.`);
  } catch (error) {
    console.error('❌ Error al poblar libros:', error.message);
  }
}

module.exports = poblarLibros;

