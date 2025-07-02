import express from 'express';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const customers = await Customer.countDocuments();
    const employees = await User.countDocuments({ role: 'employee' });
    const bills = await Bill.find();
    const pendingBills = bills.filter(b => b.status === 'pending').length;
    const totalSales = bills.reduce((sum, b) => sum + b.total, 0);

    res.json({
      customers,
      employees,
      bills: bills.length,
      pendingBills,
      totalSales,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
