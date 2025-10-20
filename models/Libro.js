const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Libro = sequelize.define('Libro', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        titulo: { // Corresponde a 'titulo'
            type: DataTypes.STRING,
            allowNull: false
        },
        autor: { // Corresponde a 'autor'
            type: DataTypes.STRING,
            allowNull: false
        },
        ISBN: { // Corresponde a 'ISBM'
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        estado: { // Corresponde a 'estado'
            type: DataTypes.ENUM('Disponible', 'Prestado', 'Baja'),
            defaultValue: 'Disponible',
            allowNull: false
        },
    });

    return Libro;
};