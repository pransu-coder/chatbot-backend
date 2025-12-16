import express from "express";
import { getChatResponse } from "../services/groqClient.js";

const router = express.Router();
const sessions = new Map();

const SYSTEM_PROMPT = {
  role: "system",
  content: `
You are GoldenBangle customer support.

Strict rules:
- Send only ONE short sentence per reply.
- Ask only ONE question at a time.
- Do not combine greeting and questions.
- Keep replies professional and simple.
- Reply only about GoldenBangle.
- Do not ask for order ID.

Conversation flow:
1. First reply: greet the user.
2. Second reply: ask what issue they are facing.
3. After issue is described, ask for name.
4. Then ask for email.
5. Then ask for phone number.
6. Then ask the user to upload a product image.

Do not skip steps.
Do not combine steps in one message.
  `.trim(),
};

router.post("/", async (req, res) => {
  try {
    const { message, userId, imageUploaded } = req.body;

    if (!userId) {
      return res.json({ reply: "Please refresh the page and try again." });
    }

    // 🖼️ IMAGE UPLOADED → FINAL MESSAGE (NO AI)
    if (imageUploaded) {
      const complaintId = "GD" + Math.floor(1000 + Math.random() * 9000);

      return res.json({
        reply:
          `Thank you for uploading the product image.\n` +
          `Your complaint has been registered.\n\n` +
          `You will receive an update within 24 to 48 hours.\n\n` +
          `Complaint ID: ${complaintId}`
      });
    }

    // 🟢 FIRST MESSAGE → DIRECT GREETING (NO AI CALL)
    if (!sessions.has(userId)) {
      sessions.set(userId, [SYSTEM_PROMPT]);

      return res.json({
        reply: "Hello, welcome to GoldenBangle support."
      });
    }

    // 🧠 NORMAL CHAT FLOW (AI STARTS HERE)
    if (!message) {
      return res.json({ reply: "Please type your message." });
    }

    const history = sessions.get(userId);
    history.push({ role: "user", content: message });

    const aiReply = await getChatResponse(history.slice(-10));

    const reply =
      aiReply && aiReply.trim()
        ? aiReply
        : "Could you please describe the issue you are facing?";

    history.push({ role: "assistant", content: reply });
    sessions.set(userId, history);

    res.json({ reply });

  } catch {
    res.json({
      reply: "Sorry, something went wrong. Please try again."
    });
  }
});

export default router;
