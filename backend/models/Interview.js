const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  questionText: String,
  transcript: String,
  score: Number,
  verdict: {
    type: String,
    enum: ['good', 'average', 'weak']
  },
  tip: String
})

const flagSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['tab_switch', 'window_blur', 'fullscreen_exit']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const interviewSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  answers: [answerSchema],
  overallScore: Number,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'voided'],
    default: 'pending'
  },
  flags: [flagSchema],
  flagCount: {
    type: Number,
    default: 0
  },
  voided: {
    type: Boolean,
    default: false
  },
  voidReason: {
    type: String,
    default: null
  }
}, { timestamps: true })

module.exports = mongoose.model('Interview', interviewSchema)