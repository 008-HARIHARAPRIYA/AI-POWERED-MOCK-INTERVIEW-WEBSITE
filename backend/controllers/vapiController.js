// vapiController.js - COMPLETE VERSION
import { generateInterview, processTranscript } from "../services/vapiService.js";

/**
 * Generate Interview Controller
 */
export const generateInterviewController = async (req, res) => {
  try {
    // Expect userId in request body instead of JWT
    const { userId } = req.body;
    const interview = await generateInterview(req.body, userId);
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Process Transcript Controller
 */
export const processTranscriptController = async (req, res) => {
  try {
    const { userId, transcript } = req.body;

    console.log('📥 Received transcript processing request');
    console.log('👤 UserId:', userId);
    console.log('📊 Transcript entries:', transcript?.length || 0);

    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'userId is required' 
      });
    }

    if (!transcript || !Array.isArray(transcript)) {
      return res.status(400).json({ 
        success: false,
        error: 'transcript must be an array' 
      });
    }

    // Call the service function
    const result = await processTranscript(userId, transcript);

    // Return the result
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in processTranscriptController:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};