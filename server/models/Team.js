const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  members: {
    type: [String],
    required: true,
    validate: [(v) => v.length > 0 && v.length <= 4, 'A team must have between 1 and 4 members.']
  },
  abstract: { type: String, required: true, maxlength: 2000 },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  // auto-set: 'accepted' if slots remain, 'waitlisted' if full
  status: {
    type: String,
    enum: ['accepted', 'waitlisted'],
    default: 'accepted'
  },
  registrationRank: { type: Number }, // position in sign-up queue
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound index: A user can only register once per specific hackathon
teamSchema.index({ createdBy: 1, hackathon: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
