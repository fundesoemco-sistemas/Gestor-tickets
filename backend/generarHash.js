const bcrypt = require('bcrypt');

const password = 'Constru2025'; // Cambia si es necesario

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('🔑 Hash generado:', hash);
});
