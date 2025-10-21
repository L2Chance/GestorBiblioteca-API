const express = require('express');
const { Socio } = require('../models');
const protect = require('../service/authMiddleware');

const app = express();
app.use(express.json()); // para parsear JSON

// Middleware de autenticación (todas las rutas requieren bibliotecario)
app.use(protect);

// -----------------------------------------------------------
// POST /socios
// Registrar un nuevo socio
// -----------------------------------------------------------
// POST /socios
app.post('/socios', async (req, res) => {
    try {
        const { nombre, apellido, dni } = req.body;

        // Generar número de socio automático
        // Ejemplo: número incremental
        const count = await Socio.count();
        const numeroSocio = 1000 + count + 1; // empieza en 1001

        const nuevoSocio = await Socio.create({ nombre, apellido, dni, numeroSocio });
        res.status(201).json({ message: 'Socio registrado con éxito.', socio: nuevoSocio });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// GET /socios
// Listar todos los socios
// -----------------------------------------------------------
app.get('/socios', async (req, res) => {
    try {
        const socios = await Socio.findAll();
        res.status(200).json(socios);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error al obtener socios.' });
    }
});

// -----------------------------------------------------------
// GET /socios/:id
// Obtener un socio por ID
// -----------------------------------------------------------
app.get('/socios/:id', async (req, res) => {
    try {
        const socio = await Socio.findByPk(req.params.id);
        if (!socio) return res.status(404).json({ message: 'Socio no encontrado.' });
        res.status(200).json(socio);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error al obtener socio.' });
    }
});

// -----------------------------------------------------------
// PUT /socios/:id
// Actualizar datos de un socio
// -----------------------------------------------------------
app.put('/socios/:id', async (req, res) => {
    try {
        const socio = await Socio.findByPk(req.params.id);
        if (!socio) return res.status(404).json({ message: 'Socio no encontrado.' });

        const { nombre, apellido, dni, numeroSocio } = req.body;
        await socio.update({ nombre, apellido, dni, numeroSocio });

        res.status(200).json({ message: 'Socio actualizado con éxito.', socio });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// DELETE /socios/:id
// Eliminar un socio
// -----------------------------------------------------------
app.delete('/socios/:id', async (req, res) => {
    try {
        const socio = await Socio.findByPk(req.params.id);
        if (!socio) return res.status(404).json({ message: 'Socio no encontrado.' });

        await socio.destroy();
        res.status(200).json({ message: 'Socio eliminado con éxito.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error al eliminar socio.' });
    }
});

module.exports = app;
