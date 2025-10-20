const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Prestamo = sequelize.define('Prestamo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // idLibro (FK) y idSocio (FK) se crean automáticamente por Sequelize

        fechaInicio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        fechaDevolucion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        fechaVencimiento: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'Prestamos'
    });

    return Prestamo;
};