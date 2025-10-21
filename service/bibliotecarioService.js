const { Bibliotecario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function registrarBibliotecario({ nombre, apellido, email, password }) {
    const existente = await Bibliotecario.findOne({ where: { email } });
    if (existente) throw new Error('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevo = await Bibliotecario.create({ nombre, apellido, email, password: hashedPassword });
    return { id: nuevo.id, nombre: nuevo.nombre, apellido: nuevo.apellido, email: nuevo.email };
}

async function loginBibliotecario({ email, password }) {
    const bibliotecario = await Bibliotecario.findOne({ where: { email } });
    if (!bibliotecario) throw new Error('Email o contraseña incorrectos');

    const match = await bcrypt.compare(password, bibliotecario.password);
    if (!match) throw new Error('Email o contraseña incorrectos');

    const token = jwt.sign({ id: bibliotecario.id, email: bibliotecario.email }, JWT_SECRET, { expiresIn: '1d' });
    return { bibliotecario: { id: bibliotecario.id, nombre: bibliotecario.nombre, email: bibliotecario.email }, token };
}

module.exports = { registrarBibliotecario, loginBibliotecario };
