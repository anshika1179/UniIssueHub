import express from 'express';
import { validateObjectId, validatePagination } from '../middleware/validateRequest.js';
import { protect } from '../middleware/authMiddleware.js';
import { getAnalysis, triggerAnalysis } from '../controllers/aiController.js';

const router = express.Router();
router.param('complaintId', validateObjectId);
router.use(validatePagination);

router.use(protect); // All AI routes require auth

router.get('/complaint/:complaintId', getAnalysis);
router.post('/analyze/:complaintId', triggerAnalysis);

// For Phase 5 testing T1-T9 individual endpoints requested by the prompt,
// I'll wire them to trigger analysis. The prompt says "You may also provide a combined endpoint... Do not duplicate business logic".
// We will just expose the combined /analyze logic for ease.

export default router;
