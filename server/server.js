import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/config.js';
import { initSocket } from './socket/socket.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    // Start server
    server.listen(config.port, () => {
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
