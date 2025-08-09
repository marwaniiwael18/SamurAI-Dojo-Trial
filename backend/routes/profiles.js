const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Get user profile
// @route   GET /api/profiles/current
// @access  Private
router.get('/current', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Get current profile (placeholder)'
  });
});

// @desc    Update user profile
// @route   PUT /api/profiles/current
// @access  Private
router.put('/current', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Update profile (placeholder)'
  });
});

module.exports = router;
