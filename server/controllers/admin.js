const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const User = require('../models/User');

// ── Shared date validation helper ──────────────────────────────────────────
const validateDates = (registrationStartDate, registrationDeadline, eventStartDate, eventEndDate) => {
  const now = new Date();
  const regS  = new Date(registrationStartDate);
  const regD  = new Date(registrationDeadline);
  const start = new Date(eventStartDate);
  const end   = new Date(eventEndDate);

  if (isNaN(regS) || isNaN(regD) || isNaN(start) || isNaN(end)) {
    return 'One or more dates are invalid.';
  }
  // Registration start can be now or future, but let's just ensure order for simplicity
  if (regS >= regD) {
    return 'Registration start must be before the deadline.';
  }
  if (regD >= start) {
    return 'Registration deadline must be before the event start date.';
  }
  if (start >= end) {
    return 'Event start date must be before the event end date.';
  }
  return null; // no error
};

// ── Collision check helper ──────────────────────────────────────────────────
// Two hackathons collide if their event date ranges overlap.
// Overlap condition: existing.start < new.end  AND  existing.end > new.start
const checkCollision = async (eventStartDate, eventEndDate, excludeId = null) => {
  const start = new Date(eventStartDate);
  const end   = new Date(eventEndDate);

  const query = {
    eventStartDate: { $lt: end },
    eventEndDate:   { $gt: start },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const collision = await Hackathon.findOne(query).select('title eventStartDate eventEndDate');
  return collision;
};

// Create a hackathon
const createHackathon = async (req, res) => {
  try {
    const {
      title, description, location, mode,
      registrationStartDate, registrationDeadline, 
      eventStartDate, eventEndDate,
      maxTeams, prizePool, tags
    } = req.body;

    // 1. Date logic validation
    const dateError = validateDates(registrationStartDate, registrationDeadline, eventStartDate, eventEndDate);
    if (dateError) return res.status(400).json({ message: dateError });

    // 2. Collision detection
    const collision = await checkCollision(eventStartDate, eventEndDate);
    if (collision) {
      const colStart = new Date(collision.eventStartDate).toLocaleString('en-US');
      const colEnd   = new Date(collision.eventEndDate).toLocaleString('en-US');
      return res.status(409).json({
        message: `Date conflict: "${collision.title}" is already scheduled from ${colStart} to ${colEnd}. Choose non-overlapping dates.`
      });
    }

    const hackathon = new Hackathon({
      title, description, location, mode,
      registrationStartDate, registrationDeadline, 
      eventStartDate, eventEndDate,
      maxTeams, prizePool, tags,
      createdBy: req.user.id
    });

    await hackathon.save();
    res.status(201).json(hackathon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create hackathon.' });
  }
};

// Get all hackathons
const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json(hackathons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch hackathons' });
  }
};

// Update a hackathon
const updateHackathon = async (req, res) => {
  try {
    const { registrationStartDate, registrationDeadline, eventStartDate, eventEndDate } = req.body;

    // 1. Date logic validation
    const dateError = validateDates(registrationStartDate, registrationDeadline, eventStartDate, eventEndDate);
    if (dateError) return res.status(400).json({ message: dateError });

    // 2. Collision detection (exclude this hackathon itself)
    const collision = await checkCollision(eventStartDate, eventEndDate, req.params.id);
    if (collision) {
      const colStart = new Date(collision.eventStartDate).toLocaleString('en-US');
      const colEnd   = new Date(collision.eventEndDate).toLocaleString('en-US');
      return res.status(409).json({
        message: `Date conflict: "${collision.title}" is already scheduled from ${colStart} to ${colEnd}. Choose non-overlapping dates.`
      });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(hackathon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update hackathon.' });
  }
};

// Delete a hackathon
const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    res.json({ message: 'Hackathon deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete hackathon' });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const [totalTeams, totalParticipants, totalJudges, totalAdmins, totalHackathons, pendingTeams] = await Promise.all([
      Team.countDocuments(),
      User.countDocuments({ role: 'participant' }),
      User.countDocuments({ role: 'judge' }),
      User.countDocuments({ role: 'admin' }),
      Hackathon.countDocuments(),
      Team.countDocuments({ status: 'waitlisted' })
    ]);

    const statusBreakdown = await Team.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ totalTeams, totalParticipants, totalJudges, totalAdmins, totalHackathons, pendingTeams, statusBreakdown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

module.exports = { createHackathon, getHackathons, updateHackathon, deleteHackathon, getStats };
