// ============================================
// DATABASE CONNECTION CONFIG
// ============================================

const mongoose = require('mongoose');

let isShuttingDown = false;

const buildMongoCandidates = () => {
  const candidates = [];
  const primary = process.env.MONGO_URI;

  if (primary) {
    candidates.push(primary);
  }

  const localFallback = 'mongodb://127.0.0.1:27017/mess-dekho';
  if (!candidates.includes(localFallback)) {
    candidates.push(localFallback);
  }

  return candidates;
};

const connectDB = async () => {
  try {
    const candidates = buildMongoCandidates();

    if (candidates.length === 0) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    let lastError = null;

    for (const mongoURI of candidates) {
      try {
        const connection = await mongoose.connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected Successfully (${mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1') ? 'local' : 'primary'})`);

        return connection;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ MongoDB connection failed for candidate: ${mongoURI.split('@').pop()}`);
      }
    }

    throw lastError || new Error('Unable to connect to MongoDB');

  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);

    // Exit process with failure code
    process.exit(1);
  }
};

// Disconnect from database (for graceful shutdown)
const disconnectDB = async () => {
  try {
    isShuttingDown = true;
    await mongoose.disconnect();
  } catch (error) {
    console.error(`❌ Error disconnecting from MongoDB: ${error.message}`);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  if (isShuttingDown) {
    return;
  }

  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error(`❌ MongoDB error: ${error.message}`);
});

mongoose.connection.on('reconnected', () => {
  isShuttingDown = false;
  console.log('✅ MongoDB reconnected');
});

module.exports = {
  connectDB,
  disconnectDB
};
