import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
// If no API key, we will simulate the LLM to avoid crashing if the user hasn't set one yet
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function enrichVendor(rawVendor, targetCategory) {
  try {
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
      const prompt = `
        You are an AI tagging system for "The Vendor", a Namibian business directory.
        Take the following raw scraped data for a business and return a structured JSON object matching our schema.
        
        Raw Data:
        ${JSON.stringify(rawVendor, null, 2)}
        
        Target Category hint: ${targetCategory}
        
        Rules:
        - Output JSON matching exactly this format: { "id": "kebab-case-name", "name": "Clean Name", "description": "Professional 2-3 sentence description written for a premium app.", "category": "one word category ID (e.g. photography, food, beauty)", "categoryName": "Display name of category", "phone": "Clean phone number", "address": "Clean address", "lat": -22.5, "lng": 17.0 }
        - If lat/lng are unknown, use approx Windhoek coordinates: -22.5594, 17.0626 with slight random variation.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const enriched = JSON.parse(text);
      enriched.status = 'draft';
      enriched.rating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
      enriched.reviewCount = Math.floor(Math.random() * 50);
      return enriched;
      
    } else {
      // Fallback simulation if no API key is set
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        id: rawVendor.name.toLowerCase().replace(/\s+/g, '-'),
        name: rawVendor.name,
        description: `A premium ${targetCategory} service provider. ${rawVendor.rawDescription}`,
        category: targetCategory.toLowerCase().split(' ')[0],
        categoryName: targetCategory,
        phone: rawVendor.rawPhone,
        address: rawVendor.rawAddress,
        lat: -22.56 + (Math.random() * 0.05 - 0.025),
        lng: 17.06 + (Math.random() * 0.05 - 0.025),
        status: 'draft',
        rating: 4.5,
        reviewCount: 12
      };
    }
  } catch (error) {
    console.error("LLM Enrichment failed:", error);
    return null;
  }
}
