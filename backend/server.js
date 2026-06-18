// ============================================
// MESS DEKHO BACKEND - SERVER STARTUP
// ============================================
// This file handles server startup and database connection.
// All Express middleware and routes are configured in app.js

require('dotenv').config();
require('express-async-errors');

// Import the Express app
const app = require('./app');

// Import database connection
const { connectDB, disconnectDB } = require('./config/db');

// ============================================
// DATABASE CONNECTION
// ============================================

// Handled by config/db.js and called in startServer()

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 8000;

let server;

const shutdown = async (signal) => {
  console.log(`📴 ${signal} received, shutting down...`);

  if (server) {
    server.close(async () => {
      console.log('✅ Server closed');
      await disconnectDB();
      process.exit(0);
    });
    return;
  }

  await disconnectDB();
  process.exit(0);
};

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    server = app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`📝 Visit http://localhost:${PORT}/ for API info`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      shutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      shutdown('SIGINT');
    });

    process.on('SIGUSR2', () => {
      shutdown('SIGUSR2');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      console.error(`⚠️ Unhandled Promise Rejection: ${error.message || error}`);
      if (server) {
        server.close(() => {
          disconnectDB().then(() => {
            process.exit(1);
          });
        });
        return;
      }

      disconnectDB().then(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
