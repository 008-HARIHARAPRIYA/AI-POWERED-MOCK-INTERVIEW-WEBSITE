// vapiRoutes.js
import express from "express";
import { generateInterviewController } from "../controllers/vapiController.js";

const router = express.Router();

// No JWT, just plain POST
router.post("/generate", generateInterviewController);

export default router;
