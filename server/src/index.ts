import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import inviteRouter from './routes/invite';
import authRouter from './routes/auth';

const ALLOWED_ORIGINS = [
  'https://sigil-and-script-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

const app = express();
const PORT = process.env.PORT || 5001;

// V-06: Suppress Express technology banner
app.disable('x-powered-by');

// R-03: Security headers on all responses
app.use(
  helmet({
    frameguard: { action: 'deny' },
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/', inviteRouter);

// Centralized error handler to prevent internal leakage (V-06)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled internal server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'An unexpected internal error occurred' });
});

// Start server only if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
