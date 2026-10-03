# Testing Strategy — Updated Phase 8

## Overview
UniIssueHub uses a practical, layered testing approach. Each phase includes a dedicated integration test script (`test-phase*.js`) that exercises the real API against a live local server and MongoDB instance.

## Current Test Scripts

| Script | Phase | Tests | Status |
|---|---|---|---|
| `test-phase3.js` | Complaint Management | — | PASS |
| `server/test-phase4.js` | Assignment & Resolution | — | PASS |
| `server/test-phase5.js` | AI Intelligence | — | PASS |
| `server/test-phase6.js` | Notifications & Email | 26 | PASS |
| `server/test-phase7.js` | Analytics | 22 | PASS |
| `server/test-phase8.js` | Security & Regression | 29 | PASS |

## Phase 8 Security Test Coverage (T1–T29)

| Test | Description | Result |
|---|---|---|
| T1 | Unauthenticated API rejected (401) | PASS |
| T2 | Invalid JWT rejected (401) | PASS |
| T3 | Inactive user rejected (structural check) | PASS |
| T4 | Student blocked from admin analytics (403) | PASS |
| T5 | Student cannot read another student's complaint (403) | PASS |
| T6 | Technician cannot modify another technician's assignment (400) | PASS |
| T7 | User cannot read another user's notifications (enforced by query) | PASS |
| T8 | User cannot mark another user's notification as read (404) | PASS |
| T9 | Student cannot close complaint (403) | PASS |
| T10 | Technician cannot close complaint (403) | PASS |
| T11 | Invalid status transition rejected (400) | PASS |
| T12 | Invalid ObjectId handled gracefully | PASS |
| T13 | Invalid enum value rejected (400) | PASS |
| T14 | Malformed date filter ignored safely | PASS |
| T15 | Pagination limit bounded at 100 | PASS |
| T16 | Analytics endpoints are read-only | PASS |
| T17 | AI endpoints require authentication (401) | PASS |
| T18 | AI writes only to AIAnalysis, not Complaint | PASS |
| T19 | Socket.IO requires JWT handshake | PASS |
| T20 | Socket rooms are private to user | PASS |
| T21 | Email failure does not break business operation | PASS |
| T22 | No real secrets in tracked source files | PASS |
| T23–T29 | Regression: All Phase 1–7 tests pass | PASS |

## Running Tests

> **Important**: The server must be running on `127.0.0.1:5000` before running any test script.

```bash
# Start the server
cd server
npm start

# In another terminal, run tests
node test-phase8.js
node test-phase7.js
node test-phase6.js
node test-phase5.js
node test-phase4.js
node ../test-phase3.js
```

## Security Testing Strategy

### RBAC Matrix

| Route | Student | Technician | Warden | Admin |
|---|---|---|---|---|
| `GET /auth/me` | ✅ own | ✅ own | ✅ own | ✅ own |
| `POST /complaints` | ✅ create | ❌ | ✅ | ✅ |
| `GET /complaints` | ✅ own only | ✅ assigned | ✅ scope | ✅ all |
| `GET /complaints/:id` | ✅ own only | ✅ assigned | ✅ | ✅ |
| `POST /complaints/:id/assign` | ❌ | ❌ | ✅ | ✅ |
| `PATCH /complaints/:id/close` | ❌ | ❌ | ✅ | ✅ |
| `GET /assignments/my` | ❌ | ✅ own | ❌ | ❌ |
| `PATCH /assignments/:id/start` | ❌ | ✅ own only | ❌ | ❌ |
| `PATCH /assignments/:id/reassign` | ❌ | ❌ | ✅ | ✅ |
| `GET /notifications` | ✅ own | ✅ own | ✅ own | ✅ own |
| `GET /analytics/overview` | ❌ | ❌ | ✅ | ✅ |
| `GET /analytics/technicians` | ❌ | ✅ own scope | ✅ | ✅ |
| `GET /ai/complaint/:id` | ✅ own | ✅ assigned | ✅ | ✅ |

### IDOR Prevention
- All ownership checks use `req.user._id` from verified JWT, never from request body or URL.
- Notifications are queried with `{ recipientId: req.user._id }` — cross-user access is impossible.
- Assignments are verified via `assignment.technicianId.toString() !== req.user._id.toString()`.

### Brute Force Protection
- Global rate limit: 100 req / 15 min / IP.
- Auth endpoints (login, register): additional `authLimiter` — 20 req / 15 min / IP, skips successful requests.

## Known Limitations
- **No formal test runner** (Jest/Mocha) — tests run as standalone Node scripts against a live server. This is intentional to avoid a complex test setup for a development project.
- **T3 (Inactive user)** — verified structurally (code path exists) rather than via API call (no inactive test user exists in the seed data).
- **T19–T20 (Socket.IO)** — verified at code level. Full socket integration test requires a dedicated WebSocket client test harness.
- **braces vulnerability** in `nodemon` and `tailwindcss` dev dependencies — both are dev-only and the fix requires major breaking version upgrades. Not exploitable at runtime in production. Documented for awareness.

## Dependency Audit Summary

### Server
- `nodemon` (devDependency): `braces` vulnerability — dev tool only, not in production build. Risk: negligible.
- All production dependencies: No high-severity vulnerabilities.

### Client
- `tailwindcss` (devDependency): `braces` vulnerability via `chokidar` — build-time only, not shipped to browser. Risk: negligible.
- All production dependencies: No high-severity vulnerabilities.

> The `braces` vulnerability (GHSA-vfj7-8cjw-p6xm) affects pattern matching in file watchers. It only applies during development/build time. It is not exploitable from user requests in production.
