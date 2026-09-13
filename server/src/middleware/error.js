export function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}: ${err.message}`);
  const status = err.statusCode || (err.name === "ZodError" ? 400 : 500);
  const message = err.name === "ZodError"
    ? "Invalid request data"
    : (status >= 500 ? "Internal server error" : err.message);
  res.status(status).json({
    success: false,
    message,
    ...(err.name === "ZodError" ? { details: err.issues } : {})
  });
}
