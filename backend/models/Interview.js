const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  questionIndex: Number,        // which question (0, 1, 2...)
  questionText: String,         // copy of the question text
  transcript: String,           // whisper transcription of spoken answer
  score: Number,                // GPT score 1-10
  verdict: {
    type: String,
    enum: ['good', 'average', 'weak']
  },
  tip: String                   // one line GPT feedback
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
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  }
}, { timestamps: true })

module.exports = mongoose.model('Interview', interviewSchema)