import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getMyAssignments,
  acceptAssignment,
  startAssignment,
  resolveAssignment,
  reassignTechnician
} from '../controllers/assignmentController.js';

const router = express.Router();

router.use(protect);

// Technician only routes
router.get('/my', authorizeRoles('technician'), getMyAssignments);
router.patch('/:id/accept', authorizeRoles('technician'), acceptAssignment);
router.patch('/:id/start', authorizeRoles('technician'), startAssignment);
router.patch('/:id/resolve', authorizeRoles('technician'), resolveAssignment);

// Admin / Warden routes
router.patch('/:id/reassign', authorizeRoles('admin', 'warden'), reassignTechnician);

export default router;
