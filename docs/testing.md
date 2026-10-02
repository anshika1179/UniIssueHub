# Testing Strategy

## Overview
Comprehensive testing strategy covering unit, integration, and end-to-end testing for both frontend and backend.

## Testing Tools

| Tool | Purpose |
|---|---|
| Jest | Test runner and assertion library (backend & frontend) |
| React Testing Library | Component testing for React |
| Supertest | HTTP integration testing for Express API |
| MongoDB Memory Server | In-memory MongoDB for test isolation |
| msw (Mock Service Worker) | API mocking for frontend tests |

## Testing Layers

### 1. Unit Tests

#### Backend Unit Tests
- **Models**: Mongoose schema validation, virtual fields, instance methods
- **Services**: Business logic (AI service, email service, complaint service)
- **Utils**: Helper functions, validators, formatters
- **Middleware**: Auth middleware, RBAC middleware, validation middleware
- **Target Coverage**: ≥ 80%

#### Frontend Unit Tests
- **Components**: Render output, user interactions, prop handling
- **Hooks**: Custom hook behavior and state changes
- **Utils**: Helper functions, formatters, validators
- **Services**: API service functions (mocked HTTP)
- **Target Coverage**: ≥ 70%

### 2. Integration Tests

#### Backend Integration Tests
- **API Routes**: Full request-response cycle using Supertest
  - Auth endpoints: register, login, logout, refresh, password reset
  - Complaint CRUD operations with auth
  - User management with RBAC enforcement
  - Department operations
  - Notification retrieval
  - Analytics endpoints
- **Database**: MongoDB Memory Server for isolated test database
- **Authentication Flow**: Full token lifecycle testing
- **File Upload**: Multer integration with test files

#### Frontend Integration Tests
- **Page Components**: Full page render with mocked API
- **Form Submissions**: Complete form flows (create complaint, login, register)
- **Navigation**: Route transitions and protected routes
- **Auth Flow**: Login → dashboard → logout cycle

### 3. End-to-End Tests (Future)
- Tool: Cypress or Playwright (to be decided)
- Critical user flows:
  - Student: Register → Verify Email → Login → Submit Complaint → Track Status
  - Dept Head: Login → View Complaints → Assign → Update Status
  - Admin: Login → Dashboard → Analytics → User Management

## Test Organization

### Backend
```
server/
├── __tests__/
│   ├── unit/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── complaints.test.js
│   │   ├── users.test.js
│   │   ├── departments.test.js
│   │   └── analytics.test.js
│   └── setup.js
```

### Frontend
```
client/src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── utils/
├── __mocks__/
│   └── handlers.js (MSW handlers)
└── setupTests.js
```

## Test Configuration
- Jest config in respective package.json files
- Environment variables loaded from .env.test
- Test database: MongoDB Memory Server (auto-created, auto-destroyed)
- Coverage reports: HTML + LCOV format
- CI integration: Tests run on every PR via GitHub Actions

## Coverage Goals

| Area | Target |
|---|---|
| Backend Unit Tests | ≥ 80% |
| Backend Integration Tests | ≥ 70% |
| Frontend Unit Tests | ≥ 70% |
| Frontend Integration Tests | ≥ 60% |
| Overall | ≥ 75% |

## Testing Best Practices (Planned)
- Write tests alongside implementation (TDD where practical)
- Each test should be independent and idempotent
- Use factories/fixtures for test data generation
- Clean up test data after each test suite
- Mock external services (email, AI) in tests
- Use descriptive test names: `should return 401 when token is missing`
- Run tests before every commit (pre-commit hook via Husky)
