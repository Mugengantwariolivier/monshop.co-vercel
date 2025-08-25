require('dotenv').config();
const bcrypt = require('bcryptjs');
const { q } = require('../db');

(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const password_hash = bcrypt.hashSync(password, 10);
  await q(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1,$2,$3)
     ON CONFLICT (username) DO NOTHING`,
    [username, email, password_hash]
  );
  console.log(`Admin ready: ${username} / ${password}`);
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
