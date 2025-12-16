import express from "express";
import { getChatResponse } from "../services/groqClient.js";

const router = express.Router();
const sessions = new Map();

router.post("/", async (req, res) => {
  const { message, userId, imageUploaded } = req.body || {};

  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  // INIT SESSION
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {} });
    return res.json({
      reply: "Hello, welcome to GoldenBangle support."
    });
  }

  const session = sessions.get(userId);

  /* ================= STEP FLOW ================= */

  // STEP 1 → ASK ISSUE
  if (session.step === 0) {
    session.step = 1;
    return res.json({
      reply: "Please describe the issue you are facing."
    });
  }

  // STEP 2 → SAVE ISSUE, ASK NAME
  if (session.step === 1) {
    if (!message) {
      return res.json({ reply: "Please describe your issue." });
    }
    session.data.issue = message;
    session.step = 2;
    return res.json({
      reply: "May I have your full name?"
    });
  }

  // STEP 3 → SAVE NAME, ASK EMAIL
  if (session.step === 2) {
    if (!message) {
      return res.json({ reply: "Please enter your name." });
    }
    session.data.name = message;
    session.step = 3;
    return res.json({
      reply: "Please share your email address."
    });
  }

  // STEP 4 → SAVE EMAIL, ASK PHONE
  if (session.step === 3) {
    if (!message || !message.includes("@")) {
      return res.json({ reply: "Please enter a valid email address." });
    }
    session.data.email = message;
    session.step = 4;
    return res.json({
      reply: "Please share your phone number."
    });
  }

  // STEP 5 → SAVE PHONE, ASK IMAGE
  if (session.step === 4) {
    if (!message || message.length < 8) {
      return res.json({ reply: "Please enter a valid phone number." });
    }
    session.data.phone = message;
    session.step = 5;
    return res.json({
      reply: "Please upload an image of the product."
    });
  }

  // STEP 6 → IMAGE UPLOAD → FINAL SUCCESS
  if (session.step === 5 && imageUploaded) {
    const id = "GD" + Math.floor(1000 + Math.random() * 9000);

    // OPTIONAL: console log / DB save here
    console.log("📦 Complaint:", {
      id,
      ...session.data
    });

    sessions.delete(userId);

    return res.json({
      reply:
        `Thank you for uploading the product image.\n\n` +
        `Your complaint has been registered successfully.\n\n` +
        `Complaint ID: ${id}\n\n` +
        `Our team will contact you shortly.`
    });
  }

  // SAFETY FALLBACK (AI optional, controlled)
  let aiReply = null;
  try {
    aiReply = await Promise.race([
      getChatResponse([
        { role: "system", content: "You are GoldenBangle customer support." },
        { role: "user", content: message }
      ]),
      new Promise(resolve => setTimeout(() => resolve(null), 2000))
    ]);
  } catch {}

  return res.json({
    reply: aiReply || "Please continue."
  });
});

export default router;
