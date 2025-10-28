// FIX: Use `GenerateContentParameters` instead of deprecated `GenerateContentRequest`.
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";

// Ensure API_KEY is available in the environment
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Use `GenerateContentParameters` instead of deprecated `GenerateContentRequest`.
export const generateResponse = async (params: GenerateContentParameters) => {
  try {
    const response = await ai.models.generateContent({
      ...params,
      model: "gemini-2.5-flash",
    });
    return response;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
