const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // one candidate profile per user
  },
  name: { type: String, required: true },
  email: { type: String },
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
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);