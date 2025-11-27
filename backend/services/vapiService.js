// vapiService.js (FINAL WORKING VERSION)
// ---------------------------------------------------------

import fetch from "node-fetch";
import Interview from "../models/Interview.js";
import getRandomInterviewCover from "../utils/getRandomInterviewCover.js";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_KEY;

/* ============================================================
   1) GENERATE INTERVIEW QUESTIONS
   ============================================================ */
export const generateInterview = async ({ type, role, level, techstack, amount }, userId) => {
  console.log("\n\n=====================================================");
  console.log("🎯 GENERATING INTERVIEW FOR USER:", userId);
  console.log("=====================================================\n");

  if (!userId || isNaN(userId)) {
    throw new Error("Invalid userId given to generateInterview()");
  }

  const prompt = `
Prepare ${amount} interview questions for a job.
The job role is ${role}
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
Return ONLY a JSON array like ["Question 1", "Question 2"].
Do NOT add explanation.
Do NOT use / or * or Markdown formatting.
`;

  console.log("📝 Prompt:");
  console.log(prompt);

  let questions = [];

  try {
    console.log("🤖 Calling Gemini...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) throw new Error("Gemini returned empty result");

    const cleaned = raw.replace(/```json|```/g, "").trim();
    questions = JSON.parse(cleaned);

    if (!Array.isArray(questions)) {
      throw new Error("Gemini did not return an array");
    }

  } catch (err) {
    console.error("❌ Gemini failed:", err.message);
    throw new Error("AI question generation failed");
  }

  console.log("✅ Questions generated:", questions.length);

  // SAVE
  const interview = new Interview({
    role,
    type,
    level,
    techstack: techstack.split(",").map((s) => s.trim()),
    questions,
    amount: Number(amount),
    userId: Number(userId),
    finalized: true,
    coverImage: getRandomInterviewCover(),
    status: "pending",
    completedAt: null,
  });

  await interview.save();

  console.log("💾 Interview saved with _id:", interview._id.toString());

  return interview;
};

/* ============================================================
   2) PROCESS TRANSCRIPT
   ============================================================ */
export const processTranscript = async (userId, transcript) => {
  console.log("\n\n=====================================================");
  console.log("📜 PROCESSING TRANSCRIPT FOR USER:", userId);
  console.log("=====================================================");

  // PRINT LIKE YOUR REFERENCE
  transcript.forEach((msg, i) => {
    const who = msg.role === "user" ? "👤 USER" : "🤖 AI";
    console.log(`[${i + 1}] ${who}: ${msg.text}`);
  });

  // GET LAST interview of this user
  const interview = await Interview.findOne({ userId }).sort({ createdAt: -1 });

  if (!interview) {
    console.error("❌ No interview found for user:", userId);
    return { success: false, message: "Interview not found" };
  }

  console.log("📡 Sending transcript to Gemini for evaluation...");

  const transcriptText = transcript.map(t => `${t.role}: ${t.text}`).join("\n");

  const feedbackRaw = await analyzeTranscript(transcriptText);

  console.log("\n🎉 RAW FEEDBACK FROM GEMINI:");
  console.log(feedbackRaw);

  const feedbackStructured = parseFeedback(feedbackRaw);

  // SAVE
  interview.transcript = transcript;
  interview.feedback = feedbackStructured;
  interview.status = "completed";
  interview.completedAt = new Date();

  await interview.save();

  console.log("✅ Transcript + Feedback saved successfully");

  return {
    success: true,
    message: "Transcript processed",
    answersCount: transcript.length,
    feedback: feedbackStructured,
  };
};

/* ============================================================
   3) ANALYZE TRANSCRIPT
   ============================================================ */
export const analyzeTranscript = async (transcript) => {
  const evaluationPrompt = `
You are an expert interviewer. Evaluate the candidate.
Do NOT add extra headings. Use EXACT format:

**Communication Skills: [SCORE]/100**
[Feedback]

**Technical Knowledge: [SCORE]/100**
[Feedback]

**Problem-solving: [SCORE]/100**
[Feedback]

**Cultural & Role Fit: [SCORE]/100**
[Feedback]

**Confidence and Clarity: [SCORE]/100**
[Feedback]

**Overall Feedback:**
[Summary]

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
          contents: [{ parts: [{ text: evaluationPrompt }] }],
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty feedback from Gemini");

    return text.trim();
  } catch (err) {
    console.error("❌ Gemini Feedback Error:", err.message);
    return `Feedback failed: ${err.message}`;
  }
};

/* ============================================================
   4) PARSE FEEDBACK
   ============================================================ */
const parseFeedback = (raw) => {
  const get = (label) => {
    const r = new RegExp(`${label}:.*?(\\d+)/100[\\s\\S]*?(?=\\*\\*|$)`);
    const m = raw.match(r);
    return m ? parseInt(m[1]) : 0;
  };

  const getText = (label) => {
    const r = new RegExp(`${label}:.*?\\d+/100\\s*([\\s\\S]*?)(?=\\*\\*|$)`);
    const m = raw.match(r);
    return m ? m[1].trim() : "";
  };

  return {
    communicationSkills: {
      score: get("Communication Skills"),
      feedback: getText("Communication Skills"),
    },
    technicalKnowledge: {
      score: get("Technical Knowledge"),
      feedback: getText("Technical Knowledge"),
    },
    problemSolving: {
      score: get("Problem-solving"),
      feedback: getText("Problem-solving"),
    },
    culturalFit: {
      score: get("Cultural & Role Fit"),
      feedback: getText("Cultural & Role Fit"),
    },
    confidenceAndClarity: {
      score: get("Confidence and Clarity"),
      feedback: getText("Confidence and Clarity"),
    },
    overallFeedback: (raw.match(/Overall Feedback:\s*([\s\S]*)$/)?.[1] || "").trim(),
  };
};
