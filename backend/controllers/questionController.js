const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateQuestions = async (req, res) => {
  try {
    const { candidateId, jobRole } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const hasResume = candidate.resumeAnalysis?.summary;

    const prompt = `
You are an expert technical interviewer. Generate exactly 8 interview questions for a ${jobRole} position.
${hasResume ? `
Candidate background:
${candidate.resumeAnalysis.summary}
Skills: ${candidate.resumeAnalysis.skills?.join(', ')}
` : ''}
Question distribution — follow this exactly:
- Questions 1, 2, 3: easy (warm-up, basic concepts, simple definitions)
- Questions 4, 5, 6: medium (applied knowledge, problem solving, situational)
- Questions 7, 8: hard (advanced concepts, architecture, complex scenarios)

Scoring should be encouraging — reward effort and partial knowledge, not just perfect answers.

Return ONLY a valid JSON array, no markdown:
[
  { "text": "question here", "type": "technical|behavioral", "difficulty": "easy|medium|hard" }
]
`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      messages: [
        { role: 'system', content: 'Return valid JSON only, no markdown, no extra text.' },
        { role: 'user', content: prompt }
      ]
    });

    const raw = response.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);

    // Create a fresh interview for this attempt
    const interview = await Interview.create({
      user: req.user.userId,
      candidate: candidateId,
      jobRole,
      questions,
      answers: [],
      status: 'pending',
    });

    res.json({ success: true, questions, interviewId: interview._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    // Get the latest interview for this candidate
    const interview = await Interview.findOne({ candidate: req.params.candidateId })
      .sort({ createdAt: -1 });
    if (!interview) return res.status(404).json({ error: 'No interview found' });
    res.json({ questions: interview.questions, interviewId: interview._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generateQuestions, getQuestions };