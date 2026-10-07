import express from 'express';
import { validateObjectId, validatePagination, validateTechnicianId } from '../middleware/validateRequest.js';
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
router.param('id', validateObjectId);
router.use(validatePagination);

router.use(protect);

// Technician only routes
router.get('/my', authorizeRoles('technician'), getMyAssignments);
router.patch('/:id/accept', authorizeRoles('technician'), acceptAssignment);
router.patch('/:id/start', authorizeRoles('technician'), startAssignment);
router.patch('/:id/resolve', authorizeRoles('technician'), resolveAssignment);

// Admin / Warden routes
router.patch('/:id/reassign', authorizeRoles('admin', 'warden'), validateTechnicianId, reassignTechnician);

export default router;
