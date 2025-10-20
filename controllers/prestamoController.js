const express = require('express');
const prestamoService = require('../services/prestamoService');
const protect = require('../service/authMiddleware'); 
const router = express.Router();

// Todas las rutas requieren que el usuario esté autenticado
router.use(protect);

// -----------------------------------------------------------
// POST /loans
// Registrar un nuevo préstamo
// -----------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const prestamo = await prestamoService.registrarPrestamo(req.user.id, req.body.libroId);
        res.status(201).json({ message: 'Préstamo registrado con éxito.', prestamo });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// PUT /loans/:id/devolver
// Registrar la devolución de un préstamo
// -----------------------------------------------------------
router.put('/:id/devolver', async (req, res) => {
    try {
        const prestamo = await prestamoService.registrarDevolucion(req.params.id);
        res.status(200).json({ message: 'Devolución registrada con éxito.', prestamo });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
});

// -----------------------------------------------------------
// POST /loans/sancionar
// Ejecutar sanción automática de usuarios con préstamos vencidos
// -----------------------------------------------------------
router.post('/sancionar', async (req, res) => {
    try {
        const usuariosSancionados = await prestamoService.sancionarUsuariosVencidos();
        res.status(200).json({
            message: 'Sanción automática ejecutada.',
            cantidadSancionados: usuariosSancionados.length,
            usuarios: usuariosSancionados.map(u => ({
                id: u.id,
                email: u.email,
                fechaFinSancion: u.fechaFinSancion
            }))
        });
    } catch (error) {
        console.error('Error al ejecutar sanción automática:', error.message);
        res.status(500).json({ message: 'Error interno al procesar sanción automática.' });
    }
});

module.exports = router;
