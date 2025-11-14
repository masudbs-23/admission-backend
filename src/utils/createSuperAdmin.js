const User = require('../models/User');
const connectDB = require('../config/database');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@admission.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists!');
      process.exit(0);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User with this email already exists!');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      email,
      password,
      role: 'super_admin',
      isVerified: true,
    });

    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();

