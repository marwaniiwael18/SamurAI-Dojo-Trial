const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Simple test route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'SamurAI Dojo Backend is running!'
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/samurai-dojo';
    console.log('Connecting to:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 SamurAI Dojo Test Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
