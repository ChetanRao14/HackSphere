const express = require('express');
const router = express.Router();
const { createHackathon, getHackathons, updateHackathon, deleteHackathon, getStats, getParticipants } = require('../controllers/admin');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/stats', auth, isAdmin, getStats);
router.get('/user-directory', auth, isAdmin, getParticipants);
router.post('/hackathon', auth, isAdmin, createHackathon);
router.get('/hackathons', auth, isAdmin, getHackathons);
router.put('/hackathon/:id', auth, isAdmin, updateHackathon);
router.delete('/hackathon/:id', auth, isAdmin, deleteHackathon);
router.get('/test-route', (req, res) => res.json({ message: 'Admin routing is working!' }));

module.exports = router;
