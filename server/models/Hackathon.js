const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['in-person', 'online', 'hybrid'],
    default: 'in-person'
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  eventStartDate: {
    type: Date,
    required: true
  },
  eventEndDate: {
    type: Date,
    required: true
  },
  maxTeams: {
    type: Number,
    default: 50
  },
  prizePool: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed', 'completed'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Hackathon', hackathonSchema);
