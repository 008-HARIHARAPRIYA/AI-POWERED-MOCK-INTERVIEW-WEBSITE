// vapiRoutes.js - COMPLETE VERSION
import express from "express";
import { 
  generateInterviewController, 
  processTranscriptController 
} from "../controllers/vapiController.js";

const router = express.Router();

// Generate interview questions
router.post("/generate", generateInterviewController);

// Process transcript and analyze with Gemini
router.post("/process-transcript", processTranscriptController);

export default router;