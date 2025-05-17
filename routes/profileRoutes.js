const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// View your own profile
router.get('/profile', ensureAuth, profileController.getProfilePage);

// Edit profile (GET form)
router.get('/profile/edit', ensureAuth, profileController.getEditProfile);

// Edit profile (POST form submission with profilePic upload)
router.post('/profile/edit', ensureAuth, upload.single('profilePic'), profileController.updateProfile);

// View another user's profile (must come last to avoid conflicts)
router.get('/profile/:userId', ensureAuth, profileController.getUserProfilePage);
module.exports = router;