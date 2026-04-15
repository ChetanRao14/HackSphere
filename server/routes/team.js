const express = require('express');
const router = express.Router();
const { createTeam, getMyTeam } = require('../controllers/team');
const { auth } = require('../middleware/auth');

router.post('/create', auth, createTeam);
router.get('/my', auth, getMyTeam);

module.exports = router;
