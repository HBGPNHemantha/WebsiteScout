const mongoose = require('mongoose');

let mongod = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // 1. If explicit MONGODB_URI is provided, try connecting to it
  if (uri && uri.trim() !== '') {
    try {
      console.log(`📡 Connecting to configured MongoDB: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn(`⚠️ Failed to connect to configured MONGODB_URI: ${err.message}`);
      console.log('🔄 Falling back to embedded MongoDB Memory Server for seamless zero-setup execution...');
    }
  }

  // 2. Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    console.log(`💾 Initialized In-Memory MongoDB instance at ${memoryUri}`);
    
    await mongoose.connect(memoryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to In-Memory MongoDB successfully. (Data persists while server runs)');
  } catch (memoryErr) {
    console.error('❌ Failed to initialize in-memory MongoDB:', memoryErr.message);
    // Attempt default localhost fallback
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/websitescout');
      console.log('✅ Connected to local MongoDB at 127.0.0.1:27017');
    } catch (finalErr) {
      console.error('❌ Could not connect to any MongoDB instance:', finalErr.message);
    }
  }
}

async function closeDB() {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('🔌 MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing DB connection:', err.message);
  }
}

module.exports = { connectDB, closeDB };
