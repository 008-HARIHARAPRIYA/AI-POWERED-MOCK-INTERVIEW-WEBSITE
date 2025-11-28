// vapiService.js - COMPLETE VERSION WITH FEEDBACK STORAGE
import fetch from "node-fetch";
import Interview from "../models/Interview.js";
import getRandomInterviewCover from "../utils/getRandomInterviewCover.js";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;

/**
 * Generate Interview Questions and Save to DB (Only Basic Details)
 * @param {Object} body - Request body containing interview parameters
 * @param {Number} userId - User ID
 * @returns {Object} Interview object
 */
export const generateInterview = async (body, userId) => {
  try {
    const { type, role, level, techstack, amount } = body;
    
    console.log('🚀 GENERATING INTERVIEW');
    console.log('Parameters:', { type, role, level, techstack, amount, userId });

    // ✅ Validate userId is a number
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid userId - must be a number');
    }

    // Validate other fields
    if (!role || !type || !level || !techstack || !amount) {
      throw new Error('Missing required fields');
    }

    // Generate questions with Gemini
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

    let questions;
    try {
      console.log('🤖 Calling Gemini...');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error("No text from AI");

      const cleanedText = text.trim().replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleanedText);
      
      if (!Array.isArray(questions)) throw new Error('Not an array');

      console.log('✅ Generated', questions.length, 'questions');
      
    } catch (err) {
      console.error("❌ Gemini failed:", err.message);
      throw new Error(`AI generation failed: ${err.message}`);
    }

    // ✅ SAVE ONLY BASIC DETAILS TO DATABASE
    try {
      console.log('💾 SAVING BASIC DETAILS TO DATABASE...');

      const interview = new Interview({
        role,
        type,
        level,
        techstack: techstack.split(",").map((s) => s.trim()),
        questions,
        userId: Number(userId),
        finalized: true,
        coverImage: getRandomInterviewCover()
      });

      await interview.save();
      
      console.log('✅✅✅ BASIC DETAILS SAVED TO DATABASE');
      console.log('📄 Interview _id:', interview._id);
      console.log('👤 UserId saved:', interview.userId);
      console.log('📊 Questions saved:', interview.questions.length);
      
      // Return only basic response
      const response = {
        _id: interview._id.toString(),
        role: interview.role,
        type: interview.type,
        level: interview.level,
        techstack: interview.techstack,
        questions: interview.questions,
        userId: interview.userId,
        finalized: interview.finalized,
        coverImage: interview.coverImage
      };
      
      console.log('📤 RETURNING RESPONSE with _id:', response._id);
      
      return response;
      
    } catch (saveError) {
      console.error("❌❌❌ DATABASE SAVE FAILED:", saveError);
      console.error("Error details:", saveError.message);
      console.error("Stack:", saveError.stack);
      throw new Error(`Database save failed: ${saveError.message}`);
    }
    
  } catch (error) {
    console.error("❌ UNEXPECTED ERROR:", error);
    throw error;
  }
};

/**
 * Process Transcript - Analyze with Gemini and Store in DB
 * @param {Number} userId - User ID
 * @param {Array} transcript - Array of transcript messages
 * @returns {Object} Result object with success status and feedback
 */
export const processTranscript = async (userId, transcript) => {
  console.log("\n\n═══════════════════════════════════════════════════════════");
  console.log("📜 INTERVIEW TRANSCRIPT RECEIVED");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("👤 User ID:", userId);

  // ✅ PRINT TRANSCRIPT TO CONSOLE
  transcript.forEach((msg, index) => {
    const speaker = msg.role === "user" ? "👤 USER" : "🤖 ASSISTANT";
    console.log(`[${index + 1}] ${speaker}: ${msg.text}`);
  });

  console.log("\n📡 Sending transcript to Gemini for evaluation...");

  const transcriptText = transcript.map(t => `${t.role}: ${t.text}`).join("\n");

  // 🔥 CALL THE GEMINI FEEDBACK ANALYZER
  const feedbackRaw = await analyzeTranscript(transcriptText);

  console.log("\n🎉 FEEDBACK GENERATED BY GEMINI:");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(feedbackRaw);
  console.log("═══════════════════════════════════════════════════════════\n");

  // 🔥 Parse the feedback into structured format
  const feedbackStructured = parseFeedback(feedbackRaw);

  console.log("\n📊 STRUCTURED FEEDBACK:");
  console.log(JSON.stringify(feedbackStructured, null, 2));

  // ✅ SAVE FEEDBACK TO DATABASE
  try {
    console.log("\n💾 SAVING FEEDBACK TO DATABASE...");
    
    // Find the most recent interview for this user
    const interview = await Interview.findOne({ userId: Number(userId) })
      .sort({ _id: -1 }); // Get the latest interview
    
    if (!interview) {
      throw new Error(`No interview found for userId: ${userId}`);
    }

    console.log("📄 Found interview:", interview._id);

    // Update the interview with transcript and feedback
    interview.transcript = transcript;
    interview.feedback = {
      ...feedbackStructured,
      analyzedAt: new Date()
    };
    interview.completedAt = new Date();

    await interview.save();

    console.log("✅✅✅ FEEDBACK SAVED TO DATABASE");
    console.log("📄 Interview ID:", interview._id);
    console.log("👤 UserId:", interview.userId);
    console.log("📊 Feedback Categories Saved:", Object.keys(feedbackStructured).length);

    return {
      success: true,
      message: "Transcript analyzed and saved successfully",
      feedback: feedbackStructured,
      interviewId: interview._id.toString(),
      transcriptLength: transcript.length
    };

  } catch (dbError) {
    console.error("❌ DATABASE SAVE FAILED:", dbError);
    console.error("Error details:", dbError.message);
    
    // Even if DB save fails, return the feedback
    return {
      success: false,
      message: `Analysis completed but DB save failed: ${dbError.message}`,
      feedback: feedbackStructured,
      transcriptLength: transcript.length
    };
  }
};

