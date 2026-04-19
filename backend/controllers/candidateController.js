const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

// GET /api/candidates/all — interviewer only
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      candidates.map(async (c) => {
        const interview = await Interview.findOne({ candidate: c._id }).sort({ createdAt: -1 });
        return {
          ...c.toObject(),
          interviewStatus: interview?.status || 'pending',
          interviewScore: interview?.overallScore || null,
          jobRole: interview?.jobRole || null,
          flagCount: interview?.flagCount || 0,
          voided: interview?.voided || false,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/candidates/me — logged in candidate's own profile + interview history
const getCandidateMe = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.userId });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const interviews = await Interview.find({ candidate: candidate._id })
      .sort({ createdAt: -1 });

    const latest = interviews[0];

    res.json({
      ...candidate.toObject(),
      interviewStatus: latest?.status || 'pending',
      interviewScore: latest?.overallScore || null,
      answers: latest?.answers || [],
      jobRole: latest?.jobRole || null,
      flagCount: latest?.flagCount || 0,
      voided: latest?.voided || false,
      interviewHistory: interviews.map(iv => ({
        _id: iv._id,
        jobRole: iv.jobRole,
        status: iv.status,
        overallScore: iv.overallScore,
        createdAt: iv.createdAt,
        answersCount: iv.answers.length,
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCandidates,
  getCandidateMe,
};