const express = require('express');
const router = express.Router();
const { getTeams, joinHackathon, leaveHackathon, getParticipants } = require('../controllers/judge');
const { updateHackathon, getHackathons } = require('../controllers/admin');
const { auth, isJudge } = require('../middleware/auth');

router.get('/hackathons', auth, isJudge, getHackathons);
router.get('/teams', auth, isJudge, getTeams);
router.get('/participants', auth, isJudge, getParticipants);
router.post('/hackathon/:id/join', auth, isJudge, joinHackathon);
router.post('/hackathon/:id/leave', auth, isJudge, leaveHackathon);
router.put('/hackathon/:id/timings', auth, isJudge, updateHackathon);

module.exports = router;

