const Team = require('../models/Team');

// Judge views abstracts for a specific hackathon (read-only)
const getTeams = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const hackathonId = req.query.hackathonId || '';

    if (!hackathonId) return res.status(400).json({ message: 'hackathonId is required.' });

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

module.exports = { getTeams };
