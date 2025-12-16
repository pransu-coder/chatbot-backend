import express from "express";

const router = express.Router();
const sessions = new Map();

/* ================= TRAINING DATA ================= */

const TRAINING = {
  GREET: {
    match: /(hi|hello|hey|namaste)/i,
    reply:
      "✨ Welcome to GoldenBangle Support.\n" +
      "How may I assist you today?"
  },

  PRICE: {
    match: /(price|cost|rate|charges)/i,
    reply:
      "💰 *Pricing Information*\n" +
      "Bangle prices depend on:\n" +
      "• Gold/Silver rate\n" +
      "• Weight & design\n" +
      "• Making charges\n\n" +
      "For exact pricing, please visit our showroom or website."
  },

  CARE: {
    match: /(care|clean|maintain)/i,
    reply:
      "💎 *Bangle Care Tips*\n" +
      "• Avoid water & chemicals\n" +
      "• Store in soft cloth pouch\n" +
      "• Clean gently with dry cloth"
  },

  POLISH: {
    match: /(polish|shine|dull)/i,
    reply:
      "✨ *Polishing Service*\n" +
      "We provide professional polishing for gold & silver bangles."
  },

  DELIVERY: {
    match: /(delivery|shipping|courier)/i,
    reply:
      "🚚 *Delivery Information*\n" +
      "Orders are delivered within 5–7 working days."
  },

  THANKS: {
    match: /(thank|thanks)/i,
    reply:
      "🙏 Thank you for choosing GoldenBangle.\n" +
      "I’m here if you need further assistance."
  },

  NOT_ALLOWED: {
    match: /(mobile|laptop|tv|charger|electronics)/i,
    reply:
      "❌ I can assist only with gold or silver bangles.\n" +
      "Please let me know your jewellery-related query."
  }
};

/* ================= COMPLAINT FLOW ================= */

router.post("/", (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  const msg = message.toLowerCase();

  /* INIT SESSION */
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {} });
    return res.json({ reply: TRAINING.GREET.reply });
  }

  const session = sessions.get(userId);

  /* ================= TRAINED INTENTS ================= */

  for (const key in TRAINING) {
    if (TRAINING[key].match.test(msg)) {
      return res.json({ reply: TRAINING[key].reply });
    }
  }

  /* ================= COMPLAINT FLOW ================= */

  if (session.step === 0 && /(broken|damage|issue|problem)/i.test(msg)) {
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
        "✅ *Complaint Registered Successfully*\n\n" +
        `🆔 Complaint ID: ${id}\n\n` +
        "Our jewellery expert team will contact you shortly."
    });
  }

  /* ================= SAFE FALLBACK ================= */

  return res.json({
    reply:
      "💬 I can help you with:\n" +
      "• Gold & silver bangles\n" +
      "• Repair or replacement\n" +
      "• Care & polishing\n\n" +
      "Please tell me your concern."
  });
});

export default router;
