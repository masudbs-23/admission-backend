const User = require('../models/User');
const { generateOTP, setOTPExpiry } = require('../utils/otpGenerator');
const { sendOTPEmail, sendPasswordResetOTPEmail } = require('../services/emailService');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const otp = generateOTP();
    const otpExpiry = setOTPExpiry(10);

    const user = new User({
      email,
      password,
      otp: {
        code: otp,
        expiresAt: otpExpiry,
      },
      isVerified: false,
    });

    await user.save();

    try {
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP email. Please check your SMTP configuration.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // For students, check if email is verified
    if (user.role === 'student' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = setOTPExpiry(10);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };

    await user.save();

    try {
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP email',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP email. Please check your SMTP configuration.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP has been resent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset OTP has been sent.',
      });
    }

    // Only allow password reset for verified users
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first before resetting password',
      });
    }

    // Generate password reset OTP
    const otp = generateOTP();
    const otpExpiry = setOTPExpiry(10);

    user.passwordResetOTP = {
      code: otp,
      expiresAt: otpExpiry,
    };

    await user.save();

    try {
      const emailSent = await sendPasswordResetOTPEmail(email, otp);
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset OTP email',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send password reset OTP email. Please check your SMTP configuration.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message,
    });
  }
};

const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.passwordResetOTP || user.passwordResetOTP.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > user.passwordResetOTP.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new password reset.',
      });
    }

    // OTP is valid, return success (password reset will happen in next step)
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
    });
  } catch (error) {
    console.error('Verify password reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.passwordResetOTP || user.passwordResetOTP.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > user.passwordResetOTP.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new password reset.',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  resendOTP,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
};

