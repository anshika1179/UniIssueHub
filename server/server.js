import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(config.port, () => {
      console.log(`\n🚀 UniIssueHub Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📡 API: http://localhost:${config.port}/api/v1/health`);
      console.log(`🌐 Client: ${config.clientUrl}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
