const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Get user workspaces
// @route   GET /api/workspaces
// @access  Private
router.get('/', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Get workspaces (placeholder)'
  });
});

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
router.post('/', protect, async (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Create workspace (placeholder)'
  });
});

module.exports = router;
