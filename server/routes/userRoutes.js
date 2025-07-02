import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// GET all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// PUT - Update user profile
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const update = { name, phone, address };

    if (req.file) {
      update.photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, select: '-password' }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});

export default router;
