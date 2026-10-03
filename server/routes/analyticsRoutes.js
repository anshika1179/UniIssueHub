import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getOverview,
  getCategories,
  getPriorities,
  getStatusStats,
  getTrends,
  getResolutionTime,
  getTechnicians
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics require authentication
router.use(protect);

// Student is explicitly denied full analytics dashboard endpoints.
// Only admin and warden can see system-wide analytics.
router.get('/overview', authorizeRoles('admin', 'warden'), getOverview);
router.get('/categories', authorizeRoles('admin', 'warden'), getCategories);
router.get('/priorities', authorizeRoles('admin', 'warden'), getPriorities);
router.get('/status', authorizeRoles('admin', 'warden'), getStatusStats);
router.get('/trends', authorizeRoles('admin', 'warden'), getTrends);
router.get('/resolution-time', authorizeRoles('admin', 'warden'), getResolutionTime);

// Technicians can hit this endpoint, but controller filters to only THEIR data. Admin/Warden see all.
router.get('/technicians', authorizeRoles('admin', 'warden', 'technician'), getTechnicians);

export default router;
