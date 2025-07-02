import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {                     // renamed from "contact" to "phone"
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  suppliedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  }],
});

export default mongoose.model('Vendor', vendorSchema);
