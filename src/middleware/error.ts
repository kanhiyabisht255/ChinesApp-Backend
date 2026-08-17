import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const mongoError = err as AppError & { name?: string; keyValue?: Record<string, unknown> };
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (mongoError.code === '11000') {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (mongoError.name === 'ValidationError' || mongoError.name === 'CastError' || mongoError.name === 'MulterError') {
    statusCode = 400;
  } else if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    // Only mask genuine internal errors. Intentional 503s (e.g. "email could
    // not be sent") carry user-facing messages and must not be hidden.
    message = 'Internal server error';
  }

  if (statusCode >= 500) console.error(`${req.method} ${req.path} failed:`, err);
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(err.code && statusCode < 500 ? { code: err.code } : {}),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (statusCode: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};
