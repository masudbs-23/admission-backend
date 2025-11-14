const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  resendOTP,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  verifyOTPValidator,
  resendOTPValidator,
  forgotPasswordValidator,
  verifyPasswordResetOTPValidator,
  resetPasswordValidator,
} = require('../validators/authValidator');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting
router.post('/register', authLimiter, registerValidator, register);
router.post('/verify-otp', otpLimiter, verifyOTPValidator, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTPValidator, resendOTP);
router.post('/login', authLimiter, loginValidator, login);
router.post('/forgot-password', otpLimiter, forgotPasswordValidator, forgotPassword);
router.post('/verify-password-reset-otp', otpLimiter, verifyPasswordResetOTPValidator, verifyPasswordResetOTP);
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPassword);

module.exports = router;

