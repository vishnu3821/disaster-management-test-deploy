const express = require('express');
const app = express();

// Log environment variables for debugging
console.log('Environment Variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
  RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
  RAILWAY_SERVICE_ID: process.env.RAILWAY_SERVICE_ID
});

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Health check endpoint (for Railway health checks)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', router);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Disaster Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      api: '/api',
      test: '/api/test'
    }
  });
});

// Catch-all route for 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    code: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
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
  console.log('Memory usage:', JSON.stringify(process.memoryUsage()));
  console.log('Press Ctrl+C to stop the server');
  
  // Log all environment variables (for debugging)
  console.log('Environment variables:', 
    Object.entries(process.env)
      .filter(([key]) => key.startsWith('RAILWAY_') || key === 'NODE_ENV' || key === 'PORT')
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
  );
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
