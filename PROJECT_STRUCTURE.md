# Project Structure Documentation

## 📁 Folder Structure

```
src/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection with pooling
│   └── cloudinary.js    # Cloudinary configuration
│
├── constants/           # Application constants
│   └── statusCodes.js   # HTTP status codes, messages, helpers
│
├── controllers/         # Request handlers (Business logic)
│   ├── authController.js
│   ├── profileController.js
│   ├── academicController.js
│   └── adminController.js
│
├── helpers/             # Helper functions
│   └── queryOptimizer.js # Database query optimizations
│
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── upload.js        # File upload middleware
│   ├── errorHandler.js  # Error handling middleware
│   ├── rateLimiter.js   # Rate limiting
│   └── requestLogger.js # Request logging
│
├── models/              # Mongoose models
│   ├── User.js
│   ├── Profile.js
│   └── AcademicInfo.js
│
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── academicRoutes.js
│   ├── adminRoutes.js
│   └── index.js
│
├── services/            # External services
│   ├── emailService.js  # Email sending service
│   └── cloudinaryService.js # File upload service
│
├── utils/               # Utility functions
│   ├── jwt.js           # JWT token utilities
│   ├── otpGenerator.js  # OTP generation
│   ├── calculateProfilePercentage.js
│   ├── createSuperAdmin.js
│   ├── fixDatabaseIndexes.js
│   └── logger.js        # Winston logger
│
├── validators/          # Request validation
│   ├── authValidator.js
│   ├── profileValidator.js
│   └── adminValidator.js
│
└── server.js            # Express app entry point
```

## 🚀 Performance Optimizations

### 1. Database Connection Pooling
- Max pool size: 10 connections
- Connection timeout: 5 seconds
- Socket timeout: 45 seconds
- Disabled mongoose buffering

### 2. Query Optimization
- **Aggregation Pipeline**: Used for complex queries (getAllStudents)
- **Indexed Queries**: Email field has unique index
- **Selective Fields**: Only fetch required fields
- **Parallel Queries**: Use Promise.all for independent queries

### 3. Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **OTP Endpoints**: 3 requests per 15 minutes

### 4. Security
- **Helmet**: HTTP security headers
- **CORS**: Configurable origin
- **Request Size Limit**: 10MB max
- **Input Validation**: express-validator

### 5. Logging
- **Winston Logger**: Structured logging
- **Request Logging**: All requests logged with timing
- **Error Logging**: Detailed error logs
- **Log Files**: Separate error and combined logs

## 📊 Best Practices

### Error Handling
- Custom AppError class
- Centralized error handler
- Async handler wrapper
- Proper HTTP status codes

### Code Organization
- Separation of concerns
- Reusable helper functions
- Consistent naming conventions
- Status codes in constants

### Database
- Connection pooling
- Query optimization
- Proper indexing
- Aggregation pipelines

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT secret key
- `CLOUDINARY_*`: Cloudinary credentials
- `SMTP_*`: Email service credentials
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (info/error/debug)
- `CORS_ORIGIN`: Allowed CORS origins

## 📈 Monitoring

### Logs Location
- `logs/error.log`: Error logs only
- `logs/combined.log`: All logs

### Health Check
- Endpoint: `GET /health`
- Returns: Server status, uptime, timestamp

## 🛡️ Security Features

1. **Helmet**: Security headers
2. **Rate Limiting**: Prevent abuse
3. **Input Validation**: Sanitize inputs
4. **JWT Authentication**: Secure tokens
5. **Password Hashing**: bcrypt
6. **CORS**: Controlled access

