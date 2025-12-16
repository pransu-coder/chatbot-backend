import express from "express";
import { getChatResponse } from "../services/groqClient.js";

const router = express.Router();
const sessions = new Map();

/* ========= JEWELLERY INTENT DETECTORS ========= */
const intent = {
  greet: m => /hi|hello|hey|namaste/i.test(m),
  bangleIssue: m => /broken|damage|crack|loose|size|issue|problem/i.test(m),
  polish: m => /polish|shine|dull/i.test(m),
  care: m => /care|maintain|clean/i.test(m),
  gold: m => /gold|22k|24k/i.test(m),
  silver: m => /silver/i.test(m),
  price: m => /price|cost|rate/i.test(m),
  replace: m => /replace|replacement|exchange/i.test(m),
  refund: m => /refund|return/i.test(m),
  thanks: m => /thank/i.test(m),
};

/* ========= STRUCTURED JEWELLERY REPLIES ========= */
const replies = {
  greet:
    "✨ Welcome to GoldenBangle Support ✨\n" +
    "We specialise in premium gold & silver bangles.\n\n" +
    "How may I assist you today?",

  care:
    "💎 *Bangle Care Tips*\n" +
    "• Avoid contact with water & chemicals\n" +
    "• Store bangles in a soft cloth pouch\n" +
    "• Clean gently with a dry soft cloth\n\n" +
    "Would you like help with a specific issue?",

  polish:
    "✨ *Polishing & Shine*\n" +
    "We offer professional polishing services for gold & silver bangles.\n\n" +
    "If your bangle has lost its shine, you can register a service request.",

  gold:
    "🟡 *Gold Bangles*\n" +
    "Our bangles are crafted in certified gold quality (22K/24K depending on design).\n\n" +
    "For weight, purity or making charges, please contact our sales team.",

  silver:
    "⚪ *Silver Bangles*\n" +
    "Silver bangles may oxidise naturally over time.\n" +
    "Regular cleaning helps maintain shine.",

  price:
    "💰 *Pricing Information*\n" +
    "Bangle prices depend on:\n" +
    "• Gold/Silver rate\n" +
    "• Weight & design\n" +
    "• Making charges\n\n" +
    "For exact pricing, please visit our showroom or website.",

  replace:
    "🔁 *Replacement Policy*\n" +
    "Replacement is available for manufacturing defects.\n\n" +
    "Please register a complaint and upload the product image for verification.",

  refund:
    "💳 *Refund Policy*\n" +
    "Refunds are subject to product inspection and company policy.\n\n" +
    "Please register a complaint so our team can guide you further.",

  thanks:
    "🙏 Thank you for choosing GoldenBangle.\n" +
    "If you need any further assistance, I’m always here to help.",
};

router.post("/", async (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  const msg = message.toLowerCase();

  /* ========= SESSION INIT ========= */
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 0, data: {} });
    return res.json({ reply: replies.greet });
  }

  const session = sessions.get(userId);

  /* ========= GENERAL JEWELLERY HELP ========= */
  if (intent.greet(msg)) return res.json({ reply: replies.greet });
  if (intent.care(msg)) return res.json({ reply: replies.care });
  if (intent.polish(msg)) return res.json({ reply: replies.polish });
  if (intent.gold(msg)) return res.json({ reply: replies.gold });
  if (intent.silver(msg)) return res.json({ reply: replies.silver });
  if (intent.price(msg)) return res.json({ reply: replies.price });
  if (intent.replace(msg)) return res.json({ reply: replies.replace });
  if (intent.refund(msg)) return res.json({ reply: replies.refund });
  if (intent.thanks(msg)) return res.json({ reply: replies.thanks });

  /* ========= COMPLAINT FLOW (STRICT) ========= */

  // STEP 0 → START ISSUE
  if (session.step === 0 && intent.bangleIssue(msg)) {
    session.step = 1;
    return res.json({
      reply:
        "🛠 *Bangle Issue Support*\n" +
        "Please describe the issue you are facing with your bangle."
    });
  }

  // STEP 1 → ISSUE
  if (session.step === 1) {
    session.data.issue = message;
    session.step = 2;
    return res.json({
      reply: "👤 Please share your full name."
    });
  }

  // STEP 2 → NAME
  if (session.step === 2) {
    session.data.name = message;
    session.step = 3;
    return res.json({
      reply: "📧 Please share your email address."
    });
  }

  // STEP 3 → EMAIL
  if (session.step === 3) {
    if (!message.includes("@")) {
      return res.json({ reply: "Please enter a valid email address." });
    }
    session.data.email = message;
    session.step = 4;
    return res.json({
      reply: "📞 Please share your phone number."
    });
  }

  // STEP 4 → PHONE
  if (session.step === 4) {
    if (message.length < 8) {
      return res.json({ reply: "Please enter a valid phone number." });
    }
    session.data.phone = message;
    session.step = 5;
    return res.json({
      reply: "📷 Please upload a clear image of the bangle."
    });
  }

  // STEP 5 → IMAGE
  if (session.step === 5 && imageUploaded) {
    const id = "GB" + Math.floor(1000 + Math.random() * 9000);

    console.log("💎 Bangle Complaint:", { id, ...session.data });

    sessions.delete(userId);

    return res.json({
      reply:
        "✅ *Complaint Registered Successfully*\n\n" +
        `🆔 Complaint ID: ${id}\n\n` +
        "Our jewellery expert team will contact you shortly."
    });
  }

  /* ========= SAFE AI FALLBACK (JEWELLERY ONLY) ========= */
  let aiReply = null;
  try {
    aiReply = await Promise.race([
      getChatResponse([
        {
          role: "system",
          content:
            "You are GoldenBangle customer support for gold and silver bangles only. Do not answer electronics or unrelated topics."
        },
        { role: "user", content: message }
      ]),
      new Promise(resolve => setTimeout(() => resolve(null), 2000))
    ]);
  } catch {}

  return res.json({
    reply:
      aiReply ||
      "💬 I can assist you with gold or silver bangles, care, repair, or replacement."
  });
});

export default router;
