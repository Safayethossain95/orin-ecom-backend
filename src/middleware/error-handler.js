const env = require("../config/env");

const handleCastError = (err) => {
  err.statusCode = 400;
  err.status = "fail";
  err.message = `Invalid ${err.path}: ${err.value}`;
  return err;
};

const handleDuplicateFields = (err) => {
  err.statusCode = 409;
  err.status = "fail";
  err.message = "Duplicate field value entered.";
  return err;
};

const handleValidationError = (err) => {
  err.statusCode = 400;
  err.status = "fail";
  err.message = Object.values(err.errors)
    .map((value) => value.message)
    .join(". ");
  return err;
};

const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (error.name === "CastError") error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateFields(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.status = "fail";
    error.message = "Invalid token.";
  }
  if (error.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.status = "fail";
    error.message = "Token expired.";
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.isOperational ? error.message : "Internal server error.",
    details: error.details,
    stack: env.env === "development" ? error.stack : undefined,
  });
};

module.exports = errorHandler;
