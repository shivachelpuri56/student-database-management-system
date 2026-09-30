import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY?.trim();

export const DEFAULT_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

let geminiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    geminiClient = null;
  }
}

export function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const currentKey = process.env.GEMINI_API_KEY?.trim();
    if (currentKey && currentKey !== 'MY_GEMINI_API_KEY') {
      try {
        geminiClient = new GoogleGenAI({
          apiKey: currentKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err) {
        console.warn('Error creating GoogleGenAI client:', err);
      }
    }
  }
  return geminiClient;
}

export function isGeminiAvailable(): boolean {
  return getGeminiClient() !== null;
}
