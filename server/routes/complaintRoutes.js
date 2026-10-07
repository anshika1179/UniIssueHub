import express from 'express';
import { validateObjectId, validatePagination, validateTechnicianId } from '../middleware/validateRequest.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  getComplaintHistory,
  closeComplaint
} from '../controllers/complaintController.js';
import {
  assignTechnician,
  getAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();
router.param('id', validateObjectId);
router.use(validatePagination);

router.use(protect); // All complaint routes require auth

router.route('/')
  .post(createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaint);

router.route('/:id/history')
  .get(getComplaintHistory);

// Phase 4 additions
router.route('/:id/assign')
  .post(authorizeRoles('admin', 'warden'), validateTechnicianId, assignTechnician);

router.route('/:id/assignment')
  .get(getAssignment);

router.route('/:id/close')
  .patch(authorizeRoles('admin', 'warden'), closeComplaint);

export default router;
