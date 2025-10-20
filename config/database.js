const { Sequelize } = require('sequelize');
const path = require('path');

// 1. Configuración de la conexión Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', 'library.db'), // Ruta al archivo de DB
    logging: false // Deshabilita la impresión de las consultas SQL en la consola
});

// 2. Función de autenticación y sincronización
async function initializeSequelize() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos SQLite establecida correctamente.');

        // Sincroniza todos los modelos con la base de datos
        // { force: true } eliminará las tablas existentes y las recreará (usar con precaución!)
        // { alter: true } intenta hacer los cambios sin perder datos.
        await sequelize.sync({ alter: true }); 
        console.log('Modelos sincronizados con la base de datos.');

    } catch (error) {
        console.error('Error al conectar o sincronizar la base de datos:', error);
        process.exit(1); // Sale de la aplicación si hay un error crítico
    }
}

module.exports = { sequelize, initializeSequelize };