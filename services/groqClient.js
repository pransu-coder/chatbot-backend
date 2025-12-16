import Groq from "groq-sdk";

export async function getChatResponse(messages) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.4,
      max_tokens: 300,
    });

    return completion.choices?.[0]?.message?.content || "";
  } catch {
    return "";
  }
}
