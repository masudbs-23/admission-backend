// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Success Messages
const SUCCESS_MESSAGES = {
  // Authentication
  REGISTRATION_SUCCESS: 'Registration successful. Please check your email for OTP verification.',
  OTP_VERIFIED: 'Email verified successfully',
  OTP_RESENT: 'OTP has been resent to your email. Please check your inbox.',
  LOGIN_SUCCESS: 'Login successful',
  PASSWORD_RESET_REQUESTED: 'Password reset OTP has been sent to your email. Please check your inbox.',
  PASSWORD_RESET_OTP_VERIFIED: 'OTP verified successfully. You can now reset your password.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully. You can now login with your new password.',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
  
  // Academic
  CERTIFICATE_UPLOADED: 'Certificate uploaded successfully',
  CERTIFICATE_DELETED: 'Certificate deleted successfully',
  ACADEMIC_INFO_FETCHED: 'Academic information fetched successfully',
  
  // Admin
  ADMIN_CREATED: 'Admin created successfully',
  ADMIN_LOGIN_SUCCESS: 'Admin login successful',
  STUDENTS_FETCHED: 'Students fetched successfully',
  STUDENT_FETCHED: 'Student details fetched successfully',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication
  USER_ALREADY_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  INVALID_EMAIL_PASSWORD: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  INVALID_OTP: 'Invalid OTP',
  OTP_EXPIRED: 'OTP has expired',
  OTP_EXPIRED_RESEND: 'OTP has expired. Please request a new password reset.',
  PASSWORD_RESET_EMAIL_NOT_VERIFIED: 'Please verify your email first before resetting password',
  
  // Profile
  PROFILE_UPDATE_FAILED: 'Profile update failed',
  PROFILE_FETCH_FAILED: 'Failed to fetch profile',
  
  // Academic
  INVALID_CERTIFICATE_TYPE: 'Invalid certificate type. Must be one of: bsc, msc, hsc, ssc, ielts',
  CERTIFICATE_REQUIRED: 'Please upload a certificate file',
  CERTIFICATE_NOT_FOUND: 'Certificate not found',
  ACADEMIC_INFO_UPDATE_FAILED: 'Academic info update failed',
  ACADEMIC_INFO_FETCH_FAILED: 'Failed to fetch academic info',
  CERTIFICATE_DELETE_FAILED: 'Failed to delete certificate',
  
  // Admin
  ADMIN_ALREADY_EXISTS: 'User already exists with this email',
  ADMIN_CREATE_FAILED: 'Failed to create admin',
  ADMIN_LOGIN_FAILED: 'Admin login failed',
  ACCESS_DENIED: 'Access denied. Admin access required.',
  INSUFFICIENT_PERMISSIONS: 'Access denied. Insufficient permissions.',
  STUDENTS_FETCH_FAILED: 'Failed to fetch students',
  STUDENT_FETCH_FAILED: 'Failed to fetch student',
  
  // Email
  EMAIL_SEND_FAILED: 'Failed to send OTP email',
  EMAIL_SEND_FAILED_PASSWORD_RESET: 'Failed to send password reset OTP email',
  SMTP_CONFIG_ERROR: 'Failed to send OTP email. Please check your SMTP configuration.',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_TOKEN: 'Invalid token',
  NO_TOKEN_PROVIDED: 'No token provided',
  UNAUTHORIZED: 'Unauthorized',
  
  // General
  REGISTRATION_FAILED: 'Registration failed',
  OPERATION_FAILED: 'Operation failed',
  INTERNAL_ERROR: 'Something went wrong!',
};

// Response Helper Functions
const sendSuccess = (res, message, data = null, statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, message, statusCode = HTTP_STATUS.BAD_REQUEST, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  sendSuccess,
  sendError,
};

