import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createAdminIfNotExists = async () => {
  const existing = await User.findOne({ role: 'admin' });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin@pass123', 10);
    const admin = new User({
      name: 'Samad Khan',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '9999999999',
    });

    await admin.save();
    console.log('✅ Admin created successfully');
  } else {
    console.log('✅ Admin already exists');
  }
};

export default createAdminIfNotExists;
