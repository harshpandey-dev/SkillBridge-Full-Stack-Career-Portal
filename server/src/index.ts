import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import 'dotenv/config';

import authRouter from './routes/auth.routes';
import jobRouter from './routes/job.routes';
import applicationRouter from './routes/application.routes';
import savedJobRouter from './routes/savedJob.routes';
import studentProfileRouter from './routes/studentProfile.routes';
import recruiterProfileRouter from './routes/recruiterProfile.routes';
import skillRouter from './routes/skill.routes';
import learningResourceRouter from './routes/learningResource.routes';
import adminResourceRouter from './routes/adminResource.routes';
import notificationRouter from './routes/notification.routes';
import adminRouter from './routes/admin.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Security headers
app.use(helmet());

// CORS configuration with credentials support for HTTP-only cookies
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

// Cookie parsing
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter);

// Student profile and skills routes
app.use('/api/v1/student', studentProfileRouter);
app.use('/api/student', studentProfileRouter);

// Recruiter profile and dashboard routes
app.use('/api/v1/recruiter', recruiterProfileRouter);
app.use('/api/recruiter', recruiterProfileRouter);

// Global skills suggestion and search routes
app.use('/api/v1/skills', skillRouter);
app.use('/api/skills', skillRouter);

// Notification routes
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/notifications', notificationRouter);

// Learning Resources routes (Public & Admin)
app.use('/api/v1/resources', learningResourceRouter);
app.use('/api/resources', learningResourceRouter);
app.use('/api/v1/admin/resources', adminResourceRouter);
app.use('/api/admin/resources', adminResourceRouter);

// Admin Management and Platform Dashboard routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/admin', adminRouter);

// Job routes
app.use('/api/v1/jobs', jobRouter);
app.use('/api/jobs', jobRouter);

// Application routes
app.use('/api/v1/applications', applicationRouter);
app.use('/api/applications', applicationRouter);

// Saved jobs routes
app.use('/api/v1/saved-jobs', savedJobRouter);
app.use('/api/saved-jobs', savedJobRouter);

// 404 and central error handling
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

export default app;
