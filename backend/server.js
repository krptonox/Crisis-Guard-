const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const evidenceRoutes = require('./routes/evidence');
const chatbotRoutes = require('./routes/chatbot');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CrisisguardAI Backend Node.js',
    version: '2.0.0',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    aiService: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    service: 'CrisisguardAI Backend',
    version: '2.0.0',
    endpoints: {
      upload: 'POST /api/upload',
      reanalyze: 'POST /api/reanalyze/:id',
      getEvidence: 'GET /api/evidence/:id',
      getAllEvidences: 'GET /api/evidences',
      stats: 'GET /api/evidences/stats/summary',
      exportCSV: 'GET /api/evidences/export/csv',
      timeline: 'GET /api/evidences/timeline',
      deleteEvidence: 'DELETE /api/evidence/:id',
      health: 'GET /api/health',
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', evidenceRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server immediately (don't block on MongoDB)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🔗 AI Service: ${process.env.AI_SERVICE_URL}`);
});

// MongoDB connection (non-blocking — chatbot/RSS routes work without it)
const MONGO_URI = process.env.MONGODB_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
      console.warn('⚠️  MongoDB connection failed (upload/evidence routes will be unavailable):', err.message);
      // Don't exit — RSS chatbot still works without MongoDB
    });
} else {
  console.warn('⚠️  MONGODB_URI not set — upload/evidence routes disabled. Chatbot & news routes are still active.');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = app;