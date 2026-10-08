import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect);

router.get('/technicians', authorizeRoles('admin', 'warden'), async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician', isActive: true })
      .select('name email department')
      .sort('name');
    res.status(200).json({ success: true, data: technicians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pending', authorizeRoles('admin'), async (_req, res) => {
  try {
    const users = await User.find({ roleApproval: 'pending' })
      .select('name email requestedRole createdAt').sort({ createdAt: 1 });
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Could not load pending accounts.' });
  }
});

router.patch('/:id/role', authorizeRoles('admin'), async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid account ID.' });
  if (!['student', 'warden', 'technician', 'admin'].includes(req.body.role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, roleApproval: 'pending', isActive: true },
      { $set: { role: req.body.role, roleApproval: 'approved' } },
      { new: true, runValidators: true }
    ).select('name email role');
    if (!user) return res.status(409).json({ success: false, message: 'Account is no longer pending or is inactive. Refresh the list.' });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Could not assign the role.' });
  }
});

export default router;
