const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const session = require('express-session');
require('dotenv').config();

// Import logger
const logger = require('./utils/logger');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profiles');
const workspaceRoutes = require('./routes/workspaces');
const companyRoutes = require('./routes/companies');
const adminRoutes = require('./routes/admin');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration - using memory store for development
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

app.use(session(sessionConfig));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB and start server
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;
      
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  
  // Basic routes
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'SamurAI Dojo Backend is running!'
    });
  });
  
  app.get('/', (req, res) => {
    res.json({ message: 'SamurAI Dojo API is running!' });
  });
  
  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Error handling middleware (must be last)
  app.use(errorHandler);
  
  const server = app.listen(PORT, () => {
    logger.info(`🚀 SamurAI Dojo Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  });

  return server;
};

if (require.main === module) {
  startServer();
}
