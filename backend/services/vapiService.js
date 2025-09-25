import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../models/Interview.js";
import getRandomInterviewCover from "../utils/getRandomInterviewCover.js";
import { createRequire } from 'module';

// Use createRequire to import CommonJS config in ES module
const require = createRequire(import.meta.url);
const config = require('../../config.js');

// Initialize Gemini AI with API key from config
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const generateInterview = async ({ type, role, level, techstack, amount }, userId) => {
  console.log('🚀 Starting interview generation...');
  console.log('Parameters:', { type, role, level, techstack, amount, userId });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Prepare ${amount} interview questions for a job.
The job role is ${role}
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
Return ONLY a JSON array like ["Question 1", "Question 2", ...].
Do not ask candidates to write actual code.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any special characters.
`;

  console.log('📝 Prompt prepared:', prompt.trim());

  let questions;
  try {
    console.log('🤖 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    console.log('📥 Raw AI response:', text);
    
    if (!text) {
      throw new Error("No text returned by AI");
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.trim().replace(/```json|```/g, '').trim();
    console.log('🧹 Cleaned response:', cleanedText);

    questions = JSON.parse(cleanedText);
    
    if (!Array.isArray(questions)) {
      throw new Error(`Parsed response is not an array. Got: ${typeof questions}`);
    }

    console.log('✅ Successfully parsed questions:', questions.length, 'questions');
    
  } catch (err) {
    console.error("❌ Gemini call failed:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack
    });
    throw new Error(`AI generation failed: ${err.message}`);
  }

  try {
    console.log('💾 Saving interview to database...');
    
    const interview = new Interview({
      role,
      type,
      level,
      techstack: techstack.split(",").map((s) => s.trim()),
      questions, // Keep the array structure as-is
      userId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    });

    await interview.save();
    
    console.log('✅ Interview saved successfully with ID:', interview._id);
    
    return interview;
    
  } catch (saveError) {
    console.error("❌ Failed to save interview:", saveError);
    throw new Error(`Database save failed: ${saveError.message}`);
  }
};