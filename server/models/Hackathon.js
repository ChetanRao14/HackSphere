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
  registrationStartDate: {
    type: Date,
    required: true
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  judges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ── Automated Status Logic ───────────────────────────────────────────
hackathonSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (now < this.registrationStartDate) return 'announcement';
  if (now < this.registrationDeadline)  return 'upcoming'; // Mapping 'open' to 'upcoming' for existing UI compatibility
  if (now < this.eventStartDate)         return 'closed';
  if (now < this.eventEndDate)           return 'active';
  return 'completed';
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
