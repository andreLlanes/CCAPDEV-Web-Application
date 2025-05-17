const express = require('express');
const router = express.Router();

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    layout:'main',
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    layout:'main',
  });
});

module.exports = router;