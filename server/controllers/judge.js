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

    const skip  = (page - 1) * limit;
    const teams = await Team.find(query)
      .sort({ registrationRank: 1 })   // show in registration order
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
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

module.exports = { getTeams, joinHackathon, leaveHackathon };
