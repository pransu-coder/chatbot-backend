import Groq from "groq-sdk";

// 🔒 single client instance (better performance)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getChatResponse(messages) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.4,
      max_tokens: 300,
    });

    const text = completion?.choices?.[0]?.message?.content;

    return text && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
