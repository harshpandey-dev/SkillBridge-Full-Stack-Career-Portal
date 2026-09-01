import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Central error handler — placed last in the middleware chain
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(err.stack ?? err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
  });
}

// Wraps 404s for unknown routes
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}
