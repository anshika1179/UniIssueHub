# Architecture Overview

## System Architecture

UniIssueHub follows a **client-server architecture** built on the MERN stack:

- **React SPA** communicates with the **Express REST API** via HTTP/REST and Socket.IO
- **MongoDB** serves as the data layer via **Mongoose ODM**
- **Socket.IO** provides real-time bidirectional communication
- The backend follows a **modular service-oriented** design

```
┌──────────────┐     HTTP/REST     ┌──────────────┐     Mongoose     ┌──────────────┐
│              │ ◀──────────────▶  │              │ ◀────────────▶  │              │
│  React SPA   │                   │  Express API │                 │   MongoDB    │
│  (Client)    │  Socket.IO        │  (Server)    │                 │  (Database)  │
│              │ ◀──────────────▶  │              │                 │              │
└──────────────┘                   └──────────────┘                 └──────────────┘
                                          │
                                   ┌──────┴───────┐
                                   │              │
                              ┌────┴────┐    ┌────┴─────┐
                              │ Email   │    │  AI/NLP  │
                              │ Service │    │  Service │
                              └─────────┘    └──────────┘
```

---

## Frontend Architecture

### Technology
- **React.js** SPA with **React Router** for client-side routing
- **Tailwind CSS** for utility-first styling
- **Axios** for HTTP client with interceptors for auth tokens
- **Chart.js / Recharts** for analytics visualizations
- **Socket.IO Client** for real-time updates

### Component Hierarchy
```
Pages → Layouts → Features → Components
```

### State Management
- **React Context API** as the primary state management solution
- Option to adopt Redux or Zustand if state complexity grows
- Custom hooks to encapsulate state logic

### Architecture Layers

| Layer | Responsibility | Examples |
|---|---|---|
| **Presentation** | Route-level page rendering and layout | Pages, Layouts |
| **Feature** | Domain-specific logic and UI | Auth, Complaints, Notifications, Analytics |
| **Service** | External communication | API calls (Axios), Socket.IO connections |
| **State** | Application state management | Context providers, custom hooks |

### Folder Structure Rationale
- **Feature-based** organization for scalability
- `components/` for reusable, domain-agnostic UI elements
- `features/` for domain-specific modules (each with its own services, hooks, and components)
- `services/` for centralized API service layer
- `hooks/` for shared custom hooks
- `context/` for React Context providers

---

## Backend Architecture

### Technology
- **Express.js** REST API with modular router structure
- **Mongoose** ODM for data modeling and validation
- **Socket.IO** server integrated with Express
- **Multer** for file upload handling
- **Nodemailer** for email service
- **Natural / Compromise** (npm) for AI/NLP intelligence

### Design Pattern
```
Controller → Service → Model
```

- **Controllers**: Handle HTTP requests, delegate to services
- **Services**: Contain business logic, interact with models
- **Models**: Mongoose schemas and data access

### Middleware Pipeline

```
Client Request
    ↓
Rate Limiter (express-rate-limit)
    ↓
CORS (cors)
    ↓
Security Headers (Helmet)
    ↓
Body Parser (express.json)
    ↓
Input Sanitization (express-mongo-sanitize, xss-clean)
    ↓
JWT Auth Middleware
    ↓
RBAC Middleware
    ↓
Validation Middleware
    ↓
Route Handler → Controller
    ↓
Service Layer
    ↓
Mongoose Model
    ↓
MongoDB
    ↓
Response
```

### Error Handling
- Global error handler middleware
- Structured error responses with status codes and error codes
- Async error wrapper for route handlers
- Unhandled rejection and uncaught exception handlers

---

## Database Architecture

> Full details in [database.md](database.md)

- **MongoDB** with **Mongoose ODM**
- **Collections**: Users, Complaints, Departments, Notifications, Comments, AuditLogs
- **Indexed** for performance on frequently queried fields
- **References** between collections using ObjectId

---

## Real-Time Architecture

### Socket.IO Design
- Integrated with the Express HTTP server
- Authentication via Socket.IO middleware (JWT token in handshake)

### Namespaces & Rooms
- **User rooms**: Each authenticated user joins a room by their user ID
- **Department rooms**: Department heads and staff join department-specific rooms
- **Role rooms**: Role-based broadcasting (e.g., all admins)

### Events

| Event | Direction | Description |
|---|---|---|
| `complaint:created` | Server → Client | New complaint submitted |
| `complaint:updated` | Server → Client | Complaint status changed |
| `complaint:assigned` | Server → Client | Complaint assigned to user |
| `complaint:commented` | Server → Client | New comment on complaint |
| `notification:new` | Server → Client | New notification |
| `notification:count` | Server → Client | Updated unread count |
| `join-room` | Client → Server | Join user/department room |
| `leave-room` | Client → Server | Leave room |

---

## Security Architecture

### Authentication Security
- **JWT** access + refresh token strategy
- **bcrypt** password hashing (salt rounds: 12)
- Separate secrets for access and refresh tokens
- HTTP-only, Secure, SameSite cookies for refresh tokens

### Transport Security
- **Helmet** for HTTP security headers
- **CORS** whitelisting
- HTTPS in production

### Input Security
- **express-mongo-sanitize** to prevent NoSQL injection
- **xss-clean** to prevent XSS attacks
- Request validation middleware
- File upload validation (type, size limits)

### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 10 requests per 15 minutes per IP
- File upload: 20 requests per hour per user

### Access Control
- RBAC middleware for route-level protection
- Resource-level scoping (own complaints, department complaints)

---

## Scalability Considerations

| Concern | Strategy |
|---|---|
| Horizontal scaling | Stateless API design, no server-side sessions |
| Database performance | MongoDB indexing, compound indexes, text indexes |
| Connection management | Mongoose connection pooling |
| Caching (future) | Redis for session storage and query caching |
| Static assets (future) | CDN for production frontend assets |
| WebSocket scaling (future) | Redis adapter for Socket.IO |

---

> **Note**: This document describes the planned architecture. No implementation has been created yet.

## Phase 6 — Real-Time Notifications
Added `Socket.IO` attached to the main Express server, using JWT-based authentication. Private rooms per user (`user:<userId>`) ensure secure targeted event broadcasting. 
The `notificationService` manages the creation of persistent DB records, triggering socket events, and delegating to `emailService` for Nodemailer SMTP dispatch safely separated from core requests.
