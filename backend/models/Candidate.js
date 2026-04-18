const mongoose = require('mongoose')

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  jobRole: { type: String, required: true },
  resumeText: { type: String },
  resumeAnalysis: {
    overall_score: Number,
    experience_years: Number,
    education: String,
    skills: [String],
    strengths: [String],
    weaknesses: [String],
    summary: String,
    recommended_roles: [String]
  },
  questions: [
    {
      text: { type: String },
      type: { type: String },       // 'technical', 'behavioral', 'situational'
      difficulty: { type: String }  // 'easy', 'medium', 'hard'
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Candidate', candidateSchema)