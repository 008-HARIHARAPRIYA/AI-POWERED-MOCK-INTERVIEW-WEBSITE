

const config = require('./config');

async function generateText() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "what's the difference between agentic AI and automation explain to 2year old?" }]
          }]
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateText();