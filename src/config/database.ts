import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const getMongoUri = (): string => {
  const mongoUri = process.env.MONGODB_URI?.trim() || process.env.MONGO_URL?.trim();

  if (!mongoUri) {
    throw new Error(
      'MongoDB connection string is missing. Set MONGODB_URI (recommended) or MONGO_URL in the service environment variables.'
    );
  }

  return mongoUri;
};

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(getMongoUri());
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('📦 MongoDB Disconnected');
};
