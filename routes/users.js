const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { q } = require('../db');

const router = express.Router();

const signToken = (user) => {
  const payload = { id: user.id, username: user.username };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const password_hash = bcrypt.hashSync(password, 10);

    const { rows } = await q(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1,$2,$3)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, email, created_at`,
      [username, email || null, password_hash]
    );

    if (!rows.length) return res.status(409).json({ error: 'username already exists' });

    const token = signToken(rows[0]);
    res.json({ user: rows[0], token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const { rows } = await q('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const token = signToken(user);
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
};

// Who am I
router.get('/me', auth, async (req, res) => {
  const { rows } = await q('SELECT id, username, email, created_at FROM users WHERE id=$1', [req.user.id]);
  res.json(rows[0] || null);
});

module.exports = router;
