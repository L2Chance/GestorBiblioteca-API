const express = require('express');
require('dotenv').config(); 
const { initializeSequelize } = require('./config/database'); 

// Controladores clásicos
const authRoutes = require('./routes/auth'); // si mantenés autenticación del bibliotecario
const sociosController = require('./controllers/sociosController');
const prestamosController = require('./controllers/prestamosController');
const bibliotecarioController = require('./controllers/bibliotecarioController');


// Función para poblar libros
const poblarLibros = require('./scripts/poblarLibros');
const { Libro, sequelize } = require('./models');

const app = express();
const PORT = 3005;

app.use(express.json());

async function startServer() {
    // 1️⃣ Inicializar DB
    await initializeSequelize();

    // 2️⃣ Asegurar que las tablas existan antes de poblar
    await sequelize.sync();

    // 3️⃣ Poblar libros si la base está vacía
    const count = await Libro.count();
    if (count === 0) {
        console.log('Base vacía, poblando libros de ejemplo...');
        await poblarLibros('fantasy', 20);
    }

    // -----------------------------------------------------------
    // Rutas de autenticación
    // -----------------------------------------------------------
    app.use('/auth', authRoutes);
    app.use('/bibliotecario', bibliotecarioController);

    // -----------------------------------------------------------
    // Rutas de socios
    // -----------------------------------------------------------
    app.use(sociosController);

    // -----------------------------------------------------------
    // Rutas de préstamos
    // -----------------------------------------------------------
    app.use(prestamosController);

    // -----------------------------------------------------------
    // Ruta base
    // -----------------------------------------------------------
    app.get('/', (req, res) => {
        res.send('API de Gestión de Préstamos (Sequelize y Auth) activa.');
    });

    // 4️⃣ Levantar servidor
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
}

startServer();
