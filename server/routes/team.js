const express = require('express');
const router = express.Router();
const { createTeam, getMyTeams, cancelRegistration } = require('../controllers/team');
const { auth } = require('../middleware/auth');

router.post('/create', auth, createTeam);
router.get('/my', auth, getMyTeams);
router.delete('/:id', auth, cancelRegistration);

module.exports = router;
