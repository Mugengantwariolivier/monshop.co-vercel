require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
const usersRoute = require('./routes/users');
const itemsRoute = require('./routes/items');
const stockRoute = require('./routes/stock');

app.use('/api', usersRoute);
app.use('/api', itemsRoute);
app.use('/api', stockRoute);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app for Vercel
module.exports = app;

// If run locally, listen on a port
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}
