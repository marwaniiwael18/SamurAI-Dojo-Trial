const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User profile updated (placeholder)'
  });
});

module.exports = router;
