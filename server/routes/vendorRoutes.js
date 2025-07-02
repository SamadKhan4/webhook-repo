import express from 'express';
import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';

const router = express.Router();

// GET all vendors with their items
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    const data = await Promise.all(
      vendors.map(async (vendor) => {
        const items = await Item.find({ vendor: vendor._id }).select('name price stock');
        return {
          ...vendor._doc,
          items,
        };
      })
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// ADD a new vendor
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newVendor = new Vendor({ name, email, phone });
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// DELETE a vendor
router.delete('/:id', async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    await Item.deleteMany({ vendor: req.params.id }); // optional: delete their items
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// UPDATE stock of an item for a vendor
router.put('/:vendorId/items/:itemId/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const item = await Item.findOneAndUpdate(
      { _id: req.params.itemId, vendor: req.params.vendorId },
      { stock },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found for this vendor' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item stock' });
  }
});

export default router;
