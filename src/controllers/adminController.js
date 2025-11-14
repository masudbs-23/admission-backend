const User = require('../models/User');
const Profile = require('../models/Profile');
const AcademicInfo = require('../models/AcademicInfo');
const { generateToken } = require('../utils/jwt');
const { generateOTP, setOTPExpiry } = require('../utils/otpGenerator');
const { sendOTPEmail } = require('../services/emailService');

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

// Get all students list
const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all students with their profiles and academic info
    const students = await User.find({ role: 'student' })
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'student' });

    // Get profiles and academic info for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const profile = await Profile.findOne({ userId: student._id });
        const academicInfo = await AcademicInfo.findOne({ userId: student._id });

        return {
          id: student._id,
          email: student.email,
          isVerified: student.isVerified,
          createdAt: student.createdAt,
          profile: profile || null,
          academicInfo: academicInfo || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        students: studentsWithDetails,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStudents: total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

// Get single student details
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findOne({ _id: studentId, role: 'student' }).select('-password -otp');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const profile = await Profile.findOne({ userId: student._id });
    const academicInfo = await AcademicInfo.findOne({ userId: student._id });

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          email: student.email,
          isVerified: student.isVerified,
          createdAt: student.createdAt,
          profile: profile || null,
          academicInfo: academicInfo || null,
        },
      },
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message,
    });
  }
};

module.exports = {
  createAdmin,
  adminLogin,
  getAllStudents,
  getStudentById,
};

