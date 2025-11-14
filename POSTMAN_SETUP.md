# Postman Collection Setup Guide

## Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Admission_System_API.postman_collection.json`
4. Click **Import**

## Environment Variables Setup

### Create Environment

1. Click **Environments** in the left sidebar
2. Click **+** to create a new environment
3. Name it: `Admission System Local` or `Admission System Production`

### Add Variables

Add these variables to your environment:

| Variable | Initial Value | Current Value | Description |
|----------|--------------|---------------|-------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` | API base URL |
| `student_token` | (empty) | (empty) | JWT token from student login |
| `admin_token` | (empty) | (empty) | JWT token from admin login |
| `super_admin_token` | (empty) | (empty) | JWT token from super admin login |

### Select Environment

1. Select your created environment from the dropdown (top right)
2. All requests will now use these variables

## Usage Instructions

### 1. Authentication Flow

#### Student Registration & Login:
1. **Register** - Create a new student account
   - Copy the response (you'll get a success message)
   
2. **Verify OTP** - Check email for OTP and verify
   - Copy the `token` from response
   - Paste it in environment variable `student_token`
   
3. **Login** - Login with email and password
   - Copy the `token` from response
   - Update `student_token` in environment

#### Resend OTP (if expired):
- Use **Resend OTP** endpoint if OTP expires during registration

#### Forgot Password Flow:
1. **Forgot Password** - Request password reset OTP
2. **Verify Password Reset OTP** - Verify the OTP received
3. **Reset Password** - Set new password with verified OTP

### 2. Profile Management

After login, use these endpoints:
- **Get Profile** - View your profile
- **Get Profile Percentage** - Check completion percentage
- **Update Profile** - Update profile with image upload
  - Use form-data mode
  - Add image file in the `image` field
  - Max file size: 10MB

### 3. Academic Information

- **Get Academic Info** - View all certificates
- **Upload Certificate** - Upload certificate (BSC, MSC, HSC, SSC, IELTS)
  - Use form-data mode
  - Set `certificateType`: bsc, msc, hsc, ssc, or ielts
  - Add certificate file (image or PDF, max 10MB)
- **Delete Certificate** - Delete a specific certificate

### 4. Admin Features

#### Admin Login:
1. **Admin Login** - Login as admin or super admin
   - Copy the `token` from response
   - Update `admin_token` or `super_admin_token` in environment

#### Super Admin Only:
- **Create Admin** - Create new admin user (requires super admin token)

#### Admin & Super Admin:
- **Get All Students** - View all students with pagination
  - Query params: `page` and `limit` (optional)
- **Get Student by ID** - View specific student details
  - Replace `:studentId` with actual student UUID

## Quick Start Workflow

1. **Setup Environment Variables**
   ```
   base_url = http://localhost:5000
   ```

2. **Create Super Admin** (First time only)
   ```bash
   npm run create-super-admin
   ```

3. **Admin Login**
   - Use Admin Login endpoint
   - Copy token to `admin_token` or `super_admin_token`

4. **Student Registration**
   - Register → Verify OTP → Login
   - Copy token to `student_token`

5. **Test All Endpoints**
   - All endpoints are now ready to use with tokens

## Tips

- **Token Management**: After login, always update the token in environment variables
- **File Uploads**: For profile image and certificates, use form-data mode
- **Error Handling**: Check response status and error messages
- **OTP Expiry**: OTP expires in 10 minutes, use resend if needed

## Response Examples

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Notes

- All protected routes require `Authorization: Bearer <token>` header
- File uploads have 10MB size limit
- OTP expires in 10 minutes
- UUIDs are used for all IDs (not MongoDB ObjectId)
- All user files are uploaded to Cloudinary

