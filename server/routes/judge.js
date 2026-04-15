const express = require('express');
const router = express.Router();
const { getTeams } = require('../controllers/judge');
const { auth, isJudge } = require('../middleware/auth');

router.get('/teams', auth, isJudge, getTeams);

module.exports = router;
