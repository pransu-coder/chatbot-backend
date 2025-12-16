import express from "express";
import { getChatResponse } from "../services/groqClient.js";

const router = express.Router();
const sessions = new Map();

const isGreeting = (msg) =>
  /hi|hello|hey|namaste/i.test(msg);

const isHelp = (msg) =>
  /help|support|guide|confused|samajh/i.test(msg);

router.post("/", async (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  /* ===== INIT SESSION ===== */
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {}, lastQuestion: "" });
    return res.json({
      reply: "Hello 👋 Welcome to GoldenBangle support. How may I assist you today?"
    });
  }

  const session = sessions.get(userId);
  const msg = message.trim();

  /* ===== GLOBAL SMART HANDLING ===== */

  if (isGreeting(msg)) {
    return res.json({
      reply: "Hello 😊 Please tell me what issue you are facing with your product."
    });
  }

  if (isHelp(msg)) {
    return res.json({
      reply:
        "I’m here to help you 😊\n" +
        "You can report a product issue, ask about orders, or get support.\n\n" +
        (session.lastQuestion || "Please describe your issue.")
    });
  }

  /* ===== STEP FLOW ===== */

  // STEP 0 → ASK ISSUE
  if (session.step === 0) {
    session.step = 1;
    session.lastQuestion = "Please describe the issue you are facing.";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 1 → ISSUE
  if (session.step === 1) {
    if (!msg) {
      return res.json({ reply: "Please describe your issue." });
    }
    session.data.issue = msg;
    session.step = 2;
    session.lastQuestion = "May I have your full name?";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 2 → NAME
  if (session.step === 2) {
    if (msg.length < 2) {
      return res.json({ reply: "Please enter a valid name." });
    }
    session.data.name = msg;
    session.step = 3;
    session.lastQuestion = "Please share your email address.";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 3 → EMAIL
  if (session.step === 3) {
    if (!msg.includes("@")) {
      return res.json({ reply: "Please enter a valid email address." });
    }
    session.data.email = msg;
    session.step = 4;
    session.lastQuestion = "Please share your phone number.";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 4 → PHONE
  if (session.step === 4) {
    if (msg.length < 8) {
      return res.json({ reply: "Please enter a valid phone number." });
    }
    session.data.phone = msg;
    session.step = 5;
    session.lastQuestion = "Please upload an image of the product.";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 5 → IMAGE
  if (session.step === 5 && imageUploaded) {
    const id = "GD" + Math.floor(1000 + Math.random() * 9000);

    console.log("📦 Complaint Registered:", {
      id,
      ...session.data
    });

    sessions.delete(userId);

    return res.json({
      reply:
        `✅ Thank you for uploading the product image.\n\n` +
        `Your complaint has been registered successfully.\n\n` +
        `🆔 Complaint ID: ${id}\n\n` +
        `Our support team will contact you shortly.`
    });
  }

  /* ===== SMART AI ASSIST (NON-BLOCKING) ===== */

  let aiReply = null;
  try {
    aiReply = await Promise.race([
      getChatResponse([
        {
          role: "system",
          content:
            "You are a helpful GoldenBangle customer support assistant. Answer briefly and politely."
        },
        { role: "user", content: msg }
      ]),
      new Promise(resolve => setTimeout(() => resolve(null), 2000))
    ]);
  } catch {}

  return res.json({
    reply:
      aiReply ||
      session.lastQuestion ||
      "Please continue."
  });
});

export default router;
