const express = require('express');
const prestamoService = require('../services/prestamoService');
const protect = require('../service/authMiddleware'); // middleware del bibliotecario

const app = express();
app.use(express.json()); // para parsear JSON

// Middleware de autenticación (todas las rutas requieren bibliotecario)
app.use(protect);

// -----------------------------------------------------------
// POST /prestamos
// Registrar un nuevo préstamo
// -----------------------------------------------------------
app.post('/prestamos', async (req, res) => {
    try {
        const { socioId, libroId } = req.body;
        const prestamo = await prestamoService.registrarPrestamo(socioId, libroId);
        res.status(201).json({ message: 'Préstamo registrado con éxito.', prestamo });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// PUT /prestamos/:id/devolver
// Registrar la devolución de un préstamo
// -----------------------------------------------------------
app.put('/prestamos/:id/devolver', async (req, res) => {
    try {
        const prestamo = await prestamoService.registrarDevolucion(req.params.id);
        res.status(200).json({ message: 'Devolución registrada con éxito.', prestamo });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// POST /prestamos/sancionar
// Ejecutar sanción automática de usuarios con préstamos vencidos
// -----------------------------------------------------------
app.post('/prestamos/sancionar', async (req, res) => {
    try {
        const sociosSancionados = await prestamoService.sancionarUsuariosVencidos();
        res.status(200).json({
            message: 'Sanción automática ejecutada.',
            cantidadSancionados: sociosSancionados.length,
            socios: sociosSancionados.map(s => ({
                id: s.id,
                nombre: s.nombre,
                apellido: s.apellido,
                numeroSocio: s.numeroSocio,
                fechaFinSancion: s.fechaFinSancion
            }))
        });
    } catch (error) {
        console.error('Error al ejecutar sanción automática:', error.message);
        res.status(500).json({ message: 'Error interno al procesar sanción automática.' });
    }
});

module.exports = app;
