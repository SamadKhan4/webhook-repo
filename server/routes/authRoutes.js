import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// =============================
// Admin or Employee Login
// =============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found');
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('✅ Login successful');
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// =============================
// Admin Registers an Employee
// =============================
router.post('/register-employee', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashed,
      role: 'employee',
    });

    await newUser.save();
    console.log(`✅ Employee registered: ${name}`);
    res.status(201).json({ message: 'Employee registered' });
  } catch (err) {
    console.error('❌ Registration failed:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

export default router;
