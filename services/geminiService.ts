
import { GoogleGenAI, GenerateContentRequest } from "@google/genai";

// Ensure API_KEY is available in the environment
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResponse = async (params: GenerateContentRequest) => {
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
