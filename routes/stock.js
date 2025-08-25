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

// Stock in
router.post('/stock/in', auth, async (req, res) => {
  const { item_id, qty, date } = req.body;
  if (!item_id || !qty) return res.status(400).json({ error: 'item_id and qty required' });
  const { rows } = await q(
    `INSERT INTO stock_in (item_id, qty, date) VALUES ($1,$2,$3) RETURNING *`,
    [Number(item_id), Number(qty), date || new Date().toISOString().slice(0,10)]
  );
  res.json(rows[0]);
});

// Stock out
router.post('/stock/out', auth, async (req, res) => {
  const { item_id, qty, unit_price, client_name, date } = req.body;
  if (!item_id || !qty || !unit_price) return res.status(400).json({ error: 'item_id, qty, unit_price required' });
  const total = Number(qty) * Number(unit_price);
  const { rows } = await q(
    `INSERT INTO stock_out (item_id, qty, unit_price, total, client_name, date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [Number(item_id), Number(qty), Number(unit_price), total, client_name || null, date || new Date().toISOString().slice(0,10)]
  );
  res.json(rows[0]);
});

// Summary
router.get('/stock/summary', auth, async (_req, res) => {
  const stockIn = await q(`SELECT item_id, SUM(qty) as qty_in FROM stock_in GROUP BY item_id`);
  const stockOut = await q(`SELECT item_id, SUM(qty) as qty_out FROM stock_out GROUP BY item_id`);
  const map = new Map();
  stockIn.rows.forEach(r => map.set(r.item_id, { in: Number(r.qty_in), out: 0 }));
  stockOut.rows.forEach(r => {
    const cur = map.get(r.item_id) || { in: 0, out: 0 };
    cur.out = Number(r.qty_out);
    map.set(r.item_id, cur);
  });
  const items = await q('SELECT id, name, code, price FROM items');
  const result = items.rows.map(i => {
    const s = map.get(i.id) || { in: 0, out: 0 };
    return { ...i, in_stock: s.in - s.out };
  });
  res.json(result);
});

module.exports = router;
