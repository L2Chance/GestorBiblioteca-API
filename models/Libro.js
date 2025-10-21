const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Libro = sequelize.define('Libro', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        autor: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ISBN: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        estado: {
            type: DataTypes.ENUM('Disponible', 'Prestado', 'Baja'),
            defaultValue: 'Disponible',
            allowNull: false
        },
        cover_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Libro;
};
