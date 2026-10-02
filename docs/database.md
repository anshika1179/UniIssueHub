# Database Design

## Overview

- **Database**: MongoDB
- **ODM**: Mongoose
- **Design**: Document-oriented schema design optimized for the complaint management domain

---

## Collections & Schema Design

### User

```
{
  _id:                      ObjectId (auto),
  firstName:                String (required),
  lastName:                 String (required),
  email:                    String (required, unique, indexed),
  password:                 String (required, hashed with bcrypt),
  role:                     String (enum: ['student', 'faculty', 'staff',
                                          'department_head', 'admin', 'super_admin']),
  department:               ObjectId (ref: Department),
  studentId:                String (for students),
  employeeId:               String (for faculty/staff),
  phone:                    String,
  avatar:                   String (file path),
  isEmailVerified:          Boolean (default: false),
  emailVerificationOTP:     String,
  emailVerificationExpiry:  Date,
  passwordResetOTP:         String,
  passwordResetExpiry:      Date,
  refreshToken:             String,
  isActive:                 Boolean (default: true),
  lastLogin:                Date,
  createdAt:                Date (auto, timestamps),
  updatedAt:                Date (auto, timestamps)
}

Indexes:
  - email        (unique)
  - role
  - department
  - isActive
```

### Complaint

```
{
  _id:              ObjectId (auto),
  complaintId:      String (auto-generated, unique, e.g., 'CMP-2024-00001'),
  title:            String (required, maxLength: 200),
  description:      String (required, maxLength: 5000),
  category:         String (enum: ['infrastructure', 'academic', 'hostel',
                                   'mess_canteen', 'library', 'it_services',
                                   'transport', 'administrative',
                                   'ragging_harassment', 'other']),
  priority:         String (enum: ['low', 'medium', 'high', 'critical'],
                           default: 'medium'),
  status:           String (enum: ['submitted', 'under_review', 'assigned',
                                   'in_progress', 'resolved', 'closed',
                                   'reopened', 'escalated'],
                           default: 'submitted'),
  submittedBy:      ObjectId (ref: User, required),
  isAnonymous:      Boolean (default: false),
  department:       ObjectId (ref: Department),
  assignedTo:       ObjectId (ref: User),
  assignedBy:       ObjectId (ref: User),
  assignedAt:       Date,
  attachments: [{
    filename:       String,
    originalName:   String,
    mimeType:       String,
    size:           Number,
    path:           String,
    uploadedAt:     Date
  }],
  resolutionNotes:  String,
  resolvedAt:       Date,
  resolvedBy:       ObjectId (ref: User),
  feedback: {
    rating:         Number (1-5),
    comment:        String,
    submittedAt:    Date
  },
  escalation: {
    isEscalated:    Boolean,
    escalatedTo:    ObjectId (ref: User),
    escalatedBy:    ObjectId (ref: User),
    escalatedAt:    Date,
    reason:         String
  },
  sla: {
    deadline:       Date,
    isOverdue:      Boolean
  },
  aiMetadata: {
    suggestedCategory:    String,
    suggestedPriority:    String,
    sentimentScore:       Number,
    keywords:             [String],
    similarComplaints:    [ObjectId]
  },
  statusHistory: [{
    status:         String,
    changedBy:      ObjectId (ref: User),
    changedAt:      Date,
    notes:          String
  }],
  createdAt:        Date (auto, timestamps),
  updatedAt:        Date (auto, timestamps)
}

Indexes:
  - complaintId    (unique)
  - status
  - category
  - priority
  - department
  - submittedBy
  - assignedTo
  - createdAt
  - { status: 1, createdAt: -1 }    (compound)
  - { title: 'text', description: 'text' }  (text index for search)
```

### Department

```
{
  _id:          ObjectId (auto),
  name:         String (required, unique),
  code:         String (required, unique, e.g., 'INFRA', 'ACAD'),
  description:  String,
  head:         ObjectId (ref: User),
  members:      [ObjectId] (ref: User),
  categories:   [String] (complaint categories this department handles),
  isActive:     Boolean (default: true),
  createdAt:    Date (auto, timestamps),
  updatedAt:    Date (auto, timestamps)
}

Indexes:
  - name       (unique)
  - code       (unique)
  - isActive
```

