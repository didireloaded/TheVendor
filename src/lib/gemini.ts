import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function analyzeVendorText(text: string) {
  if (!genAI) return null;
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(`Analyze this business description for tags and health score: ${text}`);
  return result.response.text();
}
