const express = require('express');
const router = express.Router();
const ReturnExchangeRequest = require('../models/ReturnExchangeRequest');
const Bill = require('../models/Bill');

// 🧑‍💼 EMPLOYEE: Create new return/exchange request
router.post('/create', async (req, res) => {
  try {
    const { type, billId, customerId, createdBy, originalItems, exchangeItems } = req.body;

    const request = new ReturnExchangeRequest({
      type,
      billId,
      customerId,
      createdBy,
      originalItems,
      exchangeItems
    });

    await request.save();
    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Error creating request' });
  }
});

// 👨‍💼 ADMIN: Get all pending requests
router.get('/admin/pending', async (req, res) => {
  try {
    const requests = await ReturnExchangeRequest.find({ status: 'pending' })
      .populate('billId')
      .populate('createdBy', 'name')
      .populate('customerId', 'name');

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching requests' });
  }
});

// 👨‍💼 ADMIN: Approve or reject a request
router.put('/admin/respond/:id', async (req, res) => {
  try {
    const { status, note } = req.body;
    const request = await ReturnExchangeRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminResponse: { note, responseDate: new Date() }
      },
      { new: true }
    );
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Error updating request' });
  }
});

// 📜 HISTORY: All requests (admin view)
router.get('/admin/history', async (req, res) => {
  try {
    const history = await ReturnExchangeRequest.find()
      .populate('billId')
      .populate('customerId', 'name')
      .populate('createdBy', 'name');

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching history' });
  }
});

// 👷‍♂️ EMPLOYEE: Fetch employee’s own requests
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const data = await ReturnExchangeRequest.find({ createdBy: req.params.employeeId })
      .populate('billId')
      .populate('customerId', 'name');

    res.json({ requests: data });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching requests' });
  }
});




module.exports = router;
