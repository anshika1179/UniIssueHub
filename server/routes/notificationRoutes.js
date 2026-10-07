/**
 * Notification Routes — server/routes/notificationRoutes.js
 */

import express from 'express';
import { validateObjectId, validatePagination } from '../middleware/validateRequest.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();
router.param('id', validateObjectId);
router.use(validatePagination);

router.use(protect); // All routes require auth

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
