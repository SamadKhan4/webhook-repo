import express from 'express';
import Agent from '../models/Agent.js';
import Bill from '../models/Bill.js';

const router = express.Router();

// ✅ Get all agents with total bills and commission
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find();
    const enriched = await Promise.all(
      agents.map(async (agent) => {
        const bills = await Bill.find({ agent: agent._id });
        const totalCommission = bills.reduce((sum, b) => sum + (b.agentCommission || 0), 0);
        return {
          ...agent.toObject(),
          totalBills: bills.length,
          totalCommission,
        };
      })
    );
    res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ Error fetching agents:', err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// ✅ Search agents by name
router.get('/search', async (req, res) => {
  try {
    const name = req.query.name || '';
    const agents = await Agent.find({ name: { $regex: name, $options: 'i' } });
    res.status(200).json(agents);
  } catch (err) {
    console.error('❌ Agent search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.status(200).json(agent);
  } catch (err) {
    console.error('❌ Agent fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// ✅ Agent commission history
router.get('/commission/:id', async (req, res) => {
  try {
    const bills = await Bill.find({ agent: req.params.id })
      .populate('customer', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const totalCommission = bills.reduce((sum, b) => sum + (b.agentCommission || 0), 0);

    res.status(200).json({
      bills,
      totalBills: bills.length,
      totalCommission,
    });
  } catch (err) {
    console.error('❌ Commission fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch commission data' });
  }
});

// ✅ Add agent
router.post('/', async (req, res) => {
  const { name, phone, email } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const agent = new Agent({ name: name.trim(), phone, email });
    await agent.save();
    res.status(201).json({ message: 'Agent added', agent });
  } catch (err) {
    console.error('❌ Add agent error:', err);
    res.status(500).json({ error: 'Failed to add agent' });
  }
});

// ✅ Delete agent
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Agent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Agent not found' });
    res.status(200).json({ message: 'Agent deleted' });
  } catch (err) {
    console.error('❌ Delete agent error:', err);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;
