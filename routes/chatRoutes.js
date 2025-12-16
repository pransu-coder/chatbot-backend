import express from "express";

const router = express.Router();
const sessions = new Map();

/* ===== KEYWORD GROUPS ===== */
const is = {
  greet: m => /(hi|hello|hey|namaste)/i.test(m),
  issue: m => /(complaint|repair|broken|damage|issue|problem)/i.test(m),
  price: m => /(price|cost|rate)/i.test(m),
  care: m => /(care|clean|maintain)/i.test(m),
  polish: m => /(polish|shine|dull)/i.test(m),
  thanks: m => /(thank)/i.test(m),
  notAllowed: m => /(mobile|laptop|tv|charger|electronics)/i.test(m),
};

router.post("/", (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  const msg = message.toLowerCase();

  /* ===== INIT SESSION ===== */
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {} });
    return res.json({
      reply:
        "✨ Welcome to GoldenBangle Support.\n" +
        "How may I assist you today?"
    });
  }

  const session = sessions.get(userId);

  /* ===================================================
     🔥 COMPLAINT FLOW (TOP PRIORITY – FIXED)
  =================================================== */

  // START COMPLAINT
  if (session.step === 0 && is.issue(msg)) {
    session.step = 1;
    return res.json({
      reply:
        "🛠 I’m sorry to hear that.\n" +
        "Please describe the issue you are facing with your bangle."
    });
  }

  // ISSUE DESCRIPTION
  if (session.step === 1) {
    session.data.issue = message;
    session.step = 2;
    return res.json({ reply: "👤 Please share your full name." });
  }

  // NAME
  if (session.step === 2) {
    session.data.name = message;
    session.step = 3;
    return res.json({ reply: "📧 Please share your email address." });
  }

  // EMAIL
  if (session.step === 3) {
    if (!message.includes("@")) {
      return res.json({ reply: "Please enter a valid email address." });
    }
    session.data.email = message;
    session.step = 4;
    return res.json({ reply: "📞 Please share your phone number." });
  }

  // PHONE
  if (session.step === 4) {
    if (message.length < 8) {
      return res.json({ reply: "Please enter a valid phone number." });
    }
    session.data.phone = message;
    session.step = 5;
    return res.json({ reply: "📷 Please upload a clear image of the bangle." });
  }

  // IMAGE → SUCCESS
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

  /* ===================================================
     GENERAL JEWELLERY REPLIES (AFTER COMPLAINT)
  =================================================== */

  if (is.greet(msg)) {
    return res.json({ reply: "Hello 😊 How can I help you?" });
  }

  if (is.price(msg)) {
    return res.json({
      reply:
        "💰 Bangle prices depend on gold/silver rate, weight and design."
    });
  }

  if (is.care(msg)) {
    return res.json({
      reply:
        "💎 Bangle Care Tips:\n" +
        "• Avoid water & chemicals\n" +
        "• Store in soft cloth\n" +
        "• Clean with dry cloth"
    });
  }

  if (is.polish(msg)) {
    return res.json({
      reply:
        "✨ We provide professional polishing for gold & silver bangles."
    });
  }

  if (is.thanks(msg)) {
    return res.json({
      reply: "🙏 Thank you for choosing GoldenBangle."
    });
  }

  if (is.notAllowed(msg)) {
    return res.json({
      reply:
        "❌ I can assist only with gold or silver bangles and jewellery services."
    });
  }

  /* ===== SAFE FALLBACK ===== */
  return res.json({
    reply:
      "💬 I can help you with:\n" +
      "• Bangle repair or replacement\n" +
      "• Care & polishing\n" +
      "• Pricing information\n\n" +
      "Please tell me your concern."
  });
});

export default router;
