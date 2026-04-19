const fs = require('fs');
const Groq = require('groq-sdk');
const Interview = require('../models/Interview.js');
const Candidate = require('../models/Candidate.js');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.body;
    const audioFile = req.file;

    if (!audioFile || !interviewId || questionIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const question = interview.questions[questionIndex];
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
      skipped: false,
    };

    if (existingIndex > -1) {
      interview.answers[existingIndex] = answerData;
    } else {
      interview.answers.push(answerData);
    }

    interview.status = 'in-progress';

    const totalQuestions = interview.questions.length;
    if (interview.answers.length >= totalQuestions) {
      const answered = interview.answers.filter(a => !a.skipped);
      const avg = answered.length > 0
        ? answered.reduce((sum, a) => sum + a.score, 0) / answered.length
        : 0;
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

const skipQuestion = async (req, res) => {
  try {
    const { interviewId, questionIndex, questionText } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const existingIndex = interview.answers.findIndex(
      (a) => a.questionIndex === parseInt(questionIndex)
    );

    const skipData = {
      questionIndex: parseInt(questionIndex),
      questionText,
      skipped: true,
      transcript: '',
      score: 0,
      verdict: 'weak',
      tip: 'Question was skipped.',
    };

    if (existingIndex > -1) {
      interview.answers[existingIndex] = skipData;
    } else {
      interview.answers.push(skipData);
    }

    interview.status = 'in-progress';

    const totalQuestions = interview.questions.length;
    if (interview.answers.length >= totalQuestions) {
      const answered = interview.answers.filter(a => !a.skipped);
      const avg = answered.length > 0
        ? answered.reduce((sum, a) => sum + a.score, 0) / answered.length
        : 0;
      interview.overallScore = Math.round(avg * 10) / 10;
      interview.status = 'completed';
    }

    await interview.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) return res.status(404).json({ error: 'No interview found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const flagInterview = async (req, res) => {
  try {
    const { interviewId, type } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    interview.flags.push({ type, timestamp: new Date() });
    interview.flagCount = (interview.flagCount || 0) + 1;
    await interview.save();

    res.json({ flagCount: interview.flagCount, voided: interview.voided });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const voidInterview = async (req, res) => {
  try {
    const { interviewId, reason } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    interview.voided = true;
    interview.status = 'voided';
    interview.voidReason = reason;
    await interview.save();

    res.json({ success: true, reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitAnswer, getInterview, flagInterview, voidInterview, skipQuestion };