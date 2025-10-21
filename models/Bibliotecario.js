const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bibliotecario = sequelize.define('Bibliotecario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }
  });

  return Bibliotecario;
};
