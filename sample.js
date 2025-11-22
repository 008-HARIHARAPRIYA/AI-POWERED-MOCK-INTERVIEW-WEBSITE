const config = require('./config');
console.log(config.GEMINI_API_KEY);

async function generateText() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "what is the difference between crisp logic and fuzzy logic?" }]
          }]
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      const errorData = await response.json();
      console.error('Error:', response.status, errorData);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateText();