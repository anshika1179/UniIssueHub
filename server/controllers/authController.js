import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const { name, email, password, rollNumber, department, hostel } = req.body;

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
      role: 'student', // Always forced — never trust client role
      rollNumber,
      department,
      hostel,
    });

    res.status(201).json({ success: true, message: 'Registration successful. You can now login.' });
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
