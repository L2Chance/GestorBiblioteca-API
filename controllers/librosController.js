const express = require('express');
const multer = require('multer');
const protect = require('../service/authMiddleware');
const libroService = require('../service/libroService');

const router = express.Router();
const upload = multer({ dest: 'tmp/' });

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const libros = await libroService.obtenerTodos();
    res.status(200).json(libros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener libros.' });
  }
});

router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const libro = await libroService.crearLibro(req.body, req.file);
    res.status(201).json(libro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', upload.single('cover'), async (req, res) => {
  try {
    const libro = await libroService.editarLibro(req.params.id, req.body, req.file);
    res.status(200).json(libro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await libroService.eliminarLibro(req.params.id);
    res.status(200).json({ message: 'Libro eliminado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
