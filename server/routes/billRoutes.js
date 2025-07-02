import express from 'express';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Item from '../models/Item.js';

const router = express.Router();

// ✅ POST - Create new bill with optional agent and commission cap
router.post('/', async (req, res) => {
  try {
    const { customer, agent, createdBy, items, commissionCap } = req.body;

    let subtotal = 0;
    let gstAmount = 0;
    let commissionTotal = 0;

    const enrichedItems = [];

    for (const item of items) {
      const dbItem = await Item.findById(item.item);
      if (!dbItem) {
        return res.status(404).json({ error: `Item not found: ${item.item}` });
      }

      if (dbItem.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for item: ${dbItem.name}` });
      }

      const price = item.price;
      const quantity = item.quantity;
      const itemGST = (price * quantity * dbItem.gst) / 100;
      const itemTotal = price * quantity;

      subtotal += itemTotal;
      gstAmount += itemGST;

      // ✅ Commission calculation for commissionApplicable items
      if (agent && dbItem.commissionApplicable) {
        const itemCommission = itemTotal * 0.1; // 10%
        commissionTotal += itemCommission;
        console.log(`✅ ${dbItem.name}: ₹${itemTotal} → Commission: ₹${itemCommission.toFixed(2)}`);
      }

      // ✅ Reduce stock
      dbItem.stock -= quantity;
      await dbItem.save();

      // ✅ Add to enriched bill items
      enrichedItems.push({
        item: dbItem._id,
        name: dbItem.name,
        quantity,
        price,
      });
    }

    const total = subtotal + gstAmount;

    // ✅ Final commission after applying cap if needed
    let finalCommission = commissionTotal;
    if (agent && commissionCap && commissionTotal > commissionCap) {
      console.log(`⚠️ Commission exceeds cap. Capping from ₹${commissionTotal} to ₹${commissionCap}`);
      finalCommission = commissionCap;
    }

    const newBill = new Bill({
      customer,
      agent: agent || null,
      createdBy,
      items: enrichedItems,
      subtotal,
      gst: gstAmount,
      total,
      status: 'pending',
      agentCommission: agent ? finalCommission : 0,
    });

    await newBill.save();
    console.log(`✅ Bill created with commission: ₹${finalCommission}`);
    res.status(201).json(newBill);
  } catch (err) {
    console.error('❌ Error creating bill:', err);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// ✅ GET - All bills (with optional employee/status filters)
// ✅ GET - All bills with optional employee or customer filter
router.get('/', async (req, res) => {
  try {
    const { customerId, employee, status } = req.query;
    const query = {};

    if (customerId) query.customer = customerId; // ✔️ This is enough if customer is a ref
    if (employee) query.createdBy = employee;
    if (status) query.status = status;

    const bills = await Bill.find(query)
      .populate('customer')
      .populate('createdBy')
      .populate('items.item'); // Optional: useful if needed in FE

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET - Single bill by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customer')
      .populate('agent')
      .populate('createdBy', 'name')
      .populate('items.item');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (err) {
    console.error('❌ Error fetching bill by ID:', err);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

router.get('/', async (req, res) => {
  const { customer } = req.query;

  const query = {};
  if (customer) query.customer = customer;

  try {
    const bills = await Bill.find(query)
      .populate('customer')
      .populate('items.item')
      .populate('createdBy')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    console.error('❌ Error getting bills:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('items.item');
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Bill not found' });
  }
});




// ✅ PUT - Update bill status (paid/pending)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['paid', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updated = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating bill status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
