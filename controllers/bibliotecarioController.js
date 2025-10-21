const express = require('express');
const router = express.Router();
const bibliotecarioService = require('../service/bibliotecarioService');

// -----------------------------------------------------------
// POST /bibliotecario/register
// Registrar un nuevo bibliotecario
// -----------------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        const bibliotecario = await bibliotecarioService.registrarBibliotecario(req.body);
        res.status(201).json({ message: 'Bibliotecario registrado con éxito', bibliotecario });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// POST /bibliotecario/login
// Login de bibliotecario
// -----------------------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const data = await bibliotecarioService.loginBibliotecario(req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
