const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importamos el modelo de Usuario y la clave secreta
const { User } = require('../models'); 
// Asegúrate de usar dotenv en index.js para que process.env funcione
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET;

// ------------------------------
// POST /auth/register
// Crea un nuevo usuario
// ------------------------------
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos requeridos.' });
    }

    try {
        // 1. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }

        // 2. Generar el hash de la contraseña (saltRounds = 10 es un buen valor por defecto)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Crear el nuevo usuario en la base de datos
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword // Guardamos el hash, no el texto plano
        });

        // 4. Generar el token (opcional, pero conveniente para el registro)
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

        // 5. Respuesta exitosa
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: { id: newUser.id, email: newUser.email, first_name: newUser.first_name },
            token 
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// ------------------------------
// POST /auth/login
// Inicia sesión y devuelve un token JWT
// ------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Encontrar al usuario por email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña ingresada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Generar el token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // 4. Respuesta exitosa
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: { id: user.id, email: user.email, first_name: user.first_name },
            token
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;