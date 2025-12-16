import Groq from "groq-sdk";

export async function getChatResponse(messages) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast & stable
      messages,
      temperature: 0.3,
      max_tokens: 120,
    });

    const text = completion?.choices?.[0]?.message?.content;
    return text && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
