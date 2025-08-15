const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/' && req.method === 'GET') {
    res.end(JSON.stringify({
      status: 'success',
      message: 'Server is running!',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  if (req.url === '/health' && req.method === 'GET') {
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 404 Not Found
  res.statusCode = 404;
  res.end(JSON.stringify({
    status: 'error',
    message: 'Not Found',
    path: req.url
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Node version:', process.version);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
