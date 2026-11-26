function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
    error: { code: "ROUTE_NOT_FOUND", details: { method: req.method, url: req.originalUrl } },
  });
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || error.status || 500;
  let code = error.code || "INTERNAL_SERVER_ERROR";
  let message = error.message || "An unexpected error occurred";

  if (error.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
  } else if (error.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid identifier";
  } else if (error.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_VALUE";
    message = "A record with that value already exists";
  }

  if (error.message === "Origin is not allowed by CORS") {
    statusCode = 403;
    code = "CORS_ORIGIN_DENIED";
  }

  const details = error.details || (error.name === "ValidationError"
    ? Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
    : undefined);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: { code, ...(details ? { details } : {}) },
  });
}

module.exports = { notFound, errorHandler };