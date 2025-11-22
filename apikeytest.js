const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("");

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    models.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  Display name: ${model.displayName}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();