const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const { getCandidateMe } = require('../controllers/candidateController');

// GET /api/candidates/me — must be before /:id to avoid 'me' being treated as an id
router.get('/me', authMiddleware, roleMiddleware('candidate'), getCandidateMe);

// GET /api/candidates/all — interviewer only
router.get('/all', authMiddleware, roleMiddleware('interviewer'), async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      candidates.map(async (c) => {
        const interview = await Interview.findOne({ candidate: c._id });
        return {
          ...c.toObject(),
          interviewStatus: interview?.status || 'pending',
          interviewScore: interview?.overallScore || null,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/init', authMiddleware, roleMiddleware('candidate'), async (req, res) => {
  try {
    const { jobRole } = req.body;
    const candidate = await Candidate.findOneAndUpdate(
      { user: req.user.userId },
      { user: req.user.userId, name: req.user.name || 'Candidate', jobRole, questions: [] },
      { new: true, upsert: true }
    );
    await Interview.findOneAndDelete({ candidate: candidate._id });
    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/role', authMiddleware, roleMiddleware('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { jobRole: req.body.jobRole },
      { new: true }
    );
    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;