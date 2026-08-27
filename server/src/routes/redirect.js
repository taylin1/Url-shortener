import { Router } from 'express';

const redirectRouter = Router();

redirectRouter.get('/:code', async (req, res) => {
  // TODO: Implement redirect logic
  res.status(404).json({ error: 'Link not found' });
});

export default redirectRouter;
