const { Sequelize } = require('sequelize');
const path = require('path');

// Usar la variable de entorno DB_PATH si está definida (en Render)
const storagePath = process.env.DB_PATH || path.resolve(__dirname, '..', 'library.db');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
});

async function initializeSequelize() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos SQLite establecida correctamente.');

        // Sincroniza los modelos sin borrar datos
        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados con la base de datos.');
    } catch (error) {
        console.error('Error al conectar o sincronizar la base de datos:', error);
        process.exit(1);
    }
}

module.exports = { sequelize, initializeSequelize };
