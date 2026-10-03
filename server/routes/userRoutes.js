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

export default router;
