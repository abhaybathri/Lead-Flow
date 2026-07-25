const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return error(res, 'Validation failed', 422, errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return error(res, `${field} already exists`, 409);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return error(res, 'Invalid ID format', 400);
  }

  return error(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
