const express = require('express');
const router = express.Router();

// @desc    Detect company from domain
// @route   POST /api/companies/detect
// @access  Public
router.post('/detect', async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Company detection (placeholder)'
  });
});

module.exports = router;
