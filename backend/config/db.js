const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('❌ MONGODB_URI is not set in environment variables!');
      return;
    }

    // Clean any accidentally left angle brackets if present
    const cleanedUri = connStr.replace(/<([^>]+)>/g, '$1');

    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(cleanedUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // We do not exit process so server can keep running and retry
  }
};

module.exports = connectDB;
