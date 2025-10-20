const prestamoService = require('../services/prestamoService');

exports.registrarPrestamo = async (req, res) => {
    try {
        const prestamo = await prestamoService.registrarPrestamo(req.user.id, req.body.libroId);
        res.status(201).json({ message: 'Préstamo registrado con éxito.', prestamo });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.registrarDevolucion = async (req, res) => {
    try {
        const prestamo = await prestamoService.registrarDevolucion(req.params.id);
        res.status(200).json({ message: 'Devolución registrada con éxito.', prestamo });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};
