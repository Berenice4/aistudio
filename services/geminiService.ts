// FIX: Use `GenerateContentParameters` instead of deprecated `GenerateContentRequest`.
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";

let ai: GoogleGenAI | null = null;

/**
 * Initializes and returns the GoogleGenAI client instance.
 * Throws an error if the API_KEY is not set.
 */
const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please ensure it is configured in your deployment environment.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};


// FIX: Use `GenerateContentParameters` instead of deprecated `GenerateContentRequest`.
export const generateResponse = async (params: GenerateContentParameters) => {
  try {
    const client = getAiClient(); // Lazily initialize and get the client
    const response = await client.models.generateContent({
      ...params,
      model: "gemini-2.5-flash",
    });
    return response;
  } catch (error) {
    console.error("Error generating content:", error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
};
