const express = require('express');
const router = express.Router();
const { createHackathon, getHackathons, updateHackathon, deleteHackathon, getStats } = require('../controllers/admin');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/stats', auth, isAdmin, getStats);
router.post('/hackathon', auth, isAdmin, createHackathon);
router.get('/hackathons', auth, isAdmin, getHackathons);
router.put('/hackathon/:id', auth, isAdmin, updateHackathon);
router.delete('/hackathon/:id', auth, isAdmin, deleteHackathon);

module.exports = router;
