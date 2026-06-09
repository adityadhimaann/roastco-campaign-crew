import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat();
    const result = await chat.sendMessage("hello");
    console.log(result.response.text());
  } catch(e) {
    console.error(e.message);
  }
}

run();
