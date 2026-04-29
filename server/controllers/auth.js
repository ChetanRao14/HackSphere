const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ADMIN_CODE = process.env.ADMIN_CODE || 'HACKSPHERE_ADMIN_2025';

const register = async (req, res) => {
  try {
    const { name, email, password, role, adminCode, college, place } = req.body;

    // Server-side validation (frontend 'required' can be bypassed via direct API calls)
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Determine role with validation
    let userRole = 'participant';
    if (role === 'judge') {
      userRole = 'judge';
    } else if (role === 'admin') {
      if (!adminCode || adminCode !== ADMIN_CODE) {
        return res.status(403).json({ message: 'Invalid admin access code. Please try again.' });
      }
      userRole = 'admin';
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      college,
      place
    });

    await user.save();

    res.status(201).json({ message: 'Account created successfully! Please sign in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `Account exists, but not as a ${role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        place: user.place
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      place: user.place
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
