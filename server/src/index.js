import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import shortenRouter from './routes/shorten.js';
import redirectRouter from './routes/redirect.js';
import linksRouter from './routes/links.js';
import { verifyToken } from './middleware/auth.js';

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

export default app;
