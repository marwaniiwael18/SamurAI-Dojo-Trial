const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

// JWT token generation
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Create and send JWT token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    refreshToken,
    data: {
      user
    }
  });
};

// Protect middleware - verify JWT token
const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+loginAttempts +lockUntil');
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.'
      });
    }

    // 4) Check if user account is locked
    if (currentUser.isLocked) {
      return res.status(423).json({
        status: 'fail',
        message: 'Account is temporarily locked due to too many failed login attempts.'
      });
    }

    // 5) Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // 6) Check if email is verified for certain actions
    if (!currentUser.emailVerified && req.path !== '/verify-email' && req.path !== '/resend-verification') {
      return res.status(403).json({
        status: 'fail',
        message: 'Please verify your email address to access this feature.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again!'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired! Please log in again.'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during authentication'
    });
  }
};

// Refresh token middleware
const refreshToken = async (req, res, next) => {
  try {
    let refreshToken;
    
    if (req.headers['x-refresh-token']) {
      refreshToken = req.headers['x-refresh-token'];
    } else if (req.cookies.refreshToken) {
      refreshToken = req.cookies.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'No refresh token provided'
      });
    }

    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    createSendToken(user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid refresh token'
    });
  }
};

// Restrict to certain roles
const restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      const WorkspaceMember = require('../models/WorkspaceMember');
      
      // For workspace-specific operations, check workspace role
      if (req.params.workspaceId) {
        const membership = await WorkspaceMember.findOne({
          userId: req.user._id,
          workspaceId: req.params.workspaceId,
          isActive: true
        });

        if (!membership || !roles.includes(membership.role)) {
          return res.status(403).json({
            status: 'fail',
            message: 'You do not have permission to perform this action'
          });
        }

        req.workspaceMembership = membership;
        return next();
      }

      // For global operations, you might check admin status
      // This would require an admin model or user role field
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking permissions'
      });
    }
  };
};

// Check workspace permission
const checkWorkspacePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.workspaceMembership) {
        return res.status(403).json({
          status: 'fail',
          message: 'No workspace membership found'
        });
      }

      if (!req.workspaceMembership.hasPermission(permission)) {
        return res.status(403).json({
          status: 'fail',
          message: `You do not have permission to ${permission}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking workspace permissions'
      });
    }
  };
};

// Optional authentication (for public endpoints that can be enhanced with user context)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        if (currentUser && currentUser.isActive) {
          req.user = currentUser;
        }
      } catch (error) {
        // Token invalid, but continue without user context
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  signToken,
  signRefreshToken,
  createSendToken,
  protect,
  refreshToken,
  restrictTo,
  checkWorkspacePermission,
  optionalAuth
};
