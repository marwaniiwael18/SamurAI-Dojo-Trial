const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  res.json({ message: 'Test auth endpoint working' });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
};

startServer();
