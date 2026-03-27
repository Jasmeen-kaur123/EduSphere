const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with the provided role (admin, instructor, or student)
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    await user.save();

    res.json({ 
      success: true, 
      message: 'Signup successful',
      role: user.role 
    });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      token,
      role: user.role,
      username: user.username,
      email: user.email,
      message: 'Login successful'
    });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
