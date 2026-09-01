require('dotenv/config');
const express = require('express');
const cors = require('cors');
const shortenRouter = require('./routes/shorten.js');
const redirectRouter = require('./routes/redirect.js');
const linksRouter = require('./routes/links.js');
const { verifyToken } = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', shortenRouter);
app.use('/api', linksRouter);
app.use('/', redirectRouter);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
