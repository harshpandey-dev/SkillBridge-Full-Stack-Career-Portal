import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import 'dotenv/config';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (to be registered here as features are built)
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/jobs', jobsRouter);
// app.use('/api/v1/users', usersRouter);

// 404 + error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
