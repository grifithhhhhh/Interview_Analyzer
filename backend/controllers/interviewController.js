const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const Interview = require('../models/Interview.js');
const Candidate = require('../models/Candidate.js');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/interview/answer
const submitAnswer = async (req, res) => {
  try {
    const { candidateId, questionIndex } = req.body;
    const audioFile = req.file;

    if (!audioFile || !candidateId || questionIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const question = candidate.questions[questionIndex];
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.path),
      model: 'whisper-large-v3',
      response_format: 'text',
    });
    const transcript = transcription.trim();

    const scoringPrompt = `
You are an expert technical interviewer. Evaluate this interview answer.

Question: "${question.text}"
Question Type: ${question.type}
Difficulty: ${question.difficulty}
Candidate's Answer: "${transcript}"

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "score": <integer 0-10>,
  "verdict": "<good|average|weak>",
  "tip": "<one specific, actionable improvement tip under 20 words>"
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: scoringPrompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    let feedback;
    try {
      const raw = completion.choices[0].message.content.trim();
      feedback = JSON.parse(raw);
    } catch {
      feedback = { score: 5, verdict: 'average', tip: 'Could not parse AI feedback.' };
    }

    let interview = await Interview.findOne({ candidate: candidateId });
    if (!interview) {
      interview = new Interview({
        candidate: candidateId,
        answers: [],
        status: 'in-progress',
      });
    }

    const existingIndex = interview.answers.findIndex(
      (a) => a.questionIndex === parseInt(questionIndex)
    );
    const answerData = {
      questionIndex: parseInt(questionIndex),
      questionText: question.text,
      transcript,
      score: feedback.score,
      verdict: feedback.verdict,
      tip: feedback.tip,
    };

    if (existingIndex > -1) {
      interview.answers[existingIndex] = answerData;
    } else {
      interview.answers.push(answerData);
    }

    const totalQuestions = candidate.questions.length;
    if (interview.answers.length >= totalQuestions) {
      const avg =
        interview.answers.reduce((sum, a) => sum + a.score, 0) / interview.answers.length;
      interview.overallScore = Math.round(avg * 10) / 10;
      interview.status = 'completed';
    }

    await interview.save();
    fs.unlinkSync(audioFile.path);

    res.json({
      transcript,
      score: feedback.score,
      verdict: feedback.verdict,
      tip: feedback.tip,
      interviewId: interview._id,
      status: interview.status,
    });
  } catch (err) {
    console.error('submitAnswer error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/interview/:candidateId
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ candidate: req.params.candidateId });
    if (!interview) return res.status(404).json({ error: 'No interview found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitAnswer, getInterview };