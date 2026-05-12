const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    console.log('Signup endpoint called with body:', req.body);
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const safe = { _id: user._id, name: user.name, email: user.email, role: user.role };
    return res.status(201).json(safe);
  } catch (err) {
    console.error('Signup error:', err && err.stack ? err.stack : err);
    if (err.code === 11000) return res.status(409).json({ message: 'Email already registered' });
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log('Login called with body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET current user profile
exports.getMe = async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json(user)
  } catch (err) {
    console.error('GetMe error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getProfile = async (req,res) => {
  try{
    const User = require('../models/User')
    const u = await User.findById(req.user.id).select('-password')
    if(!u) return res.status(404).json({ message: 'User not found' })
    return res.json(u)
  }catch(err){
    console.error('Profile error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}