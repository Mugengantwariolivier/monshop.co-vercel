const express = require('express');
const { q } = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

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

// List items
router.get('/items', auth, async (_req, res) => {
  const { rows } = await q('SELECT * FROM items ORDER BY id DESC');
  res.json(rows);
});

// Create item
router.post('/items', auth, async (req, res) => {
  const { name, code, price, date_registered } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await q(
    `INSERT INTO items (name, code, price, date_registered)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [name, code || null, Number(price || 0), date_registered || new Date().toISOString().slice(0,10)]
  );
  res.json(rows[0]);
});

module.exports = router;
