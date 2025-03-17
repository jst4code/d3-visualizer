const express = require('express');
const cors = require('cors');

// You'll need to install cors package: npm install cors

module.exports = function setupCORS(app) {
  // Simple CORS setup allowing requests from localhost:3000
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Pre-flight OPTIONS request handling
  app.options('*', cors());
};

// Usage in your server file:
// const setupCORS = require('./cors-middleware');
// const app = express();
// setupCORS(app);
