/**
 * Socket.IO Implementation — server/socket/socket.js
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      // Allow token via auth object or cookie parser could be integrated, 
      // but standard is sending token in handshake auth for socket
      let token = socket.handshake.auth && socket.handshake.auth.token;

      // Browser clients use an httpOnly "token" cookie (set by authController),
      // so fall back to reading it from the handshake headers.
      if (!token) {
        const rawCookie = socket.handshake.headers.cookie || '';
        const match = rawCookie
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('token='));
        if (match) token = decodeURIComponent(match.slice('token='.length));
      }

      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Unauthorized'));
      }

      socket.user = { id: user._id.toString(), role: user.role };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Join private user room: user:<userId>
    const userRoom = `user:${socket.user.id}`;
    socket.join(userRoom);
    
    // console.log(`[Socket] User ${socket.user.id} connected and joined ${userRoom}`);

    socket.on('disconnect', () => {
      // console.log(`[Socket] User ${socket.user.id} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
