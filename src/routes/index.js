const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const academicRoutes = require('./academicRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/academic', academicRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

