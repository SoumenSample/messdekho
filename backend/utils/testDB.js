// ============================================
// DATABASE CONNECTION TEST UTILITY
// ============================================

const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...\n');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ SUCCESS! MongoDB Connection Details:`);
    console.log(`\n   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`\n✨ Database is ready to use!\n`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ CONNECTION FAILED!\n`);
    console.error(`Error: ${error.message}\n`);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('Solution: Make sure MongoDB is running:');
      console.error('  • Windows: mongod');
      console.error('  • Or use MongoDB Atlas and update MONGO_URI in .env\n');
    }

    if (error.message.includes('ERR_INVALID_ARG_VALUE')) {
      console.error('Solution: Check your MONGO_URI format in .env file\n');
    }

    process.exit(1);
  }
};

// Run test if called directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;