### Notification

```
{
  _id:                ObjectId (auto),
  recipient:          ObjectId (ref: User, required),
  type:               String (enum: ['complaint_created', 'complaint_assigned',
                                     'status_updated', 'comment_added',
                                     'complaint_escalated', 'complaint_resolved',
                                     'deadline_warning', 'system']),
  title:              String (required),
  message:            String (required),
  relatedComplaint:   ObjectId (ref: Complaint),
  isRead:             Boolean (default: false),
  readAt:             Date,
  createdAt:          Date (auto, timestamps)
}

Indexes:
  - recipient
  - isRead
  - createdAt
  - { recipient: 1, isRead: 1, createdAt: -1 }  (compound)
```

### Comment

```
{
  _id:          ObjectId (auto),
  complaint:    ObjectId (ref: Complaint, required),
  author:       ObjectId (ref: User, required),
  content:      String (required, maxLength: 2000),
  isInternal:   Boolean (default: false),
  attachments: [{
    filename:   String,
    path:       String
  }],
  createdAt:    Date (auto, timestamps),
  updatedAt:    Date (auto, timestamps)
}

Indexes:
  - complaint
  - author
  - createdAt
```

### AuditLog

```
{
  _id:          ObjectId (auto),
  action:       String (required, e.g., 'COMPLAINT_CREATED', 'STATUS_CHANGED',
                                       'USER_LOGIN', 'USER_ROLE_CHANGED'),
  performedBy:  ObjectId (ref: User),
  targetType:   String (enum: ['complaint', 'user', 'department', 'system']),
  targetId:     ObjectId,
  details:      Mixed (additional action context),
  ipAddress:    String,
  userAgent:    String,
  createdAt:    Date (auto, timestamps)
}

Indexes:
  - action
  - performedBy
  - targetType
  - createdAt
```

---

## Relationships

```
User ──────┬──── Department
  │        │
  │        └──── Complaint ──── Comment
  │                  │
  └──── Notification ┘
  │
  └──── AuditLog
```

| Relationship | Type | Description |
|---|---|---|
| User → Department | Many-to-One | User belongs to a department |
| Complaint → User (submittedBy) | Many-to-One | Complaint submitted by a user |
| Complaint → User (assignedTo) | Many-to-One | Complaint assigned to a user |
| Complaint → Department | Many-to-One | Complaint belongs to a department |
| Comment → Complaint | Many-to-One | Comment belongs to a complaint |
| Comment → User | Many-to-One | Comment authored by a user |
| Notification → User | Many-to-One | Notification sent to a user |
| Notification → Complaint | Many-to-One | Notification related to a complaint (optional) |
| AuditLog → User | Many-to-One | Action performed by a user |

---

## Indexing Strategy

| Index Type | Fields | Purpose |
|---|---|---|
| Unique | `User.email` | Prevent duplicate accounts |
| Unique | `Complaint.complaintId` | Unique complaint identifier |
| Unique | `Department.name`, `Department.code` | Unique department identity |
| Query-optimized | `status`, `category`, `priority`, `department` | Fast complaint filtering |
| Compound | `{ status: 1, createdAt: -1 }` | Status-filtered chronological queries |
| Compound | `{ recipient: 1, isRead: 1, createdAt: -1 }` | Unread notifications query |
| Text | `Complaint.title`, `Complaint.description` | Full-text search |
| TTL (future) | `Notification.createdAt` | Auto-expire old notifications |

---

## Data Validation

- **Mongoose schema-level validation**: required fields, enum constraints, min/max lengths
- **Custom validators**: email format, phone format, password strength
- **Pre-save hooks**: password hashing (bcrypt), complaintId auto-generation
- **Timestamps**: enabled on all schemas (`createdAt`, `updatedAt`)
- **Virtuals**: computed fields (e.g., `fullName` from `firstName` + `lastName`)

---

## Migration & Seeding Strategy

| Task | Description |
|---|---|
| Super Admin seed | Create initial super admin user on first setup |
| Department seed | Populate default departments and their category mappings |
| Schema versioning | Handle schema changes via Mongoose schema versioning as needed |

---

> **Note**: This document describes the planned database design. No models have been implemented yet.
