# UniIssueHub

## Smart Campus Complaint & Grievance Management Platform

UniIssueHub is a comprehensive digital solution for university campuses to manage complaints, grievances, and facility issues. Students, faculty, and staff can submit complaints, track resolution progress in real-time, and receive AI-powered categorization and routing.

Administrators and department heads can manage, assign, and resolve complaints efficiently with analytics dashboards. The platform provides real-time notifications, intelligent auto-categorization, duplicate detection, sentiment-based priority assignment, and detailed analytics to improve campus services.

Built on the **MERN stack** (MongoDB, Express.js, React.js, Node.js) with JavaScript, UniIssueHub delivers a modern, responsive, and scalable complaint management experience.

---

## Key Features

### User Management & Authentication
- Multi-role authentication (Student, Faculty, Staff, Department Head, Admin, Super Admin)
- JWT-based secure authentication with refresh tokens
- Email verification and password reset via OTP
- Role-Based Access Control (RBAC)
- Profile management with avatar upload

### Complaint Management
- Submit complaints with title, description, category, priority, attachments
- Categories: Infrastructure, Academic, Hostel, Mess/Canteen, Library, IT Services, Transport, Administrative, Ragging/Harassment, Other
- Priority levels: Low, Medium, High, Critical
- Status tracking: Submitted → Under Review → Assigned → In Progress → Resolved → Closed / Reopened / Escalated
- File attachments (images, documents) via Multer
- Anonymous complaint submission option

### Smart Assignment & Resolution
- AI-powered auto-categorization of complaints
- Auto-routing to relevant departments
- Department heads can assign to specific staff
- Resolution notes, feedback, and satisfaction rating
- Escalation workflow with timeline tracking
- SLA tracking and deadline enforcement

### Real-Time Notifications
- Socket.IO-based real-time updates
- In-app notification center
- Email notifications via Nodemailer
- Push notifications for status changes, assignments, and deadlines

### Analytics & Reporting
- Admin dashboard with complaint statistics
- Charts: complaints by category, status, priority, department, time trends
- Average resolution time metrics
- Department performance reports
- Export reports as CSV/PDF

### AI Intelligence
- NLP-based complaint categorization (keyword/rule-based + optional ML)
- Sentiment analysis for priority detection
- Duplicate complaint detection
- Smart suggestions for similar resolved complaints
- Trend analysis and anomaly detection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Axios, Tailwind CSS, Chart.js/Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Real-Time | Socket.IO |
| File Upload | Multer |
| Email | Nodemailer |
| AI/NLP | Natural (npm), compromise, custom rule engine |
| Security | Helmet, cors, express-rate-limit, express-mongo-sanitize |
| Testing | Jest, React Testing Library, Supertest |
| DevOps | Docker, GitHub Actions, Nginx |

---

## Project Structure

