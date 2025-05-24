import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function summarizeText(text) {
  try {
    const result = await model.generateContent(`Summarize the following text:\n\n${text}`);
    const response = await result.response;
    const summary = response.text();
    return summary;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return "AI summary unavailable.";
  }
}
