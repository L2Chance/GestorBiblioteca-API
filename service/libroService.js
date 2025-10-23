const { Libro } = require('../models');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const libroService = {
  crearLibro: async (data, file) => {
    try {
      let cover_url = null;

      if (file) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'libros'
        });
        cover_url = uploadResult.secure_url;

        // Borrar el archivo temporal subido con multer
        fs.unlinkSync(file.path);
      }

      const libro = await Libro.create({
        titulo: data.titulo,
        autor: data.autor,
        ISBN: data.ISBN,
        estado: data.estado || 'Disponible',
        cover_url
      });

      return libro;
    } catch (err) {
      throw new Error('Error al crear el libro: ' + err.message);
    }
  },

  editarLibro: async (id, data, file) => {
    try {
      const libro = await Libro.findByPk(id);
      if (!libro) throw new Error('Libro no encontrado');

      if (file) {
        if (libro.cover_url) {
          const publicId = libro.cover_url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`libros/${publicId}`);
        }

        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'libros'
        });
        data.cover_url = uploadResult.secure_url;
        fs.unlinkSync(file.path);
      }

      await libro.update(data);
      return libro;
    } catch (err) {
      throw new Error('Error al editar el libro: ' + err.message);
    }
  },

  eliminarLibro: async (id) => {
    try {
      const libro = await Libro.findByPk(id);
      if (!libro) throw new Error('Libro no encontrado');

      if (libro.cover_url) {
        const publicId = libro.cover_url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`libros/${publicId}`);
      }

      await libro.destroy();
      return true;
    } catch (err) {
      throw new Error('Error al eliminar el libro: ' + err.message);
    }
  },

  obtenerTodos: async () => {
    return await Libro.findAll();
  },

  obtenerPorId: async (id) => {
    return await Libro.findByPk(id);
  }
};

module.exports = libroService;
