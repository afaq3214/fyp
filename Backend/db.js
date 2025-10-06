import mongoose from 'mongoose';

// Serverless-friendly options (no buffering, pooling)
const connectOptions = {
  maxPoolSize: 10,  // Limit connections for Vercel
  serverSelectionTimeoutMS: 5000,  // Faster timeout
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,  // Fail fast if offline (no queuing)
  retryWrites: true,
  w: 'majority'
};

const connectDB = async () => {
  // Avoid reconnect if already connected
  if (mongoose.connection.readyState >= 1) {
    console.log('🤝 MongoDB already connected');
    return;
  }

  try {
    // Use env var; fallback for local dev (add to .env)
    const uri  = "mongodb+srv://qmafaq:%40afaq123@cluster0.8yvta.mongodb.net/fyp?retryWrites=true&w=majority"|| 'mongodb://127.0.0.1:27017/FYP';
    await mongoose.connect(uri, connectOptions);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    // Don't exit in serverless—let Vercel retry
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;  // Re-throw for logging
  }
};

// Optional: Graceful shutdown (local testing)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB disconnected');
});

export default connectDB;