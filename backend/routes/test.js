
const express = require('express');
const router = express.Router();

// Test endpoint to check backend connection
router.get('/', (req, res) => {
  console.log('Test endpoint called - Backend is running');
  res.json({
    success: true,
    message: 'Backend is running correctly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;