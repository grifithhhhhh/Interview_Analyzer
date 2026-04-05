const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobRole: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    }
  ],
  score: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);