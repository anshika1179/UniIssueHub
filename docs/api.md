# API Documentation

## Base URL

```
Development: http://localhost:5000/api/v1
Production:  https://api.uniissuehub.com/api/v1
```

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| POST | `/refresh-token` | Refresh access token | No (uses refresh token cookie) |
| POST | `/forgot-password` | Request password reset OTP | No |
| POST | `/reset-password` | Reset password with OTP | No |
| POST | `/verify-email` | Verify email with OTP | No |
| GET | `/me` | Get current user profile | Yes |

### Users — `/api/v1/users`

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| GET | `/` | List all users | Yes | Admin, Super Admin |
| GET | `/:id` | Get user by ID | Yes | Admin, Super Admin, Self |
| PUT | `/:id` | Update user | Yes | Admin, Super Admin, Self |
| DELETE | `/:id` | Delete user | Yes | Super Admin |
| PUT | `/:id/role` | Update user role | Yes | Super Admin |
| GET | `/:id/complaints` | Get user's complaints | Yes | Self, Admin |
| PUT | `/profile` | Update own profile | Yes | All |
| PUT | `/avatar` | Upload avatar | Yes | All |
| PUT | `/change-password` | Change password | Yes | All |

### Complaints — `/api/v1/complaints`

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| POST | `/` | Create complaint | Yes | Student, Faculty, Staff |
| GET | `/` | List complaints (filtered) | Yes | All (scoped by role) |
| GET | `/:id` | Get complaint details | Yes | All (scoped) |
| PUT | `/:id` | Update complaint | Yes | Owner, Admin |
| DELETE | `/:id` | Delete complaint | Yes | Owner, Admin |
| PUT | `/:id/status` | Update complaint status | Yes | Dept Head, Admin, Assigned Staff |
| PUT | `/:id/assign` | Assign complaint | Yes | Dept Head, Admin |
| PUT | `/:id/escalate` | Escalate complaint | Yes | Dept Head, Admin |
| POST | `/:id/comments` | Add comment | Yes | All involved parties |
| GET | `/:id/comments` | Get comments | Yes | All involved parties |
| POST | `/:id/attachments` | Upload attachment | Yes | Owner |
| PUT | `/:id/feedback` | Submit feedback/rating | Yes | Owner |
| GET | `/my` | Get current user's complaints | Yes | All |
| GET | `/department/:deptId` | Get department complaints | Yes | Dept Head, Admin |

### Departments — `/api/v1/departments`

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| POST | `/` | Create department | Yes | Super Admin |
| GET | `/` | List departments | Yes | All |
| GET | `/:id` | Get department details | Yes | All |
| PUT | `/:id` | Update department | Yes | Admin, Super Admin |
| DELETE | `/:id` | Delete department | Yes | Super Admin |
| GET | `/:id/members` | Get department members | Yes | Admin, Dept Head |
| PUT | `/:id/head` | Assign department head | Yes | Super Admin |

### Notifications — `/api/v1/notifications`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Get user's notifications | Yes |
| PUT | `/:id/read` | Mark notification as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |
| GET | `/unread-count` | Get unread count | Yes |

### Analytics — `/api/v1/analytics`

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| GET | `/overview` | Dashboard overview stats | Yes | Admin, Dept Head |
| GET | `/complaints-by-category` | Complaints grouped by category | Yes | Admin, Dept Head |
| GET | `/complaints-by-status` | Complaints grouped by status | Yes | Admin, Dept Head |
| GET | `/complaints-by-priority` | Complaints grouped by priority | Yes | Admin, Dept Head |
| GET | `/complaints-by-department` | Complaints grouped by department | Yes | Admin |
| GET | `/resolution-time` | Average resolution time stats | Yes | Admin, Dept Head |
| GET | `/trends` | Complaint trends over time | Yes | Admin |
| GET | `/department/:deptId` | Department-specific analytics | Yes | Admin, Dept Head |
| GET | `/export` | Export report (CSV/PDF) | Yes | Admin |

---

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Query Parameters

### Common Parameters (all list endpoints)

| Parameter | Type | Description | Default |
|---|---|---|---|
| `page` | Number | Page number | 1 |
| `limit` | Number | Items per page | 10 (max: 100) |
| `sort` | String | Sort field (prefix `-` for descending) | `-createdAt` |
| `search` | String | Full-text search query | — |

