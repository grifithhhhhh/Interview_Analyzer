// backend/controllers/reportController.js
const Interview = require('../models/Interview.js');
const Candidate = require('../models/Candidate.js');

const getReport = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const [candidate, interview] = await Promise.all([
      Candidate.findById(candidateId),
      Interview.findOne({ candidate: candidateId }),
    ]);

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const answersWithQuestions = interview.answers.map((answer) => {
      const question = candidate.questions[answer.questionIndex] || {};
      return {
        questionIndex: answer.questionIndex,
        questionText: answer.questionText,
        type: question.type,
        difficulty: question.difficulty,
        transcript: answer.transcript,
        score: answer.score,
        verdict: answer.verdict,
        tip: answer.tip,
      };
    });

    const verdictCounts = answersWithQuestions.reduce(
      (acc, a) => { acc[a.verdict] = (acc[a.verdict] || 0) + 1; return acc; },
      { good: 0, average: 0, weak: 0 }
    );

    const report = {
      candidate: {
        name: candidate.name,
        email: candidate.email,
        jobRole: candidate.jobRole,
      },
      resumeAnalysis: candidate.resumeAnalysis,
      interview: {
        status: interview.status,
        overallInterviewScore: interview.overallScore,
        totalQuestions: candidate.questions.length,
        answeredQuestions: interview.answers.length,
        verdictBreakdown: verdictCounts,
        answers: answersWithQuestions,
      },
      finalScore: candidate.resumeAnalysis?.overall_score
        ? Math.round(
            candidate.resumeAnalysis.overall_score * 0.4 +
            (interview.overallScore || 0) * 0.6
          )
        : interview.overallScore,
      generatedAt: new Date().toISOString(),
    };

    res.json(report);
  } catch (err) {
    console.error('getReport error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getReport };