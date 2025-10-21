const express = require('express');
const prestamoService = require('../service/prestamoService');
const protect = require('../service/authMiddleware'); 

const router = express.Router(); 
router.use(protect); 

router.post('/prestamos', async (req, res) => {
  try {
    const { LibroId, SocioId } = req.body;
    const prestamo = await prestamoService.registrarPrestamo(SocioId, LibroId);
    res.status(201).json({ message: 'Préstamo creado con éxito', prestamo });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PUT /prestamos/:id/devolver → registrar devolución
router.put('/prestamos/:id/devolver', async (req, res) => {
  try {
    const prestamo = await prestamoService.registrarDevolucion(req.params.id);
    res.status(200).json({ message: 'Devolución registrada con éxito.', prestamo });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
});

// POST /prestamos/sancionar → sanción automática
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

module.exports = router; // 👈 exportamos router
