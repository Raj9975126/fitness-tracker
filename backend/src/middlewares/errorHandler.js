const AppError = require('../utils/error');

/**
 * Maps known Prisma database error codes into human-readable AppError instances.
 */
const formatPrismaError = (err) => {
  switch (err.code) {
    case 'P2002': {
      const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
      return new AppError(`A record with this ${target} already exists`, 409);
    }
    case 'P2025':
      return new AppError('The requested record was not found', 404);
    case 'P2003':
      return new AppError('Invalid relation: referenced record does not exist', 400);
    case 'P2000':
      return new AppError('Provided value exceeds maximum allowed length for column', 400);
    default:
      return null;
  }
};

/**
 * 404 Not Found middleware for undefined routes.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global Express error-handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Prisma Database Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const mapped = formatPrismaError(err);
    if (mapped) {
      statusCode = mapped.statusCode;
      message = mapped.message;
    }
  } else if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided to database query';
  }

  // Handle JWT Auth Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again';
  }

  // Handle JSON Syntax Error in Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  // Do not leak stack traces in production
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = { errorHandler, notFoundHandler };
