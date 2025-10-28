const { Prestamo, Libro, Socio, sequelize } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


const manageTransaction = (callback) => sequelize.transaction(callback);

async function registrarPrestamo(socioId, libroId, fechaVencimientoElegida) {
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

        const fechaInicio = new Date();

        // Validamos la fecha elegida
        const fechaVencimiento = new Date(fechaVencimientoElegida);
        if (isNaN(fechaVencimiento)) {
            throw new Error('La fecha de vencimiento no es válida.');
        }
        if (fechaVencimiento <= fechaInicio) {
            throw new Error('La fecha de vencimiento debe ser mayor a la fecha de inicio.');
        }

        // Crear préstamo
        const nuevoPrestamo = await Prestamo.create({
            SocioId: socioId,
            LibroId: libroId,
            fechaInicio,
            fechaVencimiento,
            fechaDevolucion: null,
            devuelto: false
        }, { transaction: t });

        // Actualizar estado del libro
        await libro.update({ estado: 'Prestado' }, { transaction: t });

        // Generar acta PDF
        await nuevoPrestamo.reload({
            include: [
                { model: Libro, as: 'libro' },
                { model: Socio, as: 'socio' }
            ],
            transaction: t
        });

        const rutaPDF = generarActaPrestamo(nuevoPrestamo);

        return { prestamo: nuevoPrestamo, actaPDF: rutaPDF };
    });
}

async function registrarDevolucion(prestamoId) {
    return manageTransaction(async (t) => {
        const prestamo = await Prestamo.findOne({
            where: { id: prestamoId, devuelto: false },
            include: [
                { model: Libro, as: 'libro' }
            ],
            transaction: t
        });
        if (!prestamo) throw new Error('Préstamo no encontrado o ya devuelto.');

        await prestamo.update({ 
            fechaDevolucion: new Date(),
            devuelto: true 
        }, { transaction: t });

        if (prestamo.libro) {
            await prestamo.libro.update({ estado: 'Disponible' }, { transaction: t });
        }

        return prestamo;
    });
}


async function generarActaPrestamoExistente(prestamoId) {
  const prestamo = await Prestamo.findByPk(prestamoId, {
    include: [
      { model: Libro, as: 'libro' },
      { model: Socio, as: 'socio' }
    ]
  });

  if (!prestamo) throw new Error('Préstamo no encontrado.');

  const folder = path.join(__dirname, '../actas');
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const pdfPath = path.join(folder, `acta_prestamo_${prestamo.id}.pdf`);
  const doc = new PDFDocument({ margin: 50 });

  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // ------------------- Encabezado -------------------
  doc
    .fontSize(22)
    .fillColor('#1F2937')
    .text('Biblioteca Lecturopolis', { align: 'center' });

  doc.moveDown(0.5);
  doc
    .fontSize(18)
    .fillColor('#0D9488')
    .text('Acta de Préstamo de Libro', { align: 'center' });

  doc.moveDown();
  doc.strokeColor('#0D9488').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // ------------------- Datos del Socio -------------------
  doc
    .fontSize(14)
    .fillColor('#111827')
    .text('Datos del Socio', { underline: true });
  doc.moveDown(0.3);

  doc.fontSize(12);
  doc.text(`Nombre: ${prestamo.socio.nombre} ${prestamo.socio.apellido}`);
  doc.text(`Número de socio: ${prestamo.socio.numeroSocio}`);
  doc.text(`DNI: ${prestamo.socio.dni || 'N/A'}`);
  doc.moveDown();

  // ------------------- Datos del Libro -------------------
  doc
    .fontSize(14)
    .fillColor('#111827')
    .text('Datos del Libro', { underline: true });
  doc.moveDown(0.3);

  doc.fontSize(12);
  doc.text(`Título: ${prestamo.libro.titulo}`);
  doc.text(`Autor: ${prestamo.libro.autor}`);
  doc.text(`ISBN: ${prestamo.libro.isbn || 'N/A'}`);
  doc.moveDown();

  // ------------------- Fechas -------------------
  doc
    .fontSize(14)
    .fillColor('#111827')
    .text('Fechas del Préstamo', { underline: true });
  doc.moveDown(0.3);

  doc.fontSize(12);
  doc.text(`Fecha de inicio: ${prestamo.fechaInicio.toLocaleDateString()}`);
  doc.text(`Fecha de vencimiento: ${prestamo.fechaVencimiento.toLocaleDateString()}`);
  if (prestamo.fechaDevolucion) {
    doc.text(`Fecha de devolución: ${prestamo.fechaDevolucion.toLocaleDateString()}`);
  }
  doc.moveDown();

  // ------------------- Mensaje final -------------------
  doc
    .fontSize(12)
    .fillColor('#064E3B')
    .text('El socio se compromete a devolver el libro en la fecha establecida, cuidando su integridad y estado.', { align: 'justify' });

  doc.moveDown(2);

  // ------------------- Pie de página -------------------
  doc
    .fontSize(10)
    .fillColor('#6B7280')
    .text(`Generado automáticamente por el sistema Lecturopolis | Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });

  doc.end();

  // ✅ Esperar hasta que el archivo termine de escribirse
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return pdfPath;
}

async function obtenerTodosLosPrestamos() {
    return await Prestamo.findAll({
        include: [
            { model: Libro, as: 'libro', attributes: ['titulo', 'autor', 'estado'] },
            { model: Socio, as: 'socio', attributes: ['nombre', 'apellido', 'numeroSocio'] }
        ],
        attributes: ['id', 'fechaInicio', 'fechaVencimiento', 'fechaDevolucion', 'devuelto', 'LibroId', 'SocioId'],
        order: [['fechaInicio', 'DESC']]
    });
}

function generarActaPrestamo(prestamo) {
    const folder = path.join(__dirname, '../actas');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const pdfPath = path.join(folder, `acta_prestamo_${prestamo.id}.pdf`);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text('Acta de Préstamo de Libro', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Socio: ${prestamo.socio.nombre} ${prestamo.socio.apellido}`);
    doc.text(`Número de socio: ${prestamo.socio.numeroSocio}`);
    doc.text(`Libro: ${prestamo.libro.titulo} - ${prestamo.libro.autor}`);
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
