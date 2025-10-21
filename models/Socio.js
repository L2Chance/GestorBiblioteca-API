const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Socio = sequelize.define('Socio', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    dni: { type: DataTypes.STRING, unique: true, allowNull: false },
    numeroSocio: { type: DataTypes.STRING, unique: true, allowNull: false },
    estadoSancion: { type: DataTypes.BOOLEAN, defaultValue: false },
    fechaFinSancion: { type: DataTypes.DATE, allowNull: true }
  });

  return Socio;
};
