const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');

const createTeam = async (req, res) => {
  try {
    const { teamName, members, abstract, hackathonId } = req.body;

    if (!hackathonId) return res.status(400).json({ message: 'Please select a hackathon to register for.' });

    // Check hackathon exists and is open
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });
    const now = new Date();
    if (now < new Date(hackathon.registrationStartDate)) {
      return res.status(400).json({ message: 'Registration for this hackathon has not opened yet.' });
    }
    if (now > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed for this hackathon.' });
    }

    // One team per hackathon per user
    const existingTeam = await Team.findOne({ createdBy: req.user.id, hackathon: hackathonId });
    if (existingTeam) return res.status(400).json({ message: 'You have already submitted a team for this hackathon.' });

    if (!members || members.length < 1 || members.length > 4) {
      return res.status(400).json({ message: 'Team must have between 1 and 4 members.' });
    }
    if (!abstract || abstract.length > 2000) {
      return res.status(400).json({ message: 'Abstract must be under 2000 characters.' });
    }

    // Count currently accepted teams → determine auto-status
    const acceptedCount = await Team.countDocuments({ hackathon: hackathonId, status: 'accepted' });
    const totalCount    = await Team.countDocuments({ hackathon: hackathonId });
    const autoStatus    = acceptedCount < hackathon.maxTeams ? 'accepted' : 'waitlisted';
    const rank          = totalCount + 1;

    const newTeam = new Team({
      teamName, members, abstract,
      hackathon: hackathonId,
      status: autoStatus,
      registrationRank: rank,
      createdBy: req.user.id
    });

    await newTeam.save();
    const populated = await newTeam.populate('hackathon');
    res.status(201).json({ ...populated.toObject(), autoStatus, rank });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'You have already registered for this hackathon.' });
    console.error(error);
    res.status(500).json({ message: 'Server error while creating team.' });
  }
};

const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ createdBy: req.user.id })
      .populate('hackathon')
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('hackathon');
    if (!team) return res.status(404).json({ message: 'Registration not found.' });

    // 1. Authorization check
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to cancel this registration.' });
    }

    // 2. Deadline check
    const now = new Date();
    if (now > new Date(team.hackathon.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration has already closed. You cannot cancel your team now.' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registration cancelled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while cancelling registration.' });
  }
};

module.exports = { createTeam, getMyTeams, cancelRegistration };
