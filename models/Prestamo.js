const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Prestamo = sequelize.define('Prestamo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fechaInicio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        fechaVencimiento: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fechaDevolucion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        devuelto: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Prestamos'
    });

    return Prestamo;
};
