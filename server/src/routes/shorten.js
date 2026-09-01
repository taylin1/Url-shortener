const { Router } = require('express');
const { verifyToken } = require('../middleware/auth.js');

const shortenRouter = Router();

shortenRouter.post('/shorten', verifyToken, async (req, res) => {
  // TODO: Implement URL shortening logic
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = shortenRouter;
