const questionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
  },
  questionText: {
    type: String,
    required: true,
  },
  expectedAnswer: {
    type: String, // optional (for AI comparison)
  },
  difficulty: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);