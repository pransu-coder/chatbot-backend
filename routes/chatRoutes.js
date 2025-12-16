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
      return res.status(400).json({ error: "userId required" });
    }

    // 🔥 IMAGE UPLOADED → DIRECT FINAL MESSAGE (NO AI)
   if (imageUploaded) {
  const complaintId = "GD" + Math.floor(1000 + Math.random() * 9000);

  const session = sessions.get(userId) || {};
  const data = session.data || {};

  return res.json({
    reply: `
Thank you for uploading the product image. Your complaint has been registered.
You will receive an update within 24 to 48 hours.

Complaint ID: ${complaintId}
`
  });
}


    // 🧠 NORMAL CHAT FLOW
    if (!message) {
      return res.status(400).json({ error: "message required" });
    }

    let history = sessions.get(userId);
    if (!history) {
      history = [SYSTEM_PROMPT];
    }

    history.push({ role: "user", content: message });

    const reply = await getChatResponse(history.slice(-12));

    history.push({ role: "assistant", content: reply });
    sessions.set(userId, history);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
