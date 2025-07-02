import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  },
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: Number,
      price: Number,
      gst: Number,
    },
  ],
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  agentCommission: {
  type: Number,
  default: 0,
},
  createdAt: {
    type: Date,
    default: Date.now,  
  },
 employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  exchangeHistory: [
    {
      originalItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      newItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      date: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model('Bill', billSchema);
