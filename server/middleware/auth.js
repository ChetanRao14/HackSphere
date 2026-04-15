const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isJudge = async (req, res, next) => {
  if (req.user && req.user.role === 'judge') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Judge role required.' });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = { auth, isJudge, isAdmin };
