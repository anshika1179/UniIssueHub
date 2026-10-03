# Notification System Architecture

## Overview

Phase 6 implements a robust notification system with real-time Socket.IO updates, persistent in-app notifications, and email integration. It operates asynchronously to prevent blocking core complaint and assignment workflows.

## Components

### 1. Notification Model (`server/models/Notification.js`)
- Stores persistent notifications for users.
- Fields: `recipientId`, `type`, `title`, `message`, `complaintId`, `assignmentId`, `isRead`.
- Uses compound index on `recipientId`, `isRead`, and `createdAt` for fast querying.
- Uses index on `recipientId`, `type`, and `complaintId` for duplicate prevention (no spamming).

### 2. Notification Service (`server/services/notification/notificationService.js`)
- **Centralized logic:** Orchestrates notification creation, socket emission, and email sending.
- **Fail-safe:** Wraps socket and email operations in `try/catch`. Never throws errors to the controller, ensuring business operations (like `createComplaint`) succeed even if email fails.
- **Deduplication:** Checks for recent similar notifications before creating a new one.

### 3. Socket.IO Integration (`server/socket/socket.js`)
- Attached to the main Express HTTP server.
- **Authentication:** Uses a middleware that verifies JWT tokens from the socket handshake.
- **Rooms:** Connected users are added to private rooms (`user:<userId>`).
- **Emission:** The `notificationService` emits `notification:new` exclusively to the recipient's room.

### 4. Email Service (`server/services/notification/emailService.js`)
- Uses `nodemailer`.
- Credentials managed strictly via `.env`. If SMTP credentials are not provided, it falls back to a silent mock transport, avoiding crashes.
- Templates are stored in `emailTemplates.js` and return sanitized HTML.

### 5. Frontend Client (`client/src/context/SocketContext.jsx` & UI)
- `SocketProvider` automatically connects upon finding unread notifications (indirectly checking auth state).
- `NotificationBell` displays the unread count.
- `NotificationPanel` shows recent notifications, allows clicking to mark as read, and navigating to the respective complaint.

## Supported Events

| Event | Trigger | Recipient |
|-------|---------|-----------|
| `complaint_created` | User creates complaint | Student |
| `complaint_assigned` | Admin assigns tech | Technician |
| `complaint_reassigned`| Admin reassigns tech | New Technician |
| `assignment_accepted` | Tech accepts | Student |
| `work_started` | Tech starts work | Student |
| `complaint_resolved` | Tech resolves | Student |
| `complaint_closed` | Admin closes | Student |

## Security
- `Socket.IO` requires JWT verification to connect.
- API endpoints `GET /notifications` use `req.user._id` to enforce that users only see their own notifications.
- No real SMTP credentials or API keys exist in the codebase. All emails use safe HTML sanitization.
