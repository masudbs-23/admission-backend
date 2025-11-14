const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfile, getProfile, getProfilePercentage } = require('../controllers/profileController');
const { updateProfileValidator } = require('../validators/profileValidator');

router.get('/', authenticate, getProfile);
router.get('/percentage', authenticate, getProfilePercentage);
router.put('/', authenticate, upload.single('image'), updateProfileValidator, updateProfile);

module.exports = router;

