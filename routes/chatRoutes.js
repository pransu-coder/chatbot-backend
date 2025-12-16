import express from "express";
import { getChatResponse } from "../services/groqClient.js";

const router = express.Router();
const sessions = new Map();

/* ================= INTENT DETECTORS ================= */

const intent = {
  greet: (m) => /hi|hello|hey|namaste/i.test(m),
  thanks: (m) => /thank|thanks|thx/i.test(m),
  refund: (m) => /refund|money back|return/i.test(m),
  replace: (m) => /replace|replacement|exchange/i.test(m),
  delivery: (m) => /delivery|ship|shipping|courier/i.test(m),
  price: (m) => /price|cost|rate/i.test(m),
  complaint: (m) => /broken|damage|issue|problem|complaint/i.test(m),
  help: (m) => /help|support|samajh|confused/i.test(m)
};

router.post("/", async (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  const msg = message.trim();

  /* ================= INIT SESSION ================= */
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {}, lastQuestion: "" });
    return res.json({
      reply: "Hello 👋 Welcome to GoldenBangle support. How can I help you today?"
    });
  }

  const session = sessions.get(userId);

  /* ================= GLOBAL INTENTS ================= */

  if (intent.greet(msg)) {
    return res.json({
      reply: "Hello 😊 How may I assist you today?"
    });
  }

  if (intent.thanks(msg)) {
    return res.json({
      reply: "You’re welcome 😊 If you need any more help, just let me know."
    });
  }

  if (intent.price(msg)) {
    return res.json({
      reply:
        "Our product prices vary based on design and weight.\n" +
        "Please visit our website or contact our sales team for exact pricing."
    });
  }

  if (intent.delivery(msg)) {
    return res.json({
      reply:
        "We usually deliver orders within 5–7 working days.\n" +
        "You will receive tracking details once the order is shipped."
    });
  }

  if (intent.refund(msg)) {
    return res.json({
      reply:
        "Refunds are processed after product inspection.\n" +
        "Please register a complaint so our team can assist you further."
    });
  }

  if (intent.replace(msg)) {
    return res.json({
      reply:
        "Replacement is available for damaged or incorrect products.\n" +
        "Please report the issue and upload the product image."
    });
  }

  if (intent.help(msg)) {
    return res.json({
      reply:
        "I can help you with:\n" +
        "• Product issues\n• Refund or replacement\n• Delivery information\n\n" +
        "Please tell me what you need help with."
    });
  }

  /* ================= COMPLAINT FLOW ================= */

  // STEP 0 → START COMPLAINT
  if (session.step === 0 && intent.complaint(msg)) {
    session.step = 1;
    session.lastQuestion = "Please describe the issue you are facing.";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 1 → ISSUE
  if (session.step === 1) {
    session.data.issue = msg;
    session.step = 2;
    session.lastQuestion = "May I have your full name?";
    return res.json({ reply: session.lastQuestion });
  }

  // STEP 2 → NAME
  if (session.step === 2) {
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

  // STEP 5 → IMAGE UPLOAD
  if (session.step === 5 && imageUploaded) {
    const id = "GD" + Math.floor(1000 + Math.random() * 9000);

    console.log("📦 Complaint:", { id, ...session.data });

    sessions.delete(userId);

    return res.json({
      reply:
        `✅ Complaint Registered Successfully!\n\n` +
        `🆔 Complaint ID: ${id}\n\n` +
        `Our support team will contact you shortly.`
    });
  }

  /* ================= AI FALLBACK (SMART) ================= */

  let aiReply = null;
  try {
    aiReply = await Promise.race([
      getChatResponse([
        {
          role: "system",
          content:
            "You are a helpful GoldenBangle customer support assistant. Answer clearly and briefly."
        },
        { role: "user", content: msg }
      ]),
      new Promise(resolve => setTimeout(() => resolve(null), 2000))
    ]);
  } catch {}

  return res.json({
    reply: aiReply || session.lastQuestion || "Please tell me how I can help you."
  });
});

export default router;
