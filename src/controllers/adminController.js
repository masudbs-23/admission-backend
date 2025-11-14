const User = require('../models/User');
const Profile = require('../models/Profile');
const AcademicInfo = require('../models/AcademicInfo');
const { generateToken } = require('../utils/jwt');
const { generateOTP, setOTPExpiry } = require('../utils/otpGenerator');
const { sendOTPEmail } = require('../services/emailService');
const { getStudentsWithDetailsOptimized, getStudentByIdOptimized } = require('../helpers/queryOptimizer');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  sendSuccess,
  sendError,
} = require('../constants/statusCodes');

// Super Admin creates Admin
const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create admin user (no OTP needed for admin)
    const admin = new User({
      email,
      password,
      role: 'admin',
      isVerified: true, // Admin doesn't need email verification
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message,
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is admin or super_admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin access required.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message,
    });
  }
};

// Get all students list (Optimized with aggregation)
const getAllStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page

  const result = await getStudentsWithDetailsOptimized(User, Profile, AcademicInfo, page, limit);

  return sendSuccess(res, SUCCESS_MESSAGES.STUDENTS_FETCHED, result);
});

// Get single student details (Optimized with aggregation)
const getStudentById = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await getStudentByIdOptimized(User, Profile, AcademicInfo, studentId);
  
  if (!student) {
    return sendError(res, ERROR_MESSAGES.STUDENT_FETCH_FAILED, HTTP_STATUS.NOT_FOUND);
  }

  return sendSuccess(res, SUCCESS_MESSAGES.STUDENT_FETCHED, { student });
});

module.exports = {
  createAdmin,
  adminLogin,
  getAllStudents,
  getStudentById,
};

