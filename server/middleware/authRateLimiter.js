import rateLimit from 'express-rate-limit';

// Stricter rate limiter for auth endpoints (brute-force protection)
// 20 attempts per 15 minutes per IP, skips successful requests
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait and try again.',
  },
  skipSuccessfulRequests: true,
});
