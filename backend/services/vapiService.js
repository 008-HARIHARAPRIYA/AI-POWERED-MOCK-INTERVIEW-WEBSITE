import fetch from "node-fetch";
import Interview from "../models/Interview.js";
import getRandomInterviewCover from "../utils/getRandomInterviewCover.js";

import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;
export const generateInterview = async ({ type, role, level, techstack, amount }, userId) => {
  console.log('🚀 Starting interview generation...');
  console.log('Parameters:', { type, role, level, techstack, amount, userId });

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
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }]
        })
      }
    );

    const data = await response.json();
    
    console.log('📥 Raw AI response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    
    if (!text) {
      throw new Error("No text returned by AI");
    }

    console.log('📄 Text from AI:', text);

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