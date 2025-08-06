const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Register new user
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
  if (password !== confirmPassword) 
    return res.json({ status: 'error', message: 'Passwords do not match' });
  
  const existingUser = await User.findOne({ email });
  if (existingUser) 
    return res.json({ status: 'error', message: 'User already exists with this email' });

  const user = new User({ firstName, lastName, email, phone, password });
  await user.save();
  const token = generateToken(user._id);
  
  res.json({ status: 'success', data: { token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } } });
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) 
    return res.json({ status: 'error', message: 'Invalid credentials' });
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) 
    return res.json({ status: 'error', message: 'Invalid credentials' });
  
  const token = generateToken(user._id);
  res.json({ status: 'success', data: { token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } } });
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
  res.json({ status: 'success', data: { user: { id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email, phone: req.user.phone } } });
});

module.exports = router;
