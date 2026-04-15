const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');

const createTeam = async (req, res) => {
  try {
    const { teamName, members, abstract, hackathonId } = req.body;

    if (!hackathonId) return res.status(400).json({ message: 'Please select a hackathon to register for.' });

    // Check hackathon exists and is open
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });
    if (!['upcoming', 'active'].includes(hackathon.status)) {
      return res.status(400).json({ message: 'This hackathon is no longer accepting registrations.' });
    }
    const now = new Date();
    if (now > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed for this hackathon.' });
    }

    // One team per user
    const existingTeam = await Team.findOne({ createdBy: req.user.id });
    if (existingTeam) return res.status(400).json({ message: 'You have already submitted a team.' });

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
    const populated = await newTeam.populate('hackathon', 'title location eventStartDate maxTeams');
    res.status(201).json({ ...populated.toObject(), autoStatus, rank });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'You already registered a team.' });
    console.error(error);
    res.status(500).json({ message: 'Server error while creating team.' });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ createdBy: req.user.id })
      .populate('hackathon', 'title location eventStartDate eventEndDate maxTeams registrationDeadline');
    if (!team) return res.status(404).json({ message: 'No team found.' });
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createTeam, getMyTeam };
