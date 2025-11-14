const User = require('../models/User');
const { generateOTP, setOTPExpiry } = require('../utils/otpGenerator');
const { sendOTPEmail, sendPasswordResetOTPEmail } = require('../services/emailService');
const { generateToken } = require('../utils/jwt');
const {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  sendSuccess,
  sendError,
} = require('../constants/statusCodes');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
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
        return sendError(res, ERROR_MESSAGES.EMAIL_SEND_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      return sendError(res, error.message || ERROR_MESSAGES.SMTP_CONFIG_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.REGISTRATION_SUCCESS, null, HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, ERROR_MESSAGES.REGISTRATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (user.isVerified) {
      return sendError(res, ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED, HTTP_STATUS.BAD_REQUEST);
    }

    if (!user.otp || user.otp.code !== otp) {
      return sendError(res, ERROR_MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > user.otp.expiresAt) {
      return sendError(res, ERROR_MESSAGES.OTP_EXPIRED, HTTP_STATUS.BAD_REQUEST);
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, SUCCESS_MESSAGES.OTP_VERIFIED, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return sendError(res, ERROR_MESSAGES.OPERATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, ERROR_MESSAGES.INVALID_EMAIL_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isVerified) {
      return sendError(res, ERROR_MESSAGES.EMAIL_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, ERROR_MESSAGES.INVALID_EMAIL_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
    }

    // For students, check if email is verified
    if (user.role === 'student' && !user.isVerified) {
      return sendError(res, ERROR_MESSAGES.EMAIL_NOT_VERIFIED, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, ERROR_MESSAGES.OPERATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (user.isVerified) {
      return sendError(res, ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED, HTTP_STATUS.BAD_REQUEST);
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
        return sendError(res, ERROR_MESSAGES.EMAIL_SEND_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      return sendError(res, error.message || ERROR_MESSAGES.SMTP_CONFIG_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.OTP_RESENT);
  } catch (error) {
    console.error('Resend OTP error:', error);
    return sendError(res, ERROR_MESSAGES.OPERATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return sendSuccess(res, 'If an account exists with this email, a password reset OTP has been sent.');
    }

    // Only allow password reset for verified users
    if (!user.isVerified) {
      return sendError(res, ERROR_MESSAGES.PASSWORD_RESET_EMAIL_NOT_VERIFIED, HTTP_STATUS.BAD_REQUEST);
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
        return sendError(res, ERROR_MESSAGES.EMAIL_SEND_FAILED_PASSWORD_RESET, HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      return sendError(res, error.message || ERROR_MESSAGES.SMTP_CONFIG_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return sendSuccess(res, SUCCESS_MESSAGES.PASSWORD_RESET_REQUESTED);
  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, ERROR_MESSAGES.OPERATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!user.passwordResetOTP || user.passwordResetOTP.code !== otp) {
      return sendError(res, ERROR_MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > user.passwordResetOTP.expiresAt) {
      return sendError(res, ERROR_MESSAGES.OTP_EXPIRED_RESEND, HTTP_STATUS.BAD_REQUEST);
    }

    // OTP is valid, return success (password reset will happen in next step)
    return sendSuccess(res, SUCCESS_MESSAGES.PASSWORD_RESET_OTP_VERIFIED);
  } catch (error) {
    console.error('Verify password reset OTP error:', error);
    return sendError(res, ERROR_MESSAGES.OPERATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!user.passwordResetOTP || user.passwordResetOTP.code !== otp) {
      return sendError(res, ERROR_MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > user.passwordResetOTP.expiresAt) {
      return sendError(res, ERROR_MESSAGES.OTP_EXPIRED_RESEND, HTTP_STATUS.BAD_REQUEST);
    }

    // Update password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    await user.save();

    return sendSuccess(res, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
  } catch (error) {
    console.error('Reset password error:', error);
    return sendError(res, ERROR_MESSAGES.OPERATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
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

