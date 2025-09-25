// vapiController.js
import { generateInterview } from "../services/vapiService.js";

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
