function success(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(statusCode, message, code, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (details) err.details = details;
  return err;
}

module.exports = { success, error };
