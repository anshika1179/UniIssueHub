import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const googleClient = new OAuth2Client();
const SIGNUP_ROLES = ['student', 'warden', 'technician', 'admin'];
const PENDING_MESSAGE = 'Your account is pending. An admin must assign your role before you can sign in.';

const validateRegisterInput = ({ name, email, password }) => {
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return 'Please provide a valid email address.';
  }
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
};

// ─── Controllers ────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, hostel, role = 'student' } = req.body;
    if (!SIGNUP_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Invalid requested role.' });

    // Server-side validation
    const validationError = validateRegisterInput({ name, email, password });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'student', // Privileges are assigned only by an admin.
      requestedRole: role,
      roleApproval: role === 'student' ? 'approved' : 'pending',
      rollNumber,
      department,
      hostel,
    });

    res.status(201).json({ success: true, message: role === 'student' ? 'Registration successful. You can now login.' : PENDING_MESSAGE });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Generic message — do not reveal whether email exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'This account has been deactivated. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.roleApproval === 'pending') {
      return res.status(403).json({ success: false, message: PENDING_MESSAGE });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return res.status(503).json({ success: false, message: 'Google login is not configured on the server.' });
  }
  const { credential, accessToken, role = 'student' } = req.body;
  if (!SIGNUP_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Invalid requested role.' });
  if ((typeof credential !== 'string' || !credential.trim()) && (typeof accessToken !== 'string' || !accessToken.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a Google sign-in credential.' });
  }

  let payload;
  try {
    if (typeof accessToken === 'string' && accessToken.trim()) {
      // Never trust a profile supplied by the browser. Verify the token with Google
      // and bind it to this OAuth client before requesting the account's profile.
      const infoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!infoResponse.ok) throw new Error('Invalid Google access token');
      const info = await infoResponse.json();
      if (info.aud !== clientId || !info.sub || !Number.isFinite(Number(info.expires_in)) || Number(info.expires_in) <= 0) {
        throw new Error('Wrong audience or expired Google access token');
      }
      const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!profileResponse.ok) throw new Error('Invalid Google profile');
      payload = await profileResponse.json();
      if (payload.sub !== info.sub) throw new Error('Google account mismatch');
    } else {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    }
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired Google credential. Please try again.' });
  }
  if (!payload?.sub || payload.email_verified !== true || !EMAIL_REGEX.test(payload.email || '')) {
    return res.status(401).json({ success: false, message: 'Google must verify your email before you can sign in.' });
  }

  try {
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub }).select('+googleId');
    if (!user) {
      user = await User.findOne({ email }).select('+googleId');
      if (user) {
        // Only auto-link when Google is authoritative for the email address.
        // For third-party email accounts, email_verified alone is not enough.
        const authoritativeEmail = email.endsWith('@gmail.com') || Boolean(payload.hd);
        if ((user.googleId && user.googleId !== payload.sub) || !authoritativeEmail) {
          return res.status(401).json({ success: false, message: 'Please sign in to this account with your email and password.' });
        }
      } else {
        user = await User.create({
          name: payload.name?.trim() || email.split('@')[0],
          email,
          // The existing model requires a password; use a random, unknown one.
          // It is hashed by the same save hook as normal registration.
          password: randomBytes(32).toString('hex'),
          googleId: payload.sub,
          role: 'student', // Never grant privileges during signup.
          requestedRole: role,
          roleApproval: role === 'student' ? 'approved' : 'pending',
        });
      }
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'This account has been deactivated. Please contact support.' });
    }
    if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    if (user.roleApproval === 'pending') {
      return res.status(403).json({ success: false, message: PENDING_MESSAGE });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Account sign-in changed. Please try again.' });
    }
    res.status(500).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }
};

export const logout = (_req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};
