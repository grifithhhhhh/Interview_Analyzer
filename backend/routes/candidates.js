const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

// GET /api/candidates/all — interviewer only
router.get('/all', authMiddleware, roleMiddleware('interviewer'), async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    // Attach interview status and score to each candidate
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

module.exports = router;