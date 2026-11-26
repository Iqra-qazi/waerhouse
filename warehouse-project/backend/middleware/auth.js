const jwt = require("jsonwebtoken");
const User = require("../models/User");

function httpError(statusCode, message, code, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) error.details = details;
  return error;
}

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
    if (!token) throw httpError(401, "Authentication required", "AUTH_REQUIRED");
    if (!process.env.JWT_SECRET) throw httpError(500, "JWT_SECRET is not configured", "SERVER_CONFIGURATION_ERROR");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) throw httpError(401, "User no longer exists", "USER_NOT_FOUND");
    if (!user.isActive) throw httpError(403, "Account is inactive", "ACCOUNT_INACTIVE");
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(httpError(401, "Invalid or expired token", "INVALID_TOKEN"));
    }
    next(error);
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(httpError(401, "Authentication required", "AUTH_REQUIRED"));
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, "You do not have permission for this action", "FORBIDDEN"));
    }
    next();
  };
}

module.exports = { authenticate, authorize };