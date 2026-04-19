const Candidate = require('../models/Candidate')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const generateQuestions = async (req, res) => {
  try {
    const { candidateId, jobRole } = req.body;
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    // Update jobRole on candidate if provided
    if (jobRole) {
      candidate.jobRole = jobRole;
    }

    const prompt = `
You are an expert technical interviewer. Generate exactly 8 interview questions for a ${jobRole || candidate.jobRole} position.

Candidate background:
${candidate.resumeAnalysis.summary}
Skills: ${candidate.resumeAnalysis.skills?.join(', ')}

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

    candidate.questions = questions;
    await candidate.save();

    res.json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId)
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' })
    res.json({ questions: candidate.questions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { generateQuestions , getQuestions}