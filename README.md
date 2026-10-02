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
| Phase 4 | Assignment & Resolution | 🔜 Next |
| Phase 5 | AI Intelligence | ⏳ Pending |
| Phase 6 | Real-Time Notifications | ⏳ Pending |
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
Status: NOT STARTED

Tasks:
- [ ] Technician management
- [ ] Complaint assignment
- [ ] Assignment model
- [ ] Technician complaint queue
- [ ] Assignment authorization
- [ ] Status transition workflow
- [ ] Resolution notes
- [ ] Resolve complaint
- [ ] Close complaint
- [ ] Assignment testing
