const express = require('express');
// Importa dotenv para cargar el archivo .env
require('dotenv').config(); 
const { initializeSequelize } = require('./config/database'); 
const authRoutes = require('./routes/auth');


const app = express();
const PORT = 3005;

app.use(express.json());

// Función para inicializar la DB y levantar el servidor
async function startServer() {
    await initializeSequelize();

    // 1. RUTA DE AUTENTICACIÓN
    // Todas las rutas dentro de authRoutes tendrán el prefijo /auth
    app.use('/auth', authRoutes);

    // 2. OTRAS RUTAS (Libros, Préstamos, etc.)
    app.get('/', (req, res) => {
        res.send('API de Gestión de Préstamos (Sequelize y Auth) activa.');
    });

    // Levantar el servidor Express
    app.listen(PORT, () => {
        console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    });
}

startServer();