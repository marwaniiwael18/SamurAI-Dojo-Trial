const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Admin dashboard
// @route   GET /api/admin
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin dashboard (placeholder)'
  });
});

module.exports = router;
