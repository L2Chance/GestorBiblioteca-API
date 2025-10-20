const { Prestamo, Libro, User, sequelize } = require('../models');

const manageTransaction = (callback) => sequelize.transaction(callback);

async function registrarPrestamo(socioId, libroId) {
    return manageTransaction(async (t) => {
        const socio = await User.findByPk(socioId, { transaction: t });
        const libro = await Libro.findByPk(libroId, { transaction: t });

        if (!socio || socio.estadoSancion) throw new Error('Socio sancionado o no encontrado.');
        if (!libro) throw new Error('Libro no encontrado.');

        const prestamoActivo = await Prestamo.findOne({
            where: { LibroId: libroId, fechaDevolucion: null },
            transaction: t
        });
        if (prestamoActivo) throw new Error('El libro ya está prestado.');

        return Prestamo.create({
            SocioId: socioId,
            LibroId: libroId,
            fechaInicio: new Date(),
            fechaDevolucion: null
        }, { transaction: t });
    });
}

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

module.exports = { registrarPrestamo, registrarDevolucion };
