const { Prestamo, Libro, Socio, sequelize } = require('../models');
const { Op } = require('sequelize');

const manageTransaction = (callback) => sequelize.transaction(callback);

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
        fechaVencimiento.setDate(fechaInicio.getDate() + 15);

        // Crear préstamo
        const nuevoPrestamo = await Prestamo.create({
        SocioId: socioId,
        LibroId: libroId,
        fechaInicio,
        fechaVencimiento,
        fechaDevolucion: null,
        devuelto: false
    }, { transaction: t });

        // Actualizar estado del libro a Prestado
        await libro.update({ estado: 'Prestado' }, { transaction: t });

        // Generar acta PDF
        await nuevoPrestamo.reload({ include: [Libro, Socio], transaction: t }); // incluir datos necesarios
        const rutaPDF = generarActaPrestamo(nuevoPrestamo);

        
        return { prestamo: nuevoPrestamo, actaPDF: rutaPDF };
    });
}

async function registrarDevolucion(prestamoId) {
    return manageTransaction(async (t) => {
        const prestamo = await Prestamo.findOne({
            where: { id: prestamoId, devuelto: false },
            include: [Libro],
            transaction: t
        });
        if (!prestamo) throw new Error('Préstamo no encontrado o ya devuelto.');

        await prestamo.update({ 
            fechaDevolucion: new Date(),
            devuelto: true 
        }, { transaction: t });

        if (prestamo.Libro) {
            await prestamo.Libro.update({ estado: 'Disponible' }, { transaction: t });
        }

        return prestamo;
    });
}

async function generarActaPrestamoExistente(prestamoId) {
    // Buscar el préstamo con sus relaciones
    const prestamo = await Prestamo.findByPk(prestamoId, { include: [Libro, Socio] });
    if (!prestamo) throw new Error('Préstamo no encontrado.');

    // Asegurarnos de que exista la carpeta de actas
    const folder = path.join(__dirname, '../actas');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const pdfPath = path.join(folder, `acta_prestamo_${prestamo.id}.pdf`);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text('Acta de Préstamo de Libro', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Socio: ${prestamo.Socio.nombre} ${prestamo.Socio.apellido}`);
    doc.text(`Número de socio: ${prestamo.Socio.numeroSocio}`);
    doc.text(`Libro: ${prestamo.Libro.titulo} - ${prestamo.Libro.autor}`);
    doc.text(`Fecha de inicio: ${prestamo.fechaInicio.toLocaleDateString()}`);
    doc.text(`Fecha de vencimiento: ${prestamo.fechaVencimiento.toLocaleDateString()}`);
    if (prestamo.fechaDevolucion) {
        doc.text(`Fecha de devolución: ${prestamo.fechaDevolucion.toLocaleDateString()}`);
    }
    doc.moveDown();
    doc.text('El socio se compromete a devolver el libro en la fecha establecida.', { align: 'justify' });

    doc.end();

    return pdfPath;
}


async function obtenerTodosLosPrestamos() {
  return await Prestamo.findAll({
    include: [
      { model: Libro, attributes: ['titulo', 'autor', 'estado'] },
      { model: Socio, attributes: ['nombre', 'apellido', 'numeroSocio'] }
    ],
    attributes: ['id', 'fechaInicio', 'fechaVencimiento', 'fechaDevolucion', 'devuelto', 'LibroId', 'SocioId'],
    order: [['fechaInicio', 'DESC']]
  });
}

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generarActaPrestamo(prestamo) {
    // Asegurarnos de que exista la carpeta de actas
    const folder = path.join(__dirname, '../actas');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const pdfPath = path.join(folder, `acta_prestamo_${prestamo.id}.pdf`);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text('Acta de Préstamo de Libro', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Socio: ${prestamo.Socio.nombre} ${prestamo.Socio.apellido}`);
    doc.text(`Número de socio: ${prestamo.Socio.numeroSocio}`);
    doc.text(`Libro: ${prestamo.Libro.titulo} - ${prestamo.Libro.autor}`);
    doc.text(`Fecha de inicio: ${prestamo.fechaInicio.toLocaleDateString()}`);
    doc.text(`Fecha de vencimiento: ${prestamo.fechaVencimiento.toLocaleDateString()}`);
    doc.moveDown();
    doc.text('El socio se compromete a devolver el libro en la fecha establecida.', { align: 'justify' });

    doc.end();

    return pdfPath;
}


module.exports = {
    registrarPrestamo,
    registrarDevolucion,
    obtenerTodosLosPrestamos,
    generarActaPrestamoExistente
};
