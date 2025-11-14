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

router.post('/register', registerValidator, register);
router.post('/verify-otp', verifyOTPValidator, verifyOTP);
router.post('/resend-otp', resendOTPValidator, resendOTP);
router.post('/login', loginValidator, login);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/verify-password-reset-otp', verifyPasswordResetOTPValidator, verifyPasswordResetOTP);
router.post('/reset-password', resetPasswordValidator, resetPassword);

module.exports = router;

