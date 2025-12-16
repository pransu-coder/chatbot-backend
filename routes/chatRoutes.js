import express from "express";

const router = express.Router();
const sessions = new Map();

/* ===== SIMPLE FIXED REPLIES ===== */
const replies = {
  greet: "✨ Welcome to GoldenBangle Support. How may I assist you today?",
  help:
    "I can help you with:\n" +
    "• Gold & Silver bangles\n" +
    "• Repair or replacement\n" +
    "• Bangle care & polishing\n\n" +
    "Please tell me your concern.",
  price:
    "💰 Bangle prices depend on gold/silver rate, weight and design.\n" +
    "For exact pricing, please visit our showroom or website.",
  care:
    "💎 Bangle Care Tips:\n" +
    "• Avoid water & chemicals\n" +
    "• Store in soft cloth\n" +
    "• Clean with dry cloth",
  polish:
    "✨ We provide professional polishing services for gold and silver bangles.",
  thanks:
    "🙏 Thank you for choosing GoldenBangle. I’m happy to assist you anytime."
};

/* ===== KEYWORD CHECKS ===== */
const is = {
  greet: m => /hi|hello|hey|namaste/i.test(m),
  help: m => /help|support/i.test(m),
  price: m => /price|cost|rate/i.test(m),
  care: m => /care|clean|maintain/i.test(m),
  polish: m => /polish|shine/i.test(m),
  issue: m => /broken|damage|issue|problem/i.test(m),
  thanks: m => /thank/i.test(m),
};

router.post("/", (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  const msg = message.toLowerCase();

  /* ===== SESSION INIT ===== */
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {} });
    return res.json({ reply: replies.greet });
  }

  const session = sessions.get(userId);

  /* ===== SIMPLE GENERAL REPLIES ===== */
  if (is.greet(msg)) return res.json({ reply: replies.greet });
  if (is.help(msg)) return res.json({ reply: replies.help });
  if (is.price(msg)) return res.json({ reply: replies.price });
  if (is.care(msg)) return res.json({ reply: replies.care });
  if (is.polish(msg)) return res.json({ reply: replies.polish });
  if (is.thanks(msg)) return res.json({ reply: replies.thanks });

  /* ===== COMPLAINT FLOW ===== */
  if (session.step === 0 && is.issue(msg)) {
    session.step = 1;
    return res.json({
      reply: "🛠 Please describe the issue you are facing with your bangle."
    });
  }

  if (session.step === 1) {
    session.data.issue = message;
    session.step = 2;
    return res.json({ reply: "👤 Please share your full name." });
  }

  if (session.step === 2) {
    session.data.name = message;
    session.step = 3;
    return res.json({ reply: "📧 Please share your email address." });
  }

  if (session.step === 3) {
    if (!message.includes("@")) {
      return res.json({ reply: "Please enter a valid email address." });
    }
    session.data.email = message;
    session.step = 4;
    return res.json({ reply: "📞 Please share your phone number." });
  }

  if (session.step === 4) {
    if (message.length < 8) {
      return res.json({ reply: "Please enter a valid phone number." });
    }
    session.data.phone = message;
    session.step = 5;
    return res.json({ reply: "📷 Please upload a clear image of the bangle." });
  }

  if (session.step === 5 && imageUploaded) {
    const id = "GB" + Math.floor(1000 + Math.random() * 9000);
    sessions.delete(userId);

    return res.json({
      reply:
        "✅ Complaint registered successfully.\n\n" +
        `🆔 Complaint ID: ${id}\n\n` +
        "Our team will contact you shortly."
    });
  }

  /* ===== FALLBACK ===== */
  return res.json({
    reply:
      "I can help you with gold or silver bangles, repair, replacement or care."
  });
});

export default router;
