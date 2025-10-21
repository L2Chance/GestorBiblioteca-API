const express = require('express');
const { Libro } = require('../models');
const protect = require('../service/authMiddleware');

const router = express.Router();

// Todas las rutas requieren bibliotecario
router.use(protect);

// GET /libros → listar todos los libros
router.get('/libros', async (req, res) => {
  try {
    const libros = await Libro.findAll();
    res.status(200).json(libros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener libros.' });
  }
});

module.exports = router;
