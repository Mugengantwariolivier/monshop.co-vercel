const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false }
});

const q = (text, params = []) => pool.query(text, params);

module.exports = { pool, q };
