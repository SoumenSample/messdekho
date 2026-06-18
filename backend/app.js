// ============================================
// MESS DEKHO BACKEND - EXPRESS APP
// ============================================
// This file configures all middleware, routes, and error handling.
// The actual server startup is handled in server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const pgRoutes = require('./routes/pg');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const homepageCityRoutes = require('./routes/homepageCityRoutes');
const testRoutes = require('./routes/testRoutes');

// Create Express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
// ============================================
// BODY PARSER MIDDLEWARE
// ============================================
app.use(express.json());

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// LOGGING MIDDLEWARE
// ============================================
// Simple custom request logger.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ============================================
// ROOT ROUTE
// ============================================
// Main API entry point
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mess Dekho API Running 🚀'
  });
});

// ============================================
// API ROUTES
// ============================================

// Test routes (for development/debugging)
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend is healthy ✅'
  });
});

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/pg', pgRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/homepage-cities', homepageCityRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// 404 NOT FOUND HANDLER
// ============================================
// This middleware catches all routes that don't match above
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ============================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================
// This MUST be last. It catches all errors from above middleware/routes
app.use(errorHandler);

// ============================================
// EXPORTS
// ============================================
module.exports = app;
