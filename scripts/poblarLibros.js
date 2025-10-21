const axios = require('axios');
const { Libro } = require('../models');

async function poblarLibros(busqueda = 'fantasy', cantidad = 10) {
    try {
        // 1. Hacer request a Open Library
        const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(busqueda)}&limit=${cantidad}`);
        const libros = response.data.docs;

        // 2. Mapear datos a nuestro modelo y evitar duplicados
        for (const item of libros) {
            const titulo = item.title || 'Sin título';
            const autor = item.author_name ? item.author_name[0] : 'Desconocido';
            const isbn = item.isbn ? item.isbn[0] : `ISBN-${Math.random()}`;
            const estado = 'Disponible';

            // Evitar duplicados usando ISBN
            await Libro.findOrCreate({
                where: { ISBN: isbn },
                defaults: { titulo, autor, estado }
            });
        }

        console.log(`Se poblaron ${libros.length} libros en la base de datos.`);
    } catch (error) {
        console.error('Error al poblar libros:', error.message);
    }
}

module.exports = poblarLibros;
