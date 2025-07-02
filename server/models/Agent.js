import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
      unique: true,
      sparse: true, // allows nulls with unique
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Invalid email format'],
      unique: true,
      sparse: true, // allows nulls with unique
    },
  },
  {
    timestamps: true,
    versionKey: false, // removes __v
  }
);

// 🔍 Index for search optimization
agentSchema.index({ name: 'text' });

export default mongoose.model('Agent', agentSchema);
