require('dotenv').config();
const bcrypt = require('bcrypt');
const { Bibliotecario } = require('../models');

async function poblarBibliotecario() {
  try {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const [admin, created] = await Bibliotecario.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL },
      defaults: {
        nombre: 'Admin',
        apellido: 'Principal',
        email: process.env.ADMIN_EMAIL,
        password: passwordHash
      }
    });

    if (created) {
      console.log('✅ Bibliotecario admin creado correctamente.');
    } else {
      console.log('ℹ️ Bibliotecario admin ya existía.');
    }
  } catch (err) {
    console.error('❌ Error poblando bibliotecario:', err.message);
  }
}

module.exports = poblarBibliotecario;
