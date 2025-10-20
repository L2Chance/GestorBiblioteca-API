// models/index.js

const { sequelize, initializeSequelize } = require('../config/database'); 

// 1. Importar e inicializar los tres modelos
const Libro = require('./Libro')(sequelize);
const User = require('./User')(sequelize); // Tu Socio
const Prestamo = require('./Prestamo')(sequelize); // El nuevo modelo

// 2. Definición de las Relaciones (Asociaciones)
// Relación Socio (User) <-> Prestamo: (1) Socio puede realizar (*) Prestamos
User.hasMany(Prestamo, { foreignKey: 'SocioId', as: 'prestamosRealizados' });
Prestamo.belongsTo(User, { foreignKey: 'SocioId', as: 'socio' }); 

// Relación Libro <-> Prestamo: (1) Libro forma parte de (*) Prestamos
Libro.hasMany(Prestamo, { foreignKey: 'LibroId', as: 'prestamosAsociados' });
Prestamo.belongsTo(Libro, { foreignKey: 'LibroId', as: 'libro' }); 

// 3. Exportar
module.exports = {
    sequelize,
    initializeSequelize,
    Libro,
    User,
    Prestamo // Exportamos el nuevo modelo
};