import { GoogleGenAI, Type } from "@google/genai";
import { getRealEconomicData } from "./worldbank";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Simple local cache to speed up the app
const cache: { [key: string]: any } = {};

export const getCareerAdvice = async (profile: any, message: string, history: any[], language: string = 'English') => {
  const model = "gemini-2.0-flash";
  const systemInstruction = `
    You are FuturaPath, an advanced AI Career Advisor who speaks like a close, supportive, and enthusiastic friend.
    Your goal is to help users choose future-proof careers based on their profile and future job market predictions (3-10 years).
    
    TONE: 
    - Friendly, warm, and encouraging. 
    - Use conversational language (e.g., "Hey!", "That's awesome!", "I've got your back").
    - Be like a mentor who is also a peer.
    - Avoid being overly formal or robotic.
    
    CRITICAL: You MUST respond ONLY in ${language}. 
    DO NOT use English unless the selected language is English.
    Ensure all advice, scenarios, and technical terms are translated or explained in ${language}.
    
    User Profile:
    - Type: ${profile.userType}
    - Goal: ${profile.purpose}
    - Current/Past University: ${profile.currentUniversity || 'None'}
    - Interests: ${profile.interests.join(", ")}
    - Skills: ${profile.skills.join(", ")}
    - Subjects: ${profile.academicSubjects.join(", ")}
    
    Guidelines:
    1. Be encouraging but realistic.
    2. Focus on long-term demand (AI, automation, green energy, etc.).
    3. Suggest specific university majors or certifications.
    4. For pupils, suggest top global and local universities suitable for the recommended career.
    5. Explain WHY a career is future-proof.
    6. Use storytelling for future scenarios (e.g., "Imagine it's 2030, and you're...").
    7. If asked about a specific profession, provide detailed info: duties, salary trends, future outlook, and entry requirements.
  `;

  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { systemInstruction },
  });

  return response.text;
};

