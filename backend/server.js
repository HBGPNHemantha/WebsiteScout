const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL, // e.g. https://websitescout.vercel.app
].filter(Boolean);

// Enable CORS
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL
      ? true
      : (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
          } else {
            callback(null, true); // Allow requests or configure specific origins
          }
        },
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/search', require('./routes/search'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));

// Health & Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'WebsiteScout API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

const path = require('path');
const fs = require('fs');

// Static file serving for single-server production deployments
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start Database & Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
🚀 ===================================================
   WebsiteScout Backend API Server is Running!
   ---------------------------------------------------
   🌐 API URL:       http://localhost:${PORT}
   🩺 Health Check:  http://localhost:${PORT}/api/health
   🔍 Search Lead:   POST http://localhost:${PORT}/api/search
   📋 Businesses:    GET  http://localhost:${PORT}/api/businesses
   📊 Analytics:     GET  http://localhost:${PORT}/api/analytics/dashboard
===================================================
    `);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
