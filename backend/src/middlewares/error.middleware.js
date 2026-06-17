import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error?.name === 'ValidationError') {
      error = ApiError.badRequest('Validation failed', error.errors);
    } else if (error?.name === 'CastError') {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    } else if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = ApiError.conflict(`Duplicate value for ${field}`);
    } else if (error?.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid token');
    } else if (error?.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token expired');
    } else {
      error = new ApiError(error.statusCode || 500, error.message || 'Internal server error');
    }
  }

  if (error.statusCode >= 500) {
    logger.error(error.message, { stack: err.stack });
  } else {
    logger.warn(`${error.statusCode} ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}