export const generateRecommendations = async (profile: any, language: string = 'English') => {
  const model = "gemini-2.0-flash";

  // Get real economic data for user's country
  let realDataContext = '';
  try {
    const realData = await getRealEconomicData(profile.country || 'Global');
    realDataContext = `
    REAL ECONOMIC DATA for ${profile.country || 'Global'} (World Bank):
    - Unemployment Rate: ${realData.unemploymentRate !== null ? realData.unemploymentRate.toFixed(1) + '%' : 'N/A'}
    - GDP Growth Rate: ${realData.gdpGrowth !== null ? realData.gdpGrowth.toFixed(1) + '%' : 'N/A'}
    - Youth Unemployment: ${realData.youthUnemployment !== null ? realData.youthUnemployment.toFixed(1) + '%' : 'N/A'}
    Use this real data to make recommendations more accurate and grounded in reality.
    `;
  } catch {
    realDataContext = '';
  }

  const prompt = `
    ${realDataContext}
    
    Based on this user profile, generate 3 future-proof career recommendations.
    Write the reasoning and demand trends in a friendly, encouraging, "friend-like" tone.
    
    CRITICAL: All text in the JSON response MUST be in ${language}. 
    This includes careerName, reasoning, roadmap steps, skillGap, futureDemandTrend, and the new proTip.
    DO NOT use English unless the selected language is English.
    
    Profile:
    - Type: ${profile.userType}
    - Goal: ${profile.purpose}
    - Current/Past University: ${profile.currentUniversity || 'None'}
    - Interests: ${profile.interests.join(", ")}
    - Skills: ${profile.skills.join(", ")}
    - Subjects: ${profile.academicSubjects.join(", ")}
    
    Return the result as a JSON array of objects with:
    careerName, matchScore (0-100), riskLevel (low, medium, or high), reasoning, roadmap (array of steps), skillGap (array of skills to learn), futureDemandTrend (description), suggestedUniversities (array of 3-5 top universities for this field), proTip (a highly specific, unique, and actionable piece of advice that is EXCLUSIVELY relevant to this career).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            careerName: { type: Type.STRING },
            matchScore: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
            reasoning: { type: Type.STRING },
            roadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillGap: { type: Type.ARRAY, items: { type: Type.STRING } },
            futureDemandTrend: { type: Type.STRING },
            suggestedUniversities: { type: Type.ARRAY, items: { type: Type.STRING } },
            proTip: { type: Type.STRING },
          },
          required: ["careerName", "matchScore", "riskLevel", "reasoning", "roadmap", "skillGap", "futureDemandTrend", "suggestedUniversities", "proTip"],
        },
      },
    },
  });

  return JSON.parse(response.text);
};

export const getUniversityInfo = async (uniName: string, language: string = 'English') => {
  const cacheKey = `uni_${uniName}_${language}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const model = "gemini-2.0-flash";
  const prompt = `
    Provide detailed information about "${uniName}". 
    Format the response as a JSON object.
    
    CRITICAL: All descriptive text MUST be in ${language}.
    
    JSON keys:
    - name: Full name of the university
    - location: City and Country
    - description: A compelling 2-3 sentence overview
    - rank: Approximate global ranking or national status
    - keyFeatures: An array of 3-4 strengths/specialties
    - searchLink: A search query URL for the official website (e.g., https://www.google.com/search?q=MIT+official+website)
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          description: { type: Type.STRING },
          rank: { type: Type.STRING },
          keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          searchLink: { type: Type.STRING },
        },
        required: ["name", "location", "description", "rank", "keyFeatures", "searchLink"],
      },
    },
  });

  const data = JSON.parse(response.text);
  cache[cacheKey] = data;
  return data;
};

export const getCareerDetails = async (careerName: string, language: string = 'English') => {
  const cacheKey = `career_${careerName}_${language}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const model = "gemini-2.0-flash";
  const prompt = `
    Provide a professional briefing on the career: "${careerName}".
    Format the response as a JSON object.
    
    CRITICAL: All descriptive text MUST be in ${language}.
    
    JSON keys:
    - name: Career Name
    - description: A clear, inspiring 3-4 sentence overview of the role.
    - futureGrowth: Explanation of why this role is growing.
    - skills: 4-5 essential skills (technical or soft).
    - salaryRange: Typical entry to senior level range (state that it varies by country).
    - demandLevel: "Very High", "High", or "Medium".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          futureGrowth: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          salaryRange: { type: Type.STRING },
          demandLevel: { type: Type.STRING },
        },
        required: ["name", "description", "futureGrowth", "skills", "salaryRange", "demandLevel"],
      },
    },
  });

  const data = JSON.parse(response.text);
  cache[cacheKey] = data;
  return data;
};

export const detectLanguage = async (text: string) => {
  const model = "gemini-2.0-flash";
  const prompt = `
    Identify the language of the following text. 
    Return ONLY the name of the language in English (e.g., "English", "Turkish", "Uzbek", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Arabic", "Portuguese", "Italian", "Hindi", "Bengali", "Punjabi", "Marathi", "Telugu", "Tamil", "Urdu", "Vietnamese", "Thai", "Indonesian", "Malay", "Filipino", "Persian", "Hebrew", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Romanian", "Hungarian", "Czech", "Slovak", "Slovenian", "Croatian", "Serbian", "Greek", "Bulgarian", "Ukrainian", "Kazakh", "Kyrgyz", "Tajik", "Turkmen", "Azerbaijani", "Armenian", "Georgian", "Mongolian", "Khmer", "Lao", "Burmese", "Swahili", "Amharic", "Yoruba", "Igbo", "Zulu", "Afrikaans", "Catalan", "Basque", "Galician", "Estonian", "Latvian", "Lithuanian", "Icelandic", "Irish", "Welsh").
    If you are unsure, return "Unknown".
    
    Text: "${text}"
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text.trim();
};

