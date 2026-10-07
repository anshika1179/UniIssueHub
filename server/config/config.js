import dotenv from 'dotenv';
import { randomBytes } from 'node:crypto';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
let jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  if (nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production. Set a strong secret in server/.env before starting.');
  }
  jwtSecret = randomBytes(32).toString('hex');
  console.warn('JWT_SECRET is missing. Using a random temporary development secret; sessions expire on restart. Set JWT_SECRET in server/.env.');
}
if (nodeEnv === 'production' && !process.env.MONGODB_URI?.trim()) {
  throw new Error('MONGODB_URI is required in production. Set your MongoDB connection string in server/.env.');
}

const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongoUri: process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/uniissuehub',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret,
  jwtExpire: process.env.JWT_EXPIRE || '1d',
};

export default config;
