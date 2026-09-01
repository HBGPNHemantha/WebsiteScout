const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

/**
 * Generate JWT token
 */
function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new agency/freelancer user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, agencyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      agencyName: agencyName || `${name}'s Agency`,
    });

    const token = createToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        agencyName: user.agencyName,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = createToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        agencyName: user.agencyName,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed.' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        agencyName: req.user.agencyName,
        role: req.user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
  }
});

module.exports = router;
