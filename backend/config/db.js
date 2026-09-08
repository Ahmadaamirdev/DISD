import mongoose from 'mongoose';

export let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  // Local MongoDB is disconnected by default.
  // Only connect if MongoDB Atlas URI is explicitly provided (e.g. mongodb+srv://...)
  const isAtlasURI = mongoURI && mongoURI.startsWith('mongodb+srv://');

  if (!isAtlasURI) {
    isConnected = false;
    console.log('[Database] Local MongoDB is disconnected.');
    console.log('[Database] Active storage: JSON file store (backend/data/products.json, backend/data/inquiries.json).');
    console.log('[Database] Ready for MongoDB Atlas. Provide MONGODB_URI in .env to connect Atlas in the future.');
    return;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB Atlas connection failed (${error.message}). Falling back to JSON file storage.`);
  }
};
