// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================

const requestLogger = (req, res, next) => {
  if (process.env.REQUEST_LOGS !== 'true') {
    return next();
  }

  const startTime = Date.now();

  // Log request
  console.log(`${req.method} ${req.originalUrl}`);

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`${res.statusCode} ${duration}ms`);
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

module.exports = { requestLogger };
