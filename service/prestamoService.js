const { Prestamo, Libro, Socio, sequelize } = require('../models');
const { Op } = require('sequelize');

const manageTransaction = (callback) => sequelize.transaction(callback);

// -----------------------------------------------------------
// Registrar un préstamo (bibliotecario indica socio y libro)
// -----------------------------------------------------------
async function registrarPrestamo(socioId, libroId) {
    return manageTransaction(async (t) => {
        const socio = await Socio.findByPk(socioId, { transaction: t });
        const libro = await Libro.findByPk(libroId, { transaction: t });

        if (!socio) throw new Error('Socio no encontrado.');
        if (!libro) throw new Error('Libro no encontrado.');

        // Levantar sanción si ya expiró
        if (socio.estadoSancion && socio.fechaFinSancion < new Date()) {
            await socio.update({ estadoSancion: false, fechaFinSancion: null }, { transaction: t });
        }

        if (socio.estadoSancion) throw new Error('Socio sancionado. No puede solicitar préstamos.');

        // Verificar si el libro ya está prestado
        const prestamoActivo = await Prestamo.findOne({
            where: { LibroId: libroId, fechaDevolucion: null },
            transaction: t
        });
        if (prestamoActivo) throw new Error('El libro ya está prestado.');

        // Calcular fechas
        const fechaInicio = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaInicio.getDate() + 15); // Préstamo por 15 días

        // Crear préstamo
        return Prestamo.create({
            SocioId: socioId,
            LibroId: libroId,
            fechaInicio,
            fechaVencimiento,
            fechaDevolucion: null
        }, { transaction: t });
    });
}

// -----------------------------------------------------------
// Registrar la devolución
// -----------------------------------------------------------
async function registrarDevolucion(prestamoId) {
    return manageTransaction(async (t) => {
        const prestamo = await Prestamo.findOne({
            where: { id: prestamoId, fechaDevolucion: null },
            transaction: t
        });
        if (!prestamo) throw new Error('Préstamo no encontrado o ya devuelto.');

        await prestamo.update({ fechaDevolucion: new Date() }, { transaction: t });
        return prestamo;
    });
}

// -----------------------------------------------------------
// Verificar préstamos vencidos
// -----------------------------------------------------------
async function verificarPrestamosVencidos() {
    const hoy = new Date();

    const prestamosVencidos = await Prestamo.findAll({
        where: {
            fechaDevolucion: null,
            fechaVencimiento: { [Op.lt]: hoy }
        },
        include: [{ model: Socio, as: 'socio' }]
    });

    return prestamosVencidos;
}

// -----------------------------------------------------------
// Sancionar usuarios automáticamente
// -----------------------------------------------------------
async function sancionarUsuariosVencidos() {
    const prestamosVencidos = await verificarPrestamosVencidos();

    if (prestamosVencidos.length === 0) return [];

    const sancionados = [];

    await manageTransaction(async (t) => {
        for (const prestamo of prestamosVencidos) {
            const socio = prestamo.socio;

            if (!socio.estadoSancion) { // Solo sancionar si no estaba sancionado
                const fechaFinSancion = new Date();
                fechaFinSancion.setDate(fechaFinSancion.getDate() + 7); // 7 días de sanción

                await socio.update({
                    estadoSancion: true,
                    fechaFinSancion
                }, { transaction: t });

                sancionados.push(socio);
            }
        }
    });

    return sancionados;
}

module.exports = {
    registrarPrestamo,
    registrarDevolucion,
    verificarPrestamosVencidos,
    sancionarUsuariosVencidos
};
