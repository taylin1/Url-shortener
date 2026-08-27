import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';

const linksRouter = Router();

linksRouter.get('/links', verifyToken, async (req, res) => {
  // TODO: Implement get links logic
  res.status(501).json({ error: 'Not implemented' });
});

export default linksRouter;
