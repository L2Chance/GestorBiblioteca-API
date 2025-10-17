// 1. Importa el módulo Express
const express = require('express');

// 2. Crea una instancia de la aplicación Express
const app = express();

// 3. Define el puerto a usar, usando una variable de entorno si está disponible
//    Si no hay una variable de entorno (por ejemplo, en desarrollo), usa 3000 por defecto.
const PORT = process.env.PORT || 3000;

// 4. Define una ruta (endpoint) básica
app.get('/', (req, res) => {
  // Envía un texto de respuesta al cliente
  res.send('¡Hola Mundo! Tu API de Gestor de Biblioteca está funcionando.');
});

// 5. Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('Presiona CTRL+C para detenerlo.');
});