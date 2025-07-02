import express from 'express';
import Employee from '../models/User.js';
import Bill from '../models/Bill.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({ role: 'employee' });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

router.get('/:id/bills', async (req, res) => {
  try {
    const bills = await Bill.find({ createdBy: req.params.id }).populate('customer agent');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee bills' });
  }
});

export default router;
