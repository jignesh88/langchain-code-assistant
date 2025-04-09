import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import cors from 'cors';
import { config } from '../config';
import { handleQuery, cleanupMemory } from './queryHandler';
import logger from '../utils/logger';

export async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.security.corsOrigins,
      methods: ["GET", "POST"]
    }
  });

  // Middleware
  app.use(cors({
    origin: config.security.corsOrigins
  }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../public')));

  // Serve the main page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on('query', async (query) => {
      try {
        logger.info(`Received query from ${socket.id}: ${query}`);
        
        // Send acknowledgement
        socket.emit('message', {
          role: 'system',
          content: 'Processing your query...'
        });
        
        // Process the query with session ID
        const answer = await handleQuery(query, socket.id);
        
        // Send response
        socket.emit('message', {
          role: 'assistant',
          content: answer
        });
      } catch (error) {
        logger.error('Error processing query:', error);
        socket.emit('message', {
          role: 'system',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
      // Clean up memory after some time
      setTimeout(() => {
        cleanupMemory(socket.id);
      }, 3600000); // 1 hour
    });
  });

  // Start server
  server.listen(config.application.port, () => {
    logger.info(`Server running at http://localhost:${config.application.port}`);
  });

  return server;
}