const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');

// Public: get all upcoming hackathons
router.get('/', async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ status: { $in: ['upcoming', 'active'] } })
      .sort({ eventStartDate: 1 });
    res.json(hackathons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hackathons' });
  }
});

module.exports = router;
