import { GoogleGenAI } from "@google/genai";

let client = null;
const getClient = () => {
  if (client) return client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  client = new GoogleGenAI({ apiKey: key });
  return client;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const isAIEnabled = () => !!process.env.GEMINI_API_KEY;

export const parseJSON = (text) => {
  let cleaned = (text || "").trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```\n?/g, "");
  }
  return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({ system, user, temperature = 0.7 }) => {
  const c = getClient();
  if (!c) {
    return {
      ok: false,
      content:
        "AI features are disabled — set GEMINI_API_KEY in the backend .env to enable real AI responses.",
    };
  }
  try {
    const res = await c.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstruction: system,
        temperature,
      },
    });
    return { ok: true, content: (res.text || "").trim() };
  } catch (err) {
    console.error("AI error:", err.message);
    return { ok: false, content: "AI request failed. Please try again later." };
  }
};

export const SYSTEM_PROMPTS = {
  weekly:
    "You are a warm, encouraging habit coach. Analyse the user's last 7 days of habit data and write a short weekly review (under 150 words). Start by celebrating their biggest win, naming the habit and the actual numbers. Then point out the one habit that needs the most attention, without guilt or blame. End with one specific, actionable tip for the coming week. Use only the data provided and never invent habits or numbers. Plain text, no headings.",
  suggestion:
    "You are a helpful habit coach. Based on the user's goals, productive time, and past struggles, suggest 3 new habits that fit their routine. Keep each one small enough to start in under 15 minutes a day, and do not repeat habits they already have. Respond ONLY with a JSON object and no other text or markdown, in this exact shape: {\"suggestions\": [{\"name\": short habit name, \"description\": one sentence describing the habit, \"frequency\": \"daily\" or \"weekly\", \"category\": one of \"Health\", \"Fitness\", \"Learning\", \"Mindfulness\", \"Productivity\", \"Social\", \"Finance\", \"Creative\", \"Other\", \"icon\": a single emoji, \"reason\": one sentence on why it suits this user}]}.",
  recovery:
    "You are a compassionate habit recovery coach. The user broke a streak. Write a 3-day recovery plan tailored to the habit and, if given, the reason it broke. Open with one sentence reminding them that missing a day is normal and what matters is getting back quickly. Then give Day 1, Day 2 and Day 3, each with one concrete step: start easier than their usual routine and build back up to it by Day 3. Keep it under 150 words, supportive and free of shame.",
  chat:
    "You are a helpful habit analysis assistant. Answer the user's question using ONLY the provided habit data. Refer to specific habit names, dates and numbers from that data. If the data does not contain the answer, say so plainly instead of guessing, and never invent habits, dates or statistics. Keep answers under 120 words unless the user asks for more detail.",
  morning:
    "You are a warm, motivating friend. Write a single short morning message (30-60 words) using the user's name and their current habits. If they have an active streak, acknowledge it; then name one specific habit to focus on today. Sound genuine and personal, not like a generic quote or poster. Plain text, at most one emoji.",
};
