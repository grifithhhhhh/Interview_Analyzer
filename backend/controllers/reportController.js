const Interview = require('../models/Interview.js');
const Candidate = require('../models/Candidate.js');

const getReport = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const candidate = await Candidate.findById(interview.candidate);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const answersWithQuestions = interview.answers.map((answer) => {
      const question = interview.questions[answer.questionIndex] || {};
      return {
        questionIndex: answer.questionIndex,
        questionText: answer.questionText,
        type: question.type,
        difficulty: question.difficulty,
        transcript: answer.transcript,
        score: answer.score,
        verdict: answer.verdict,
        tip: answer.tip,
        skipped: answer.skipped,
      };
    });

    const verdictCounts = answersWithQuestions.reduce(
      (acc, a) => {
        if (!a.skipped) acc[a.verdict] = (acc[a.verdict] || 0) + 1;
        return acc;
      },
      { good: 0, average: 0, weak: 0 }
    );

    const report = {
      candidate: {
        name: candidate.name,
        email: candidate.email,
        jobRole: interview.jobRole,
      },
      resumeAnalysis: candidate.resumeAnalysis,
      interview: {
        status: interview.status,
        overallInterviewScore: interview.overallScore,
        totalQuestions: interview.questions.length,
        answeredQuestions: interview.answers.filter(a => !a.skipped).length,
        skippedQuestions: interview.answers.filter(a => a.skipped).length,
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