const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');

// Judge joins a hackathon to review it
const joinHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });
    
    // Add judge if not already registered
    if (!hackathon.judges.some(j => j.toString() === req.user.id)) {
      hackathon.judges.push(req.user.id);
      await hackathon.save();
    }
    
    res.json({ message: 'Successfully joined as judge.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while joining hackathon.' });
  }
};

// Judge views abstracts for a specific hackathon (read-only)
const getTeams = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const hackathonId = req.query.hackathonId || '';
    const filterCollege = req.query.college || '';
    const filterPlace    = req.query.place    || '';

    if (!hackathonId) return res.status(400).json({ message: 'hackathonId is required.' });

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });

    // 1. Verify judge is registered
    if (!hackathon.judges.some(j => j.toString() === req.user.id)) {
      return res.status(403).json({ message: 'You must register as a judge for this event to view submissions.' });
    }

    // 2. Verify registration window is closed
    const now = new Date();
    if (now < new Date(hackathon.registrationDeadline)) {
      return res.status(403).json({ message: 'Submissions are locked until the registration deadline passes.' });
    }

    const query = { hackathon: hackathonId };
    if (search) query.teamName = { $regex: search, $options: 'i' };

    // If college/place filter is specified, first find matching user IDs
    if (filterCollege || filterPlace) {
      const userQuery = {};
      if (filterCollege) userQuery.college = { $regex: filterCollege, $options: 'i' };
      if (filterPlace)    userQuery.place    = { $regex: filterPlace,    $options: 'i' };
      const User = require('../models/User');
      const matchingUsers = await User.find(userQuery).select('_id');
      const matchingIds = matchingUsers.map(u => u._id);
      query.createdBy = { $in: matchingIds };
    }

    const skip  = (page - 1) * limit;
    const teams = await Team.find(query)
      .sort({ registrationRank: 1 })   // show in registration order
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email college city')
      .populate('hackathon', 'title');

    const total = await Team.countDocuments(query);

    res.json({
      teams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTeams: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching teams.' });
  }
};

const leaveHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });

    // Removal logic (using $pull)
    await Hackathon.findByIdAndUpdate(req.params.id, {
      $pull: { judges: req.user.id }
    });

    res.json({ message: 'Successfully unregistered from judging this event.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while leaving hackathon.' });
  }
};

// Get all participants/judges for directory view
const getParticipants = async (req, res) => {
  try {
    const { college, place, search, role } = req.query;
    const User = require('../models/User');
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    } else {
      query.role = { $in: ['participant', 'judge'] };
    }

    if (college) query.college = { $regex: college, $options: 'i' };
    if (place)    query.place    = { $regex: place,    $options: 'i' };
    if (search)  query.name    = { $regex: search,  $options: 'i' };

    const participants = await User.find(query)
      .select('name email role college place createdAt')
      .sort({ createdAt: -1 });
    res.json(participants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch directory.' });
  }
};

module.exports = { getTeams, joinHackathon, leaveHackathon, getParticipants };
