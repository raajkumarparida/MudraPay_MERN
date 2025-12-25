import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    const adminEmail = 'admin@mudrapay.com';
    
    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      
      // Update to admin if not already
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin');
      }
      
      mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new userModel({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      upiId: 'admin@mudra.pay',
      isAccountVerified: true,
      isAdmin: true,  // This is the key field
      balance: 1000000
    });

    await adminUser.save();
    
    console.log('\n🎉 ================================');
    console.log('   Admin user created successfully!');
    console.log('================================');
    console.log('📧 Email: admin@mudrapay.com');
    console.log('🔑 Password: admin123');
    console.log('💳 UPI ID: admin@mudra.pay');
    console.log('👑 Role: Admin');
    console.log('================================\n');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdminUser();