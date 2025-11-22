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
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
