const express = require('express');
const router = express.Router();
const loanController = require('../controllers/prestamoController');
const protect = require('../service/authMiddleware'); // Necesitas el middleware de protección

// Todas las rutas de préstamos requieren autenticación (el socio debe estar logueado)
router.use(protect); 

// POST /loans: Registrar un nuevo préstamo
// Corresponde a +registrarPrestamo()
router.post('/', loanController.registrarPrestamo);

// PUT /loans/:id/devolver: Registrar la devolución de un préstamo
// Corresponde a +registrarDevolucion()
router.put('/:id/devolver', loanController.registrarDevolucion);

// Puedes añadir una ruta GET /loans para obtener la lista de préstamos aquí si lo deseas.

module.exports = router;