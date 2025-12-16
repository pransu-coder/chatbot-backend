import express from "express";
import { getChatResponse } from "../services/groqClient.js";

const router = express.Router();
const sessions = new Map();

router.post("/", async (req, res) => {
  const { message, userId, imageUploaded } = req.body || {};

  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  if (imageUploaded) {
    sessions.delete(userId);
    const id = "GD" + Math.floor(1000 + Math.random() * 9000);
    return res.json({
      reply:
        `Thank you for uploading the product image.\n\n` +
        `Your complaint has been registered.\n\n` +
        `Complaint ID: ${id}`
    });
  }

  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 1 });
    return res.json({
      reply: "Hello, welcome to GoldenBangle support."
    });
  }

  if (!message) {
    return res.json({ reply: "Please type your message." });
  }

  let aiReply = null;

  try {
    aiReply = await Promise.race([
      getChatResponse([
        { role: "system", content: "You are GoldenBangle customer support." },
        { role: "user", content: message }
      ]),
      new Promise(resolve => setTimeout(() => resolve(null), 2500))
    ]);
  } catch (err) {
    console.error("🔥 Groq error:", err.message);
  }

  return res.json({
    reply: aiReply || "Could you please describe the issue you are facing?"
  });
});

export default router;
