const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

(async () => {
  try {
    const response = await genAI.responses.create({
      model: "gemini-1.5",
      input: "Say hello"
    });

    const textOutput = response.output?.[0]?.content?.[0]?.text || "No text returned";
    console.log("API Key is VALID. Response:", textOutput);
  } catch (err) {
    console.error("API Key is INVALID:", err);
  }
})();
