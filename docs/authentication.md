# Authentication & Authorization Design

## Overview
JWT-based authentication with Role-Based Access Control (RBAC). Uses access tokens (short-lived) and refresh tokens (long-lived) for secure session management.

## Authentication Flow

### Registration
1. User submits registration form (name, email, password, role, department)
2. Server validates input and checks for existing email
3. Password is hashed using bcrypt (salt rounds: 12)
4. User record created with `isEmailVerified: false`
5. Email verification OTP sent via Nodemailer
6. User verifies email by submitting OTP
7. Account activated upon successful verification

### Login
1. User submits email and password
2. Server validates credentials against bcrypt hash
3. Check if email is verified and account is active
4. Generate JWT access token (short-lived, e.g., 15 minutes)
5. Generate JWT refresh token (long-lived, e.g., 7 days)
6. Refresh token stored in HTTP-only secure cookie
7. Access token returned in response body
8. Update lastLogin timestamp

### Token Refresh
1. Client detects access token expiration (401 response)
2. Client sends refresh token (from cookie) to /refresh-token endpoint
3. Server verifies refresh token
4. New access token and refresh token issued
5. Old refresh token invalidated (rotation)

### Logout
1. Client calls /logout endpoint
2. Server invalidates refresh token
3. Client clears access token from memory
4. Refresh token cookie cleared

### Password Reset
1. User requests password reset via email
2. Server generates OTP and sends via email
3. OTP stored with expiry (e.g., 10 minutes)
4. User submits OTP and new password
5. Server verifies OTP, hashes new password, updates record
6. All existing refresh tokens invalidated

## JWT Token Structure

### Access Token Payload
```json
{
  "userId": "ObjectId",
  "email": "user@university.edu",
  "role": "student",
  "department": "ObjectId"
}
```

### Token Configuration
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Algorithm: HS256
- Secrets: Separate secrets for access and refresh tokens

## Role-Based Access Control (RBAC)

### Roles Hierarchy
```
Super Admin
    └── Admin
        └── Department Head
            └── Staff
                └── Faculty
                    └── Student
```

### Role Permissions

| Permission | Student | Faculty | Staff | Dept Head | Admin | Super Admin |
|---|---|---|---|---|---|---|
| Submit complaint | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own complaints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View department complaints | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View all complaints | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Assign complaints | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Change complaint status | ❌ | ❌ | ✅* | ✅ | ✅ | ✅ |
| Escalate complaints | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View analytics | ❌ | ❌ | ❌ | ✅** | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage departments | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage roles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

\*Staff can update status only on complaints assigned to them  
\*\*Dept Head sees department-scoped analytics only

### RBAC Middleware Design
- Middleware accepts array of allowed roles
- Checks JWT payload's role against allowed roles
- Returns 403 Forbidden if role not authorized
- Additional scoping logic for resource-level access (e.g., own complaints, department complaints)

## Security Measures
- Passwords: bcrypt with salt rounds 12
- Tokens: Separate secrets for access and refresh tokens
- Cookies: HTTP-only, Secure, SameSite=Strict for refresh tokens
- Rate limiting: 10 attempts per 15 minutes on login/register
- Account lockout: After 5 failed login attempts, lock for 30 minutes (future enhancement)
- OTP: 6-digit numeric, expires in 10 minutes, single use
- Input validation: Email format, password strength (min 8 chars, uppercase, lowercase, number)

## Frontend Auth Integration
- Access token stored in memory (not localStorage for XSS protection)
- Axios interceptor automatically attaches access token to requests
- Axios interceptor catches 401, attempts silent refresh, retries original request
- Auth context provider manages auth state across the app
- Protected route components check auth state and redirect to login
- Role-based component rendering (show/hide UI elements based on role)
