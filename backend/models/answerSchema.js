const mongoose = require("mongoose")

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  answerText: {
    type: String,
  },
  score: {
    type: Number, // AI evaluation score
  },
  feedback: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);