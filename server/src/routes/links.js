const { Router } = require('express');
const { verifyToken } = require('../middleware/auth.js');

const linksRouter = Router();

linksRouter.get('/links', verifyToken, async (req, res) => {
  // TODO: Implement get links logic
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = linksRouter;
