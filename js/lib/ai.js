import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function getSemanticSearchCategories(query, availableCategories) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a search assistant for a business directory in Namibia.
User query: "${query}"

Available Categories:
${availableCategories.map(c => c.name).join(', ')}

Based on the user's query, return a comma-separated list of the best matching category names from the available categories above. Only return the exact category names, nothing else. If none match well, return nothing.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    if (!text) return [];
    return text.split(',').map(s => s.trim());
  } catch (err) {
    console.error('Google AI Search Error:', err);
    return [];
  }
}
