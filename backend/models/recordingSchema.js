const mongoose = require("mongoose")

const recordingSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
  },
  videoUrl: String,
  audioUrl: String,
  transcript: String
}, { timestamps: true });

module.exports = mongoose.model("Recording", recordingSchema);
