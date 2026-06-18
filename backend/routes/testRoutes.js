// ============================================
// TEST ROUTES
// ============================================
// Sample API endpoints for development and testing

const express = require('express');
const router = express.Router();

// ============================================
// GET /api/test - Basic test endpoint
// ============================================
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working perfectly! 🎉',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// GET /api/test/echo - Echo test (returns whatever you send)
// ============================================
router.get('/echo', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Echo test successful',
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// POST /api/test/echo - Echo test with POST body
// ============================================
router.post('/echo', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Echo test successful',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// GET /api/test/info - Server information
// ============================================
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server Information',
    server: {
      port: process.env.PORT || 'Not set',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime() + ' seconds',
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// GET /api/test/error - Test error handling
// ============================================
router.get('/error', (req, res, next) => {
  // This will trigger the global error handler
  const error = new Error('This is a test error for error handling middleware');
  error.statusCode = 500;
  next(error);
});

// ============================================
// GET /api/test/validation-error - Test validation error
// ============================================
router.get('/validation-error', (req, res, next) => {
  const error = new Error('Validation failed: Email is required');
  error.statusCode = 400;
  error.name = 'ValidationError';
  next(error);
});

// ============================================
// GET /api/test/cors - Test CORS headers
// ============================================
router.get('/cors', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS is working',
    corsHeaders: {
      'Access-Control-Allow-Origin': req.headers.origin || 'Not set',
      'Access-Control-Allow-Credentials': 'true'
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// GET /api/test/headers - Check request headers
// ============================================
router.get('/headers', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Request Headers',
    headers: {
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      authorization: req.headers['authorization'] ? 'Present' : 'Not present',
      all: req.headers
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
