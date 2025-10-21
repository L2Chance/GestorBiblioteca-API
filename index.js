const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { initializeSequelize } = require('./config/database'); 

// Controladores clásicos
const authRoutes = require('./routes/auth'); 
const sociosController = require('./controllers/sociosController');
const prestamosController = require('./controllers/prestamosController');
const bibliotecarioController = require('./controllers/bibliotecarioController');
const libroController = require('./controllers/librosController');

// Función para poblar libros
const poblarLibros = require('./scripts/poblarLibros');
const { Libro, sequelize } = require('./models');

const app = express();
const PORT = 3005;

// 🔹 Middleware CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

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
    // Rutas
    // -----------------------------------------------------------
    app.use('/auth', authRoutes);
    app.use('/bibliotecario', bibliotecarioController);
    app.use(sociosController);
    app.use(prestamosController);
    app.use('/libros', libroController);

    app.get('/', (req, res) => {
        res.send('API de Gestión de Préstamos (Sequelize y Auth) activa.');
    });

    // 4️⃣ Levantar servidor
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
}

startServer();
