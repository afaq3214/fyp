import mongoose from 'mongoose';

// Serverless-friendly options (no buffering, pooling)


const connectDB = async () => {
  // Avoid reconnect if already connected
  if (mongoose.connection.readyState >= 1) {
    console.log('🤝 MongoDB already connected');
    return;
  }

  try {
    // Hardcoded Atlas URI (always used)
    const uri = "mongodb+srv://qmafaq:%40afaq123@cluster0.8yvta.mongodb.net/fyp?retryWrites=true&w=majority";
    console.log('🔗 Connecting to Atlas');  // Debug log
    await mongoose.connect(uri);
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