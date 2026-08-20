import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    console.log("Testing Gemini API...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Hello",
    });
    console.log("Success:", response.text);
  } catch (error: any) {
    console.error("Test failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    console.error("Full stack:", error.stack);
  }
}

test();
