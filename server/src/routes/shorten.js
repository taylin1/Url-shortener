import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';

const shortenRouter = Router();

shortenRouter.post('/shorten', verifyToken, async (req, res) => {
  // TODO: Implement URL shortening logic
  res.status(501).json({ error: 'Not implemented' });
});

export default shortenRouter;
