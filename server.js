const express = require('express');
const app = express();

// Log environment variables for debugging
console.log('Environment Variables:', {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
  RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
  RAILWAY_SERVICE_ID: process.env.RAILWAY_SERVICE_ID
});

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get port from environment (Railway provides this)
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = require('http').createServer(app);

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Memory usage:', process.memoryUsage());
  console.log('Press Ctrl+C to stop the server');
  
  // Log all environment variables (for debugging)
  console.log('All environment variables:', Object.keys(process.env).sort().join(', '));
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
