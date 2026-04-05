const mongoose = require("mongoose")

const resultSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
  },
  overallScore: {
    type: Number,
  },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  communicationScore: Number,
  technicalScore: Number,
  confidenceScore: Number
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);