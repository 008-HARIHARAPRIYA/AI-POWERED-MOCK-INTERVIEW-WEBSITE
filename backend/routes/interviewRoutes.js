// routes/interviewRoutes.js
import express from "express";
import Interview from "../models/Interview.js";

const router = express.Router();

/**
 * GET /api/interviews/:id
 * Fetch a specific interview with feedback
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📊 Fetching interview:", id);

    // Find the interview
    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    console.log("✅ Interview found:", interview._id);

    res.status(200).json(interview);

  } catch (error) {
    console.error("❌ Error fetching interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview",
      error: error.message
    });
  }
});

/**
 * GET /api/interviews/user/:userId
 * Fetch all interviews for a specific user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("📊 Fetching all interviews for user:", userId);

    const interviews = await Interview.find({ userId: Number(userId) })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${interviews.length} interviews`);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });

  } catch (error) {
    console.error("❌ Error fetching user interviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
      error: error.message
    });
  }
});

export default router;