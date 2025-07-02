import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  phone: { type: String },
  address: { type: String },
  photo: { type: String }, // store filename
}, {
  timestamps: true, // optional: adds createdAt and updatedAt
});

export default mongoose.model('User', userSchema);
