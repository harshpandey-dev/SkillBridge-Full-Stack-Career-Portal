import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

// Central error handler
export function errorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
      statusCode: 400,
    });
    return;
  }

  // Handle known AppErrors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.stack ?? err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
      statusCode: err.statusCode,
    });
    return;
  }

  // Unhandled / unexpected errors
  logger.error(err.stack ?? err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    statusCode: 500,
  });
}

// 404 handler for unknown routes
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}
