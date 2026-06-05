
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export async function categorizeVendor(businessName, queryContext) {
    if (!API_KEY) {
        console.warn('⚠️ No GEMINI_API_KEY found. Falling back to heuristic categorization.');
        return fallbackCategorization(businessName, queryContext);
    }

    const prompt = `
    You are an AI categorizer for a Namibian business directory called The Vendor.
    Business Name: "${businessName}"
    Search Query Context: "${queryContext}"
    
    Given this information, determine the best primary category, subcategory, and generate 3 relevant tags.
    Primary Category must be one of: photography, videography, drone-services, graphic-design, web-development, digital-marketing, printing-services, djs, mcs, event-planning, decor, sound-lighting, catering, cake-makers, restaurants, kapana-vendors, food-trucks, hair-stylists, barbers, makeup-artists, nail-technicians, fashion-designers, tailors, mechanics, auto-electricians, car-washes, towing-services, plumbers, electricians, builders, painters, cleaning-services, security-services, it-services, computer-repairs, lawyers, accountants, business-consultants, real-estate-agents, accommodation, guest-houses, lodges, tour-guides, fitness-trainers, gyms, transport-services, courier-services.
    
    Return EXACTLY this JSON structure and nothing else:
    {
        "category": "chosen-category-id",
        "subcategory": "A descriptive subcategory",
        "tags": ["tag1", "tag2", "tag3"],
        "keywords": ["keyword phrase 1", "keyword phrase 2"]
    }
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Gemini API Error, using fallback:', e.message);
        return fallbackCategorization(businessName, queryContext);
    }
}

function fallbackCategorization(name, query) {
    let category = 'business';
    const lower = (name + ' ' + query).toLowerCase();
    
    if (lower.includes('photo') || lower.includes('lens')) category = 'photography';
    else if (lower.includes('mech') || lower.includes('auto')) category = 'mechanics';
    else if (lower.includes('cake') || lower.includes('bake')) category = 'cake-makers';
    else if (lower.includes('hair') || lower.includes('salon')) category = 'hair-stylists';
    else if (lower.includes('cater') || lower.includes('food')) category = 'catering';

    return {
        category,
        subcategory: query.split(' ')[0] || 'General Service',
        tags: [category, 'Namibia', 'Service'],
        keywords: [name.toLowerCase(), category]
    };
}
