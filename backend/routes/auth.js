const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const Company = require('../models/Company');
const { createSendToken, protect, refreshToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth endpoints (relaxed for development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // increased from 5 to 50 for development
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // increased from 3 to 10 for development
  message: {
    error: 'Too many password reset attempts, please try again later.'
  }
});

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .custom(async (email) => {
      // Check if it's a corporate email
      if (!User.validateCorporateEmail(email)) {
        throw new Error('Please use a corporate email address. Personal and academic emails are not allowed.');
      }
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// @desc    Validate corporate email
// @route   POST /api/auth/validate-email
// @access  Public
router.post('/validate-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email format'
      });
    }

    // Check if it's a corporate email
    const isCorporate = User.validateCorporateEmail(email);
    
    if (!isCorporate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please use a corporate email address. Personal and academic emails are not allowed.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'User with this email already exists'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Corporate email is valid',
      data: {
        isCorporate: true,
        domain: email.split('@')[1]
      }
    });

  } catch (error) {
    logger.error('Email validation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email validation failed'
    });
  }
});

// @desc    Register new user with corporate email validation
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Extract email domain
    const emailDomain = email.split('@')[1];
    
    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      emailDomain,
      isCorporateEmail: true // Since we validate corporate emails only
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Detect company from email domain
    const companyDetection = await Company.detectFromDomain(user.emailDomain);
    
    // Create user profile with AI detection
    const profileData = {
      userId: user._id
    };

    if (companyDetection.found) {
      profileData.companyName = companyDetection.company.name;
      profileData.companyIndustry = companyDetection.company.industry;
      profileData.aiConfidence = companyDetection.confidence;
      profileData.industry = companyDetection.company.industry;
    } else if (companyDetection.suggestion) {
      profileData.companyName = companyDetection.suggestion.name;
      profileData.companyIndustry = companyDetection.suggestion.industry;
      profileData.aiConfidence = companyDetection.confidence;
      profileData.industry = companyDetection.suggestion.industry;
    }

    const userProfile = await UserProfile.create(profileData);

    // Create personal workspace
    const personalWorkspace = await Workspace.create({
      name: `${user.firstName}'s Personal Workspace`,
      description: 'Personal workspace for individual projects and learning',
      domain: user.emailDomain,
      type: 'personal',
      createdBy: user._id
    });

    // Add user as creator of personal workspace
    await WorkspaceMember.create({
      workspaceId: personalWorkspace._id,
      userId: user._id,
      role: 'creator'
    });

    // Send verification email
    try {
      const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'SamurAI Dojo - Verify Your Email',
        message: `Welcome to SamurAI Dojo! Please verify your email by clicking: ${verifyURL}`
      });
    } catch (error) {
      logger.error('Error sending verification email:', error);
      // Don't fail registration if email fails
    }

    // Log activity
    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified
        },
        profile: userProfile,
        workspace: personalWorkspace,
        companyDetection
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed. Please try again.'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findByEmail(email).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        status: 'fail',
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Get user profile and workspaces
    const [userProfile, workspaces] = await Promise.all([
      UserProfile.findOne({ userId: user._id }),
      WorkspaceMember.findUserMemberships(user._id)
    ]);

    logger.info(`User logged in: ${user.email}`);

    // Create and send token
    createSendToken(user, 200, res, 'Login successful');

    // Add additional data to response
    res.json({
      ...res.locals,
      data: {
        ...res.locals.data,
        profile: userProfile,
        workspaces: workspaces
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
router.post('/refresh-token', refreshToken);

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });

  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email verification failed'
    });
  }
});

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
router.post('/resend-verification', protect, async (req, res) => {
  try {
    if (req.user.emailVerified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    req.user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    req.user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await req.user.save({ validateBeforeSave: false });

    // Send verification email
    const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    await sendEmail({
      email: req.user.email,
      subject: 'SamurAI Dojo - Verify Your Email',
      message: `Please verify your email by clicking: ${verifyURL}`
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent'
    });

  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'SamurAI Dojo - Password Reset',
        message: `Reset your password by clicking: ${resetURL} (valid for 10 minutes)`
      });

      logger.info(`Password reset requested for: ${user.email}`);
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      logger.error('Error sending password reset email:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send password reset email'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password reset request failed'
    });
  }
});

// @desc    Reset password
// @route   PATCH /api/auth/reset-password/:token
// @access  Public
router.patch('/reset-password/:token', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match'
      });
    }

    // Validate password strength
    if (password.length < 8 || 
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = undefined;
    user.lockUntil = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    // Log user in automatically
    createSendToken(user, 200, res, 'Password reset successful');

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const [userProfile, workspaces] = await Promise.all([
      UserProfile.findOne({ userId: req.user._id }),
      WorkspaceMember.findUserMemberships(req.user._id)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
        profile: userProfile,
        workspaces: workspaces
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user data'
    });
  }
});

// @desc    Update current user password
// @route   PATCH /api/auth/update-password
// @access  Private
router.patch('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Current password, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'New passwords do not match'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8 || 
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      return res.status(400).json({
        status: 'fail',
        message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);

    createSendToken(user, 200, res, 'Password updated successfully');

  } catch (error) {
    logger.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password update failed'
    });
  }
});

module.exports = router;
