import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Item from '../models/Item.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/items';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Get all items (for exchange list)
router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const items = await Item.find({ name: { $regex: q, $options: 'i' } }).limit(10);
  res.json({ items });
});


// GET - All items with vendor info + search + pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ],
    };

    // Optional category filtering
    if (category) {
      query.category = category;
    }

    // If search matches vendor name
    const matchingVendors = await Vendor.find({ name: { $regex: search, $options: 'i' } }, '_id');
    if (matchingVendors.length > 0) {
      query.$or.push({ vendor: { $in: matchingVendors.map(v => v._id) } });
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('vendor', 'name')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('❌ Failed to fetch items:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await Item.find(); // You can add filters if needed
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// POST - Create new item
router.post('/', upload.single('photo'), async (req, res) => {
  const { name, price, gst, stock, vendor, category, commissionApplicable, commissionRate } = req.body;

  if (!name || !price || !gst || !stock || !vendor || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const vendorExists = await Vendor.findById(vendor);
    if (!vendorExists) return res.status(404).json({ error: 'Vendor not found' });

    const newItem = new Item({
      name,
      price,
      gst,
      stock,
      vendor,
      category,
      photo: req.file?.filename || '',
      commissionApplicable: commissionApplicable === 'true' || commissionApplicable === true,
      commissionRate: Number(commissionRate) || 0,
    });

    await newItem.save();

    if (!vendorExists.items) {
  vendorExists.items = [];
}
vendorExists.items.push(newItem._id);
await vendorExists.save();

    res.status(201).json(newItem);
  } catch (err) {
    console.error('❌ Failed to add item:', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// PUT - Update item
router.put('/:id', upload.single('photo'), async (req, res) => {
  const { name, price, gst, stock, vendor, category, commissionApplicable, commissionRate } = req.body;

  if (!name || !price || !gst || !stock || !vendor || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const vendorExists = await Vendor.findById(vendor);
    if (!vendorExists) return res.status(404).json({ error: 'Vendor not found' });

    if (item.vendor.toString() !== vendor) {
      await Vendor.findByIdAndUpdate(item.vendor, { $pull: { items: item._id } });
      vendorExists.items.push(item._id);
      await vendorExists.save();
    }

    Object.assign(item, {
      name,
      price,
      gst,
      stock,
      vendor,
      category,
      commissionApplicable: commissionApplicable === 'true' || commissionApplicable === true,
      commissionRate: Number(commissionRate) || 0,
    });

    if (req.file) item.photo = req.file.filename;

    await item.save();

    res.status(200).json({ message: 'Item updated successfully', item });
  } catch (err) {
    console.error('❌ Failed to update item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE - Remove item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await Vendor.findByIdAndUpdate(item.vendor, { $pull: { items: item._id } });
    await item.deleteOne();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// GET - Low stock items
router.get('/stock/low', async (req, res) => {
  try {
    const lowStockItems = await Item.find({ stock: { $lt: 10 } })
      .populate('vendor', 'name')
      .sort({ stock: 1 })
      .lean();

    res.status(200).json(lowStockItems);
  } catch (err) {
    console.error('❌ Failed to fetch low stock items:', err);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

export default router;