### Complaint-Specific Filters

| Parameter | Type | Description |
|---|---|---|
| `status` | String | Filter by status |
| `category` | String | Filter by category |
| `priority` | String | Filter by priority |
| `department` | ObjectId | Filter by department ID |
| `dateFrom` | Date | Start of date range |
| `dateTo` | Date | End of date range |
| `assignedTo` | ObjectId | Filter by assigned user |

---

## Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| General API | 100 requests | 15 minutes per IP |
| Auth endpoints | 10 requests | 15 minutes per IP |
| File upload | 20 requests | 1 hour per user |

---

## File Upload Constraints

| Constraint | Value |
|---|---|
| Max file size | 5 MB |
| Allowed types | JPEG, PNG, GIF, PDF, DOC, DOCX |
| Max attachments per complaint | 5 |

---

## WebSocket Events (Socket.IO)

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId }` | Join user/department room |
| `leave-room` | `{ roomId }` | Leave room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `complaint:created` | `{ complaint }` | New complaint submitted |
| `complaint:updated` | `{ complaintId, status, updatedBy }` | Complaint status changed |
| `complaint:assigned` | `{ complaintId, assignedTo, assignedBy }` | Complaint assigned to user |
| `complaint:commented` | `{ complaintId, comment }` | New comment on complaint |
| `notification:new` | `{ notification }` | New notification |
| `notification:count` | `{ count }` | Updated unread count |

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — Request succeeded |
| 201 | Created — Resource created |
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource not found |
| 409 | Conflict — Duplicate resource |
| 422 | Unprocessable Entity — Validation error |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error |

---

### AI Intelligence — `/api/v1/ai` (Phase 5)

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| GET | `/complaint/:complaintId` | Get AI analysis for a complaint | Yes | Student (own), Admin, Warden, Technician (assigned) |
| POST | `/analyze/:complaintId` | Trigger/re-run AI analysis | Yes | Student (own), Admin, Warden, Technician (assigned) |

#### GET `/api/v1/ai/complaint/:complaintId`

Returns the stored AI analysis for a complaint. If no analysis exists yet, triggers one synchronously.

**Response:**
```json
{
  "success": true,
  "data": {
    "complaintId": "...",
    "categoryRecommendation": "water",
    "categoryConfidence": 0.85,
    "priorityRecommendation": "high",
    "priorityConfidence": 0.80,
    "sentiment": "negative",
    "urgency": "high",
    "urgencyConfidence": 0.75,
    "isDuplicate": false,
    "duplicateConfidence": 0.90,
    "matchedComplaints": [],
    "estimatedHours": 3,
    "etaConfidence": 0.60,
    "etaBasis": "Rule-based historical estimate for category and priority.",
    "technicalSuggestions": [
      "Shut off main valve if flooding.",
      "Check for pipe blockages."
    ],
    "provider": "local",
    "model": "rule-based-v1"
  }
}
```

#### POST `/api/v1/ai/analyze/:complaintId`

Forces a fresh AI analysis run and returns the result.

---

### Notifications — `/api/v1/notifications` (Phase 6)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Get user notifications (paginated) | Yes |
| GET | `/unread-count` | Get unread notifications count | Yes |
| PATCH | `/:id/read` | Mark specific notification as read | Yes |
| PATCH | `/read-all` | Mark all user notifications as read | Yes |

> **Note**: Phases 1–6 endpoints are implemented. Phases 7+ endpoints are planned.

---

### Analytics — `/api/v1/analytics` (Phase 7)

| Method | Endpoint | Description | Auth Required | Role Access |
|---|---|---|---|---|
| GET | `/overview` | Get high-level counts | Yes | Admin/Warden |
| GET | `/categories` | Get category distributions | Yes | Admin/Warden |
| GET | `/priorities` | Get priority distributions | Yes | Admin/Warden |
| GET | `/status` | Get status distributions | Yes | Admin/Warden |
| GET | `/trends` | Get daily complaint trends | Yes | Admin/Warden |
| GET | `/resolution-time` | Get average resolution hours | Yes | Admin/Warden |
| GET | `/technicians` | Get technician workloads | Yes | Admin/Warden/Tech |

> **Note**: Phase 7 analytics implemented. Phase 8+ planned.
