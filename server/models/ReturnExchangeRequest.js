const mongoose = require('mongoose');

const returnExchangeSchema = new mongoose.Schema({
  type: { type: String, enum: ['return', 'exchange'], required: true },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Employee
  originalItems: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: Number,
    }
  ],
  exchangeItems: [ // Only filled if it's an exchange
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: Number,
    }
  ],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminResponse: {
    note: String,
    responseDate: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReturnExchangeRequest', returnExchangeSchema);
