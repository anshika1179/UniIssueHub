/**
 * Notification Service — server/services/notification/notificationService.js
 */

import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import Complaint from '../../models/Complaint.js';
import { sendEmail } from './emailService.js';
import { getIO } from '../../socket/socket.js';

export const createNotification = async ({ recipientId, type, title, message, complaintId = null, assignmentId = null, metadata = {} }) => {
  try {
    // 1. Check for recent exact duplicate to avoid spam
    // e.g. same type, same complaint, same recipient within last minute
    const recent = await Notification.findOne({
      recipientId,
      type,
      complaintId,
      createdAt: { $gt: new Date(Date.now() - 60000) }
    });

    if (recent) return recent;

    // 2. Persist notification
    const notification = await Notification.create({
      recipientId,
      type,
      title,
      message,
      complaintId,
      assignmentId,
      metadata
    });

    // 3. Emit real-time socket event
    try {
      const io = getIO();
      io.to(`user:${recipientId}`).emit('notification:new', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        complaintId: notification.complaintId,
        isRead: false,
        createdAt: notification.createdAt
      });
    } catch (ioErr) {
      // Ignore if socket not ready
    }

    // 4. Send Email
    try {
      const user = await User.findById(recipientId);
      if (user && user.email) {
        let complaintData = { name: user.name, title: 'Notification', id: complaintId, status: 'unknown' };
        if (complaintId) {
          const complaint = await Complaint.findById(complaintId);
          if (complaint) {
            complaintData.complaintNumber = complaint.complaintNumber;
            complaintData.title = complaint.title;
            complaintData.status = complaint.status.replace('_', ' ');
          }
        }
        
        await sendEmail(user.email, type, complaintData);
      }
    } catch (emailErr) {
      console.error(`[NotificationService] Email error: ${emailErr.message}`);
    }

    return notification;
  } catch (error) {
    console.error(`[NotificationService] Error creating notification: ${error.message}`);
    // DO NOT THROW. We do not want to break business workflows.
    return null;
  }
};
