import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function getChatResponse(messages) {
  if (!groq) return null;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3,
      max_tokens: 120,
    });

    return completion?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("🔥 Groq SDK error:", err.message);
    return null;
  }
}
