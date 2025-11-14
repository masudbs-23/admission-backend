const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createAdmin,
  adminLogin,
  getAllStudents,
  getStudentById,
} = require('../controllers/adminController');
const { createAdminValidator, adminLoginValidator } = require('../validators/adminValidator');

// Admin login (public route)
router.post('/login', adminLoginValidator, adminLogin);

// Super admin creates admin (only super_admin can access)
router.post('/create', authenticate, authorize('super_admin'), createAdminValidator, createAdmin);

// Get all students (admin and super_admin can access)
router.get('/students', authenticate, authorize('admin', 'super_admin'), getAllStudents);

// Get single student details (admin and super_admin can access)
router.get('/students/:studentId', authenticate, authorize('admin', 'super_admin'), getStudentById);

module.exports = router;

