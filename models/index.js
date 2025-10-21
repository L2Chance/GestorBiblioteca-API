const { sequelize, initializeSequelize } = require('../config/database'); 

const Libro = require('./Libro')(sequelize);
const Socio = require('./Socio')(sequelize);
const Prestamo = require('./Prestamo')(sequelize);

// Relaciones

// Socio <-> Prestamo
Socio.hasMany(Prestamo, { foreignKey: 'SocioId', as: 'prestamosRealizados' });
Prestamo.belongsTo(Socio, { foreignKey: 'SocioId', as: 'socio' });

// Libro <-> Prestamo
Libro.hasMany(Prestamo, { foreignKey: 'LibroId', as: 'prestamosAsociados' });
Prestamo.belongsTo(Libro, { foreignKey: 'LibroId', as: 'libro' });

module.exports = {
    sequelize,
    initializeSequelize,
    Libro,
    Socio,
    Prestamo
};
