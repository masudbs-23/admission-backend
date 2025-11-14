# Admission System API

A comprehensive student admission system with email/password registration, OTP verification, profile management, academic certificate uploads, and admin panel.

## Features

- **User Authentication**
  - Email and password registration
  - Beautiful 4-digit OTP verification via email (SMTP)
  - Secure login with JWT tokens
  - Role-based access control (Student, Admin, Super Admin)

- **Profile Management**
  - Update profile information (name, image, address, phone, email)
  - Profile completion percentage tracking
  - Image upload with Cloudinary (10MB limit)

- **Academic Information**
  - Upload certificates (BSC, MSC, HSC, SSC, IELTS)
  - Support for images and PDF files
  - Cloudinary integration with 10MB file size limit

- **Admin Panel**
  - Super Admin can create Admin users
  - Admin and Super Admin can view all students
  - Role-based authentication and authorization

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Cloudinary (for file uploads)
- Nodemailer (for OTP emails)
- JWT (for authentication)
- Bcrypt (for password hashing)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - MongoDB connection string
   - JWT secret
   - Cloudinary credentials
   - SMTP credentials for email
   - Super Admin credentials (optional)

4. Create the first Super Admin (optional):
```bash
npm run create-super-admin
```

5. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123" }`

- `POST /api/auth/verify-otp` - Verify OTP
  - Body: `{ "email": "user@example.com", "otp": "1234" }`

- `POST /api/auth/resend-otp` - Resend OTP (if expired during registration)
  - Body: `{ "email": "user@example.com" }`

- `POST /api/auth/login` - Login
  - Body: `{ "email": "user@example.com", "password": "password123" }`

- `POST /api/auth/forgot-password` - Request password reset OTP
  - Body: `{ "email": "user@example.com" }`

- `POST /api/auth/verify-password-reset-otp` - Verify password reset OTP
  - Body: `{ "email": "user@example.com", "otp": "1234" }`

- `POST /api/auth/reset-password` - Reset password with new password
  - Body: `{ "email": "user@example.com", "otp": "1234", "newPassword": "newpassword123" }`

### Profile

- `GET /api/profile` - Get user profile (requires authentication)
- `GET /api/profile/percentage` - Get profile completion percentage (requires authentication)
- `PUT /api/profile` - Update profile (requires authentication)
  - Body: `{ "name": "John Doe", "email": "john@example.com", "phone": "1234567890", "address": "123 Main St" }`
  - Form-data: `image` (file, max 10MB)

### Academic Information

- `GET /api/academic` - Get academic information (requires authentication)
- `POST /api/academic/upload` - Upload certificate (requires authentication)
  - Form-data: `certificate` (file, max 10MB), `certificateType` (bsc|msc|hsc|ssc|ielts)
- `DELETE /api/academic/:certificateType` - Delete certificate (requires authentication)

### Admin Routes

- `POST /api/admin/login` - Admin login
  - Body: `{ "email": "admin@example.com", "password": "password123" }`
  - Returns: JWT token with role

- `POST /api/admin/create` - Create new admin (Super Admin only)
  - Headers: `Authorization: Bearer <super-admin-token>`
  - Body: `{ "email": "admin@example.com", "password": "password123" }`

- `GET /api/admin/students` - Get all students list (Admin/Super Admin only)
  - Headers: `Authorization: Bearer <admin-token>`
  - Query params: `?page=1&limit=10` (optional)

- `GET /api/admin/students/:studentId` - Get single student details (Admin/Super Admin only)
  - Headers: `Authorization: Bearer <admin-token>`

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **student**: Default role for registered users. Requires email verification.
- **admin**: Can view all students. Created by Super Admin.
- **super_admin**: Can create admins and view all students. First super admin created via script.

## Project Structure

```
src/
├── config/          # Database and Cloudinary configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication and upload middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # External services (email, cloudinary)
├── utils/           # Utility functions
├── validators/      # Request validation
└── server.js        # Express app entry point
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `SMTP_HOST` - SMTP server host (default: smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username (your email)
- `SMTP_PASS` - SMTP password (app password for Gmail)
- `SUPER_ADMIN_EMAIL` - Super admin email (optional, default: superadmin@admission.com)
- `SUPER_ADMIN_PASSWORD` - Super admin password (optional, default: SuperAdmin123!)

