import express from 'express';
import Customer from '../models/Customer.js';
import Bill from '../models/Bill.js';

const router = express.Router();

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({}, 'name phone').sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    console.error('Customer fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});


// ✅ GET all customers (sorted by name)
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// ✅ GET bills by customer ID
router.get('/:id/bills', async (req, res) => {
  try {
    const bills = await Bill.find({ customer: req.params.id })
      .populate('createdBy', 'name')
      .populate('agent', 'name');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});



// ✅ POST - Create/Add a new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Customer already exists with this phone number' });
    }

    const newCustomer = new Customer({ name, phone, address });
    await newCustomer.save();
    res.status(201).json({ message: 'Customer added successfully', customer: newCustomer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// ✅ DELETE - Remove a customer by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
