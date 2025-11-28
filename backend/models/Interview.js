import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  role: String,
  type: String,
  level: String,
  techstack: [String],
  questions: [String],
  userId: { type: Number, required: true }, 
  finalized: Boolean,
  coverImage: String,
  createdAt: String,
  // ✅ ADD THESE NEW FIELDS
  transcript: [{
    role: String,
    text: String,
    timestamp: String
  }],
  feedback: {
    communicationSkills: {
      score: { type: Number, default: 0 },
      feedback: { type: String, default: "" }
    },
    technicalKnowledge: {
      score: { type: Number, default: 0 },
      feedback: { type: String, default: "" }
    },
    problemSolving: {
      score: { type: Number, default: 0 },
      feedback: { type: String, default: "" }
    },
    culturalFit: {
      score: { type: Number, default: 0 },
      feedback: { type: String, default: "" }
    },
    confidenceAndClarity: {
      score: { type: Number, default: 0 },
      feedback: { type: String, default: "" }
    },
    overallFeedback: { type: String, default: "" },
    analyzedAt: Date
  },
  completedAt: Date
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;