import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in Vercel.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    // MongoDB URI not configured, caller can fall back gracefully
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB Atlas successfully.');
      return mongooseInstance;
    }).catch((err) => {
      console.warn('⚠️ MongoDB Atlas connection error (Falling back to local storage):', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