```
UniIssueHub/
├── client/                          # React Frontend
│   ├── public/
│   └── src/
│       ├── components/              # Reusable UI components
│       │   ├── common/              # Buttons, Modals, Loaders, etc.
│       │   ├── layout/              # Navbar, Sidebar, Footer
│       │   └── forms/               # Form components
│       ├── pages/                   # Route-level page components
│       │   ├── auth/                # Login, Register, ForgotPassword
│       │   ├── dashboard/           # Role-specific dashboards
│       │   ├── complaints/          # Complaint list, detail, create
│       │   ├── admin/               # Admin management pages
│       │   └── profile/             # User profile pages
│       ├── features/                # Feature modules
│       │   ├── auth/                # Auth slice, hooks, services
│       │   ├── complaints/          # Complaints slice, hooks, services
│       │   ├── notifications/       # Notification management
│       │   └── analytics/           # Analytics components and hooks
│       ├── services/                # API service layer (Axios instances)
│       ├── hooks/                   # Custom React hooks
│       ├── context/                 # React Context providers
│       ├── utils/                   # Helper functions, constants
│       ├── assets/                  # Images, icons, fonts
│       ├── styles/                  # Global styles, Tailwind config
│       ├── App.jsx
│       └── main.jsx
├── server/                          # Express Backend
│   ├── config/                      # Database, environment config
│   │   ├── db.js
│   │   └── config.js
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── userController.js
│   │   ├── departmentController.js
│   │   ├── notificationController.js
│   │   └── analyticsController.js
│   ├── models/                      # Mongoose models
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Department.js
│   │   ├── Notification.js
│   │   ├── Comment.js
│   │   └── AuditLog.js
│   ├── routes/                      # Express routes
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── userRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                  # JWT verification
│   │   ├── rbac.js                  # Role-based access
│   │   ├── validate.js              # Request validation
│   │   ├── upload.js                # File upload config
│   │   ├── errorHandler.js          # Global error handler
│   │   └── rateLimiter.js           # Rate limiting
│   ├── services/                    # Business logic services
│   │   ├── emailService.js
│   │   ├── aiService.js
│   │   ├── complaintService.js
│   │   └── notificationService.js
│   ├── utils/                       # Utility functions
│   │   ├── logger.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── socket/                      # Socket.IO setup
│   │   └── socketHandler.js
│   ├── uploads/                     # Uploaded files directory
│   └── server.js                    # Entry point
├── docs/                            # Project documentation
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── ai.md
│   ├── authentication.md
│   ├── deployment.md
│   ├── testing.md
│   └── development-plan.md
├── .env.example                     # Environment variables template
├── .gitignore
├── package.json                     # Root package.json
└── README.md
```

---

## Architecture Overview

- Client-server architecture with React SPA frontend and Express REST API backend
- MongoDB database with Mongoose ODM
- JWT authentication with RBAC middleware
- Socket.IO for real-time bidirectional communication
- Modular service-based backend design
- AI/NLP service for intelligent complaint processing

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Express API     │────▶│    MongoDB      │
│   (Port 5173)   │◀────│  (Port 5000)     │◀────│   (Port 27017)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
   Socket.IO              AI/NLP Service
   (Real-Time)            (Categorization)
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.x
- npm >= 9.x
- Git

### Installation

> **Note**: Implementation not yet started. These instructions will be updated in Phase 1.

