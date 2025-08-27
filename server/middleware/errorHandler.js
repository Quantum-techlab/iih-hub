// Error handling middleware for Ilorin Innovation Hub API

export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.details;
  }

  if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized';
    error.status = 401;
  }

  if (err.name === 'ForbiddenError') {
    error.message = 'Forbidden';
    error.status = 403;
  }

  if (err.name === 'NotFoundError') {
    error.message = 'Resource not found';
    error.status = 404;
  }

  // Supabase specific errors
  if (err.code === '23505') {
    error.message = 'Resource already exists';
    error.status = 409;
  }

  if (err.code === '23503') {
    error.message = 'Referenced resource not found';
    error.status = 400;
  }

  if (err.code === '42501') {
    error.message = 'Insufficient permissions';
    error.status = 403;
  }

  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      status: error.status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(error.details && { details: error.details })
    },
    timestamp: new Date().toISOString()
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
