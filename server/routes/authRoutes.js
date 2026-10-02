import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Test Endpoints
router.get('/test-auth', protect, (req, res) => {
  res.status(200).json({ message: 'You are authenticated' });
});

router.get('/test-admin', protect, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: 'Admin access' });
});

router.get('/test-staff', protect, authorizeRoles('admin', 'warden', 'technician'), (req, res) => {
  res.status(200).json({ message: 'Staff access' });
});

export default router;
