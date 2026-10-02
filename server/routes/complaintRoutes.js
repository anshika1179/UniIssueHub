import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  getComplaintHistory
} from '../controllers/complaintController.js';

const router = express.Router();

router.use(protect); // All complaint routes require auth

router.route('/')
  .post(createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaint);

router.route('/:id/history')
  .get(getComplaintHistory);

export default router;