/**
 * Analyze Transcript with Gemini
 * @param {String} transcript - Full transcript text
 * @returns {String} Feedback from Gemini
 */
export const analyzeTranscript = async (transcript) => {
  const evaluationPrompt = `
You are a professional interviewer analyzing a mock interview.

I'll give you the transcript and you assess the candidate.

Please score the candidate from 0 to 100 in the following areas. 
Do NOT change category names. Do NOT add new categories.

Format your response EXACTLY like this:

**Communication Skills: [SCORE]/100**
[Detailed feedback]

**Technical Knowledge: [SCORE]/100**
[Detailed feedback]

**Problem-solving: [SCORE]/100**
[Detailed feedback]

**Cultural & Role Fit: [SCORE]/100**
[Detailed feedback]

**Confidence and Clarity: [SCORE]/100**
[Detailed feedback]

**Overall Feedback:**
[Summary]

Be STRICT — do not be lenient. Mention mistakes and improvements. Provide feedback in an understandable and attractive manner.

Transcript:
${transcript}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: evaluationPrompt }] }]
        })
      }
    );

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output) throw new Error("No feedback returned from Gemini");

    return output.trim();

  } catch (err) {
    console.error("❌ FEEDBACK MODEL FAILED:", err);
    return `Feedback generation failed: ${err.message}`;
  }
};

/**
 * Parse Gemini feedback into structured format
 * @param {String} rawFeedback - Raw feedback text from Gemini
 * @returns {Object} Structured feedback object
 */
const parseFeedback = (rawFeedback) => {
  const feedback = {
    communicationSkills: { score: 0, feedback: "" },
    technicalKnowledge: { score: 0, feedback: "" },
    problemSolving: { score: 0, feedback: "" },
    culturalFit: { score: 0, feedback: "" },
    confidenceAndClarity: { score: 0, feedback: "" },
    overallFeedback: ""
  };

  try {
    // Extract Communication Skills
    const commMatch = rawFeedback.match(/Communication [Ss]kills?:.*?(\d+)\/100.*?\n([\s\S]*?)(?=\*\*|$)/);
    if (commMatch) {
      feedback.communicationSkills.score = parseInt(commMatch[1]);
      feedback.communicationSkills.feedback = commMatch[2].trim();
    }

    // Extract Technical Knowledge
    const techMatch = rawFeedback.match(/Technical [Kk]nowledge:.*?(\d+)\/100.*?\n([\s\S]*?)(?=\*\*|$)/);
    if (techMatch) {
      feedback.technicalKnowledge.score = parseInt(techMatch[1]);
      feedback.technicalKnowledge.feedback = techMatch[2].trim();
    }

    // Extract Problem-solving
    const probMatch = rawFeedback.match(/Problem-solving:.*?(\d+)\/100.*?\n([\s\S]*?)(?=\*\*|$)/);
    if (probMatch) {
      feedback.problemSolving.score = parseInt(probMatch[1]);
      feedback.problemSolving.feedback = probMatch[2].trim();
    }

    // Extract Cultural & Role Fit
    const cultMatch = rawFeedback.match(/Cultural & Role Fit:.*?(\d+)\/100.*?\n([\s\S]*?)(?=\*\*|$)/);
    if (cultMatch) {
      feedback.culturalFit.score = parseInt(cultMatch[1]);
      feedback.culturalFit.feedback = cultMatch[2].trim();
    }

    // Extract Confidence and Clarity
    const confMatch = rawFeedback.match(/Confidence and [Cc]larity:.*?(\d+)\/100.*?\n([\s\S]*?)(?=\*\*|$)/);
    if (confMatch) {
      feedback.confidenceAndClarity.score = parseInt(confMatch[1]);
      feedback.confidenceAndClarity.feedback = confMatch[2].trim();
    }

    // Extract Overall Feedback
    const overallMatch = rawFeedback.match(/Overall.*?:.*?\n([\s\S]*?)$/i);
    if (overallMatch) {
      feedback.overallFeedback = overallMatch[1].trim();
    }

  } catch (parseError) {
    console.error("⚠️ Failed to parse feedback, storing raw:", parseError);
    feedback.overallFeedback = rawFeedback;
  }

  return feedback;
};