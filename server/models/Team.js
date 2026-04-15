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
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