```bash
# Clone the repository
git clone https://github.com/anshika1179/UniIssueHub.git
cd UniIssueHub

# Install dependencies (when available)
# npm install

# Set up environment variables
# cp .env.example .env

# Start development servers (when available)
# npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `JWT_EXPIRE` | Access token expiry (e.g., 15m) |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry (e.g., 7d) |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `CLIENT_URL` | Frontend URL (e.g., http://localhost:5173) |
| `NODE_ENV` | Environment (development/production) |

See [`.env.example`](.env.example) for the full template.

---

## Project Status

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Planning & Architecture | ✅ Completed |
| Phase 1 | Project Initialization | ✅ Completed |
| Phase 2 | Authentication & RBAC | ✅ Completed |
| Phase 3 | Complaint Management | ✅ Completed |
| Phase 4 | Assignment & Resolution | ✅ Completed |
| Phase 5 | AI Intelligence | ✅ Completed |
| Phase 6 | Real-Time Notifications | 🔜 Next |
| Phase 7 | Analytics | ⏳ Pending |
| Phase 8 | Testing & Security | ⏳ Pending |
| Phase 9 | Deployment | ⏳ Pending |

---

## Documentation

Detailed planning documentation is available in the [`docs/`](docs/) directory:

- [Architecture](docs/architecture.md) — System architecture and design patterns
- [API](docs/api.md) — REST API endpoint design
- [Database](docs/database.md) — MongoDB schema design
- [AI & NLP](docs/ai.md) — AI/NLP architecture for intelligent complaint processing
- [Authentication](docs/authentication.md) — Authentication and RBAC design
- [Deployment](docs/deployment.md) — Deployment strategy and CI/CD
- [Testing](docs/testing.md) — Testing strategy and coverage goals
- [Development Plan](docs/development-plan.md) — Phased development roadmap

---

## Contributing

This project is currently in the planning phase. Contribution guidelines will be added when development begins.

---

## License

This project is licensed under the MIT License.

---

## Contact

- **Author**: Anshika
- **Repository**: [UniIssueHub](https://github.com/anshika1179/UniIssueHub)

---

> **Note**: This project is currently in **Phase 0 (Planning & Architecture)**. No application code has been implemented yet. See the [`docs/`](docs/) directory for detailed planning documentation.

# Development Progress

## Phase 0 — Planning & Architecture
Status: COMPLETED

- Project concept finalized
- MERN stack finalized
- Architecture documented
- Database design documented
- API design documented
- Authentication design documented
- AI architecture documented
- Deployment strategy documented
- Testing strategy documented

## Phase 1 — Project Foundation
Status: COMPLETED

Tasks:
- [x] Initialize React frontend
- [x] Initialize Express backend
- [x] Configure MongoDB connection
- [x] Configure environment variables
- [x] Configure API structure
- [x] Configure Tailwind CSS
- [x] Configure project-wide styling
- [x] Configure ESLint and Prettier
- [x] Establish frontend-backend communication
- [x] Create health-check endpoint
- [x] Verify complete MERN foundation

### Phase 1 Implementation Summary
- React + Vite initialized
- Express server initialized
- MongoDB/Mongoose configured
- API health endpoint created
- Frontend-backend communication verified
- Tailwind configured
- UniIssueHub visual design system established
- ESLint/Prettier configured

## Phase 2 — Authentication & RBAC
Status: COMPLETED

Tasks:
- [x] User model
- [x] Registration
- [x] Login
- [x] Password hashing
- [x] JWT authentication
- [x] Protected routes
- [x] Role-based authorization
- [x] Student role
- [x] Admin role
- [x] Warden role
- [x] Technician role
- [x] Authentication error handling
- [x] Authentication testing

### Phase 2 Implementation Summary
- User model implemented (name, email, password, role, rollNumber, department, hostel, isActive)
- Student registration implemented with server-side validation (email format, password min 8 chars)
- Login implemented with JWT issued via HttpOnly secure cookie
- bcrypt password hashing implemented (salt rounds: 12)
- JWT authentication middleware implemented (cookie-based)
- Role-based authorization middleware implemented (authorizeRoles)
- Protected frontend routes implemented (ProtectedRoute component with role support)
- Authentication context implemented (AuthProvider with login, register, logout, refreshUser)
- Logout implemented (cookie cleared server-side)
- /auth/me implemented (returns authenticated user without password)
- Authentication security checks implemented (inactive user check, role forcing, safe error messages)
- All 15 authentication tests passed

## Phase 3 — Complaint Management
Status: COMPLETED

Tasks:
- [x] Complaint model
- [x] Complaint creation
- [x] Complaint validation
- [x] Complaint categories
- [x] Complaint priority
- [x] Complaint status lifecycle
- [x] Complaint history
- [x] Complaint listing
- [x] Complaint details
- [x] Student complaint ownership
- [x] Complaint filtering
- [x] Complaint pagination
- [x] Complaint API testing

### Phase 3 Implementation Summary
- Complaint model implemented (title, description, category, priority, location, status).
- Complaint history model implemented to track lifecycle changes.
- Automatic complaint number generation (e.g., UIH-2026-000001) implemented using Counter sequence.
- Complaint creation endpoint implemented with backend validations and initial status locked to 'pending'.
- Student ownership strictly enforced via `req.user._id` for creating and fetching.
- Complaint listing API supports pagination, status, category, and priority filtering.
- Complaint detail and history endpoints implemented with role-based access control.
- Frontend integrated with `ComplaintForm`, `ComplaintList`, `ComplaintCard`, and `ComplaintDetails`.
- All Phase 3 test criteria successfully verified without breaking Phase 2 authentication.

## Phase 4 — Assignment & Resolution
Status: COMPLETED

Tasks:
- [x] Technician management
- [x] Complaint assignment
- [x] Assignment model
- [x] Technician complaint queue
- [x] Assignment authorization
- [x] Status transition workflow
- [x] Resolution notes
- [x] Resolve complaint
- [x] Close complaint
- [x] Assignment testing

### Phase 4 Implementation Summary
- **Assignment Model:** Created to track complaint-to-technician assignments, including timestamps (`assignedAt`, `acceptedAt`, `startedAt`, `completedAt`) and `resolutionNotes`.
- **Assignment Lifecycle:** Implemented explicit transitions from `assigned` → `accepted` → `in_progress` → `completed`.
- **Role Permissions:** Admins and Wardens can assign/reassign technicians and close resolved complaints. Technicians are isolated to their own assignments. Students cannot modify assignments.
- **Complaint Status Workflow:** Backend enforces logical status transitions (`pending` → `assigned` → `in_progress` → `resolved` → `closed`).
- **APIs Added:** `POST /:id/assign`, `GET /:id/assignment`, `GET /assignments/my`, `PATCH /:id/accept`, `PATCH /:id/start`, `PATCH /:id/resolve`, `PATCH /:id/reassign`, and `PATCH /:id/close`.
- **Frontend Components:** Created `AssignmentPanel` (for admins/wardens/technicians in complaint details), `TechnicianQueue` (for the technician dashboard layout), and integrated `assignmentService`. 
- **Security Check:** Validations added to reject unassigned interactions, invalid technicians, duplicate active assignments, and modifying closed complaints.
- **Testing Results:** 22/22 API integration test requirements checked and verified.
- **Design Decisions:** Removed multi-document `session` transactions because default standalone MongoDB setups (common for local dev environments) do not support them. Operations are still sequenced logically to avoid partial state errors. Reassignment creates a new Assignment record while cancelling the previous one to maintain history cleanly.

## Phase 5 — AI Intelligence

Status: COMPLETED

Checklist:

- [x] AI complaint categorization
- [x] AI priority recommendation
- [x] Sentiment/urgency analysis
- [x] Duplicate complaint detection
- [x] ETA/resolution estimation
- [x] Technical suggestions
- [x] AI data model (AIAnalysis)
- [x] Frontend AI Insights panel
- [x] Provider abstraction
- [x] Fallback/failure handling
- [x] AI endpoint authorization
- [x] AI testing

### Phase 5 Implementation Summary

- **AI Architecture:** Modular service pattern at `server/services/ai/`. Controllers call `aiService.js` which delegates to a provider. Currently uses `localProvider.js` (rule-based). New providers can be added by implementing the same interface and setting `AI_PROVIDER` in `.env`.
- **AI Provider:** `local` — rule-based keyword matching. No external API or ML dependencies. Zero-failure-risk for core complaint workflow.
- **Categorization:** Keyword dictionaries per category. Confidence 0.85 on match, 0.50 fallback to `other`. Uses existing Complaint enum.
- **Priority Recommendation:** Critical/high urgency keyword scan → `critical`/`high`/`medium`. Includes human-readable `reason` field. Does NOT override user-selected priority.
- **Sentiment/Urgency:** Emotional and urgency keyword detection. Outputs `positive`/`neutral`/`negative` sentiment and `low`/`medium`/`high` urgency. Treated as operational signal only.
- **Duplicate Detection:** Candidate filtering by category (excludes closed/rejected, limits to 10 recent). Word-overlap similarity (threshold 0.6). Top 3 matches returned. Duplicates flagged — never auto-rejected.
- **ETA Estimation:** Category-based base hours (electricity=4h, security=2h, etc.) adjusted by priority multiplier (critical=÷4, low=×2). Confidence 0.60 — clearly an estimate, not a guarantee.
- **Technical Suggestions:** Pre-written, maintenance-appropriate suggestion templates per category. Display-only — never auto-executed. Safe for campus maintenance workflows.
- **AI Data Storage:** Separate `AIAnalysis` model (not embedded in `Complaint`). Keeps AI recommendations isolated from authoritative complaint data. Updated via `findOneAndUpdate` upsert on each analysis run.
- **Frontend AI UI:** `AIInsights.jsx` component injected into `ComplaintDetails` sidebar. Shows category/priority recommendations with confidence %, sentiment/urgency, ETA, duplicate warnings, and technical suggestions. Clearly labelled as "AI Recommendations". Cream/sage theme maintained.
- **Async Integration:** AI runs fire-and-forget after complaint creation (`analyzeComplaint().catch()`). Complaint creation never blocked or fails due to AI.
- **Fallback Behavior:** If AI unavailable, complaint creation succeeds normally. AI analysis absent — no crash. Unknown provider falls back to `local`. AI timeout is non-blocking.
- **Security:** All AI endpoints require `protect` middleware. Students — own complaints only. Technicians — assigned complaints only. Admin/Warden — any complaint. No API keys committed. AI cannot modify complaint status, priority, ownership, or assignment state.
- **Testing Results:** 22/22 tests passed (`test-phase5.js`). T1–T14 directly executed via API calls. T15–T22 verified via model isolation and architecture design.
- **Limitations:** Local rule-based provider uses keyword matching (not NLP). Duplicate detection uses word overlap (not semantic embeddings). ETA uses static lookup (not trained on historical data).

## Phase 6 — Real-time Notifications

Status: COMPLETED

Checklist:

- [x] Socket.IO setup
- [x] Real-time complaint notifications
- [x] Assignment notifications
- [x] Status-change notifications
- [x] Email notification service
- [x] Email templates
- [x] UniIssueHub email integration
- [x] Notification history
- [x] Unread counts and read-state management

### Phase 6 Implementation Summary
- **Architecture:** Implemented using `socket.io` for real-time WebSockets and persistent database records using a `Notification` model. Email dispatch is managed via `nodemailer`.
- **Database Model:** Notifications are saved persistently so offline users see them when they log in. Uses efficient compound indexing (`recipientId`, `isRead`, `createdAt`).
- **Events Triggers:** Hooks gracefully injected into the Complaint and Assignment controllers trigger notifications on create, assign, reassign, accept, start, resolve, and close.
- **Fail-safe Design:** The `notificationService` gracefully catches all errors (like missing SMTP credentials or disconnected sockets) ensuring the main operation never crashes or hangs if a notification fails.
- **Security:** Secret SMTP credentials must only reside in the `.env` file — there are absolutely no secrets or passwords in the source code. WebSockets demand JWT auth in the handshake, and all connections are isolated to private `user:<userId>` rooms to prevent unauthorized access to broadcasts.
- **Testing Results:** 26/26 tests passed in `test-phase6.js`. All previous Phase 1-5 tests continue to pass.

## Phase 7 — Analytics & Reports

Status: COMPLETED

Checklist:
- [x] Complaint statistics
- [x] Category analytics
- [x] Priority analytics
- [x] Status analytics
- [x] Resolution-time analytics
- [x] Technician workload
- [x] Dashboard charts
- [x] Admin analytics dashboard

### Phase 7 Implementation Summary
- **Backend Architecture:** Analytics logic isolated into `server/services/analytics/analyticsService.js` to ensure controllers remain lightweight.
- **Aggregation Approach:** Heavy processing is offloaded to efficient MongoDB aggregation pipelines avoiding N+1 query problems and JS-side calculations.
- **Filters & Role Access:** Endpoints (`/api/v1/analytics/*`) allow filtering by `days`, `from`, and `to`. Access is robustly protected by `roleMiddleware`, keeping Administrative data restricted to `admin` and `warden`. Technicians can view `/technicians` but it is automatically scoped to their own stats.
- **Frontend Dashboard:** Built a responsive, professional university-administration interface using `recharts` for charts. Avoiding overly aggressive styling, it strictly adheres to the established MERN stack and Cream/Sage color scheme.
- **Security:** Endpoints are exclusively `GET` and rigorously reject malformed date filters. Students are completely barred from access.
- **Tests Executed:** 22/22 tests passed in `test-phase7.js` (including role verifications, filter rejections, and verifying MongoDB aggregations). Existing tests (Phase 1-6) continue to pass.

## Phase 8 — Testing & Security Hardening

Status: NOT STARTED

Checklist:

- [ ] Complete backend test coverage
- [ ] Complete frontend test coverage
- [ ] Authentication security review
- [ ] Authorization review
- [ ] Input validation review
- [ ] API security review
- [ ] Rate limiting review
- [ ] Secret scanning
- [ ] Error handling review
- [ ] Performance testing
- [ ] Final regression testing
