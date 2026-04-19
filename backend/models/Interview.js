const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  questionText: String,
  transcript: String,
  score: Number,
  skipped: { type: Boolean, default: false },
  verdict: { type: String, enum: ['good', 'average', 'weak'] },
  tip: String,
});

const flagSchema = new mongoose.Schema({
  type: { type: String, enum: ['tab_switch', 'window_blur', 'fullscreen_exit'] },
  timestamp: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  text: String,
  type: String,
  difficulty: String,
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  jobRole: { type: String, required: true },
  questions: [questionSchema],
  answers: [answerSchema],
  overallScore: Number,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'voided'],
    default: 'pending'
  },
  flags: [flagSchema],
  flagCount: { type: Number, default: 0 },
  voided: { type: Boolean, default: false },
  voidReason: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);