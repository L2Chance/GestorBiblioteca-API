const express = require('express');
const prestamoService = require('../service/prestamoService');
const protect = require('../service/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// -----------------------------------------------------------
// POST /prestamos → Registrar un nuevo préstamo
// -----------------------------------------------------------
router.post('/prestamos', async (req, res) => {
  try {
    const { LibroId, SocioId, fechaVencimiento } = req.body;

    const { prestamo, actaPDF } = await prestamoService.registrarPrestamo(
      SocioId,
      LibroId,
      fechaVencimiento
    );

    res.status(201).json({ 
      message: 'Préstamo creado con éxito',
      prestamo,
      actaPDF
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});


// -----------------------------------------------------------
// PUT /prestamos/:id/devolver → Registrar devolución
// -----------------------------------------------------------
router.put('/prestamos/:id/devolver', async (req, res) => {
  try {
    const prestamoDevuelto = await prestamoService.registrarDevolucion(req.params.id);
    res.status(200).json({ message: 'Devolución registrada con éxito.', prestamo: prestamoDevuelto });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
});

// -----------------------------------------------------------
// GET /prestamos → Obtener todos los préstamos
// -----------------------------------------------------------
router.get('/prestamos', async (req, res) => {
  try {
    const prestamos = await prestamoService.obtenerTodosLosPrestamos();
    res.status(200).json(prestamos);
  } catch (error) {
    console.error('Error al obtener los préstamos:', error.message);
    res.status(500).json({ message: 'Error interno al obtener los préstamos.' });
  }
});

router.get('/prestamos/:id/acta', async (req, res) => {
    try {
        const pdfPath = await prestamoService.generarActaPrestamoExistente(req.params.id);

        // Enviar el PDF al navegador
        res.download(pdfPath, `acta_prestamo_${req.params.id}.pdf`);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// -----------------------------------------------------------
// POST /prestamos/sancionar → Sancionar socios con préstamos vencidos
// -----------------------------------------------------------
router.post('/prestamos/sancionar', async (req, res) => {
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

module.exports = router;
