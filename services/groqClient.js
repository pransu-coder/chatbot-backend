import Groq from "groq-sdk";

export async function getChatResponse(messages) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ FAST + STABLE
      messages,
      temperature: 0.3,
      max_tokens: 120,
    });

    const text = completion?.choices?.[0]?.message?.content;
    return text && text.trim() ? text.trim() : null;

  } catch (e) {
    return null;
  }
}