export const analyzeTrends = async (trendsData: any, language: string = 'English', country: string = 'Global') => {
  const model = "gemini-2.0-flash";

  // Get real economic data for better analysis
  let realDataContext = '';
  try {
    const realData = await getRealEconomicData(country);
    realDataContext = `
    REAL ECONOMIC DATA for ${country} (World Bank):
    - Unemployment Rate: ${realData.unemploymentRate !== null ? realData.unemploymentRate.toFixed(1) + '%' : 'N/A'}
    - GDP Growth Rate: ${realData.gdpGrowth !== null ? realData.gdpGrowth.toFixed(1) + '%' : 'N/A'}
    - Youth Unemployment: ${realData.youthUnemployment !== null ? realData.youthUnemployment.toFixed(1) + '%' : 'N/A'}
    `;
  } catch {
    realDataContext = '';
  }

  const prompt = `
    ${realDataContext}
    
    Analyze the following career market trends data (2026-2036) for ${country} and provide a concise, insightful summary.
    Speak like a knowledgeable friend who is excited about the future.
    Reference the real economic data above to make your analysis more grounded and credible.
    
    CRITICAL: Your entire analysis MUST be in ${language}.
    DO NOT use English unless the selected language is English.
    
    Trends Data: ${JSON.stringify(trendsData)}
    
    Include:
    1. The fastest growing career in ${country} and why (reference real data).
    2. The most stable career in ${country}.
    3. A key takeaway based on the real unemployment and GDP data.
    4. How ${country}'s specific economic landscape influences these trends.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
};

export const getMarketPredictions = async (country: string = 'Global', language: string = 'English') => {
  const cacheKey = `market_${country}_${language}`;
  if (cache[cacheKey]) return cache[cacheKey];

  // Get real economic data first
  let realDataContext = '';
  try {
    const realData = await getRealEconomicData(country);
    realDataContext = `
    REAL ECONOMIC DATA for ${country} (World Bank):
    - Current Unemployment Rate: ${realData.unemploymentRate !== null ? realData.unemploymentRate.toFixed(1) + '%' : 'N/A'}
    - Current GDP Growth Rate: ${realData.gdpGrowth !== null ? realData.gdpGrowth.toFixed(1) + '%' : 'N/A'}
    - Youth Unemployment Rate: ${realData.youthUnemployment !== null ? realData.youthUnemployment.toFixed(1) + '%' : 'N/A'}
    
    Use this REAL data as the foundation for your predictions.
    For example, if youth unemployment is high, predict stronger growth in entrepreneurship and digital careers.
    If GDP growth is strong, predict more demand in finance and tech.
    `;
  } catch {
    realDataContext = '';
  }

  const model = "gemini-2.0-flash";
  const prompt = `
    ${realDataContext}
    
    Based on the real economic data above, generate a list of 5 emerging career fields 
    for the next 10 years (2026-2036) specifically for ${country}.
    
    Your predictions must be GROUNDED in the real economic situation.
    If ${country} is 'Global', provide general global trends.
    For each career, provide a demand score (0-100) for each year from 2026 to 2036.
    The scores should show realistic growth curves based on real economic indicators.
    
    CRITICAL: The "name" and "category" MUST be in ${language}.
    
    Return as JSON:
    {
      "careers": [
        {
          "name": "Career Name in ${language}",
          "data": [
            {"year": 2026, "score": 40},
            {"year": 2027, "score": 48},
            {"year": 2028, "score": 55},
            {"year": 2029, "score": 61},
            {"year": 2030, "score": 68},
            {"year": 2031, "score": 72},
            {"year": 2032, "score": 76},
            {"year": 2033, "score": 80},
            {"year": 2034, "score": 84},
            {"year": 2035, "score": 88},
            {"year": 2036, "score": 92}
          ],
          "risk": "low/medium/high",
          "category": "Category in ${language}"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const result = JSON.parse(response.text);
  cache[cacheKey] = result;
  return result;
};
export const analyzeSkillGap = async (careerName: string, currentSkills: string[], language: string = 'English') => {
  const model = "gemini-2.0-flash";
  const prompt = `
    A user wants to become a "${careerName}". Their current skills are: ${currentSkills.join(", ") || "none listed"}.
    
    Analyze the gap between their current skills and what's needed for this career.
    
    CRITICAL: All text MUST be in ${language}.
    
    Return as JSON:
    {
      "matchPercent": number (0-100, how much of the required skill set they already have),
      "missingSkills": [
        {
          "skill": "skill name",
          "priority": "high" | "medium" | "low",
          "reason": "short explanation of why this skill matters for the role",
          "courseLink": "a real free Coursera or YouTube URL to learn this skill"
        }
      ]
    }
    
    Order missingSkills by priority (high first). Include 4-6 skills.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchPercent: { type: Type.NUMBER },
          missingSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
                reason: { type: Type.STRING },
                courseLink: { type: Type.STRING },
              },
              required: ["skill", "priority", "reason", "courseLink"],
            },
          },
        },
        required: ["matchPercent", "missingSkills"],
      },
    },
  });

  return JSON.parse(response.text);
};