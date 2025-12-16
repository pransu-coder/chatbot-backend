import express from "express";

const router = express.Router();
const sessions = new Map();

/* ================= COMMON CLOSING ================= */
const CLOSING =
  "Thank you for choosing GoldenBangle. We appreciate your trust in our craftsmanship.";

/* ================= KEYWORD DETECTION ================= */
const intent = {
  greet: m => /(hi|hello|hey|namaste)/i.test(m),

  price: m => /(price|cost|rate|charges)/i.test(m),

  delivery: m => /(delivery|shipping|dispatch|courier)/i.test(m),

  complaint: m => /(complaint|repair|broken|damage|issue|problem)/i.test(m),

  care: m => /(care|clean|maintain|polish|shine)/i.test(m),

  thanks: m => /(thank)/i.test(m),

  invalid: m => /(mobile|laptop|tv|electronics|charger)/i.test(m),
};

router.post("/", (req, res) => {
  const { message = "", userId, imageUploaded } = req.body || {};
  if (!userId) {
    return res.json({ reply: "Please refresh the page and try again." });
  }

  const msg = message.toLowerCase();

  /* ================= SESSION INIT ================= */
  if (!sessions.has(userId)) {
    sessions.set(userId, { flow: null, step: 0, data: {} });
    return res.json({
      reply:
        "Welcome to GoldenBangle Support.\n" +
        "How may we assist you today?"
    });
  }

  const session = sessions.get(userId);

  /* ==================================================
     INVALID DOMAIN
  ================================================== */
  if (intent.invalid(msg)) {
    return res.json({
      reply:
        "We assist only with gold and silver bangles and related services.\n\n" +
        CLOSING
    });
  }

  /* ==================================================
     START FLOWS (ONLY IF NO ACTIVE FLOW)
  ================================================== */
  if (!session.flow) {
    if (intent.price(msg)) {
      session.flow = "price";
      return res.json({
        reply:
          "Product Pricing Information:\n" +
          "Bangle prices depend on gold or silver rate, weight, design, and making charges.\n\n" +
          "For exact pricing, please visit our showroom or official website.\n\n" +
          CLOSING
      });
    }

    if (intent.delivery(msg)) {
      session.flow = "delivery";
      return res.json({
        reply:
          "Delivery Information:\n" +
          "Orders are usually delivered within 5 to 7 working days.\n" +
          "Tracking details are shared once the product is dispatched.\n\n" +
          CLOSING
      });
    }

    if (intent.care(msg)) {
      session.flow = "care";
      return res.json({
        reply:
          "Bangle Care and Polishing Guidelines:\n" +
          "• Avoid contact with water and chemicals\n" +
          "• Store bangles in a soft cloth pouch\n" +
          "• Clean gently using a dry, soft cloth\n\n" +
          "Professional polishing services are also available.\n\n" +
          CLOSING
      });
    }

    if (intent.complaint(msg)) {
      session.flow = "complaint";
      session.step = 1;
      return res.json({
        reply:
          "We are sorry to hear that you are facing an issue.\n" +
          "Please describe the problem with your bangle."
      });
    }
  }

  /* ==================================================
     COMPLAINT FLOW (MULTI-STEP)
  ================================================== */
  if (session.flow === "complaint") {
    if (session.step === 1) {
      session.data.issue = message;
      session.step = 2;
      return res.json({ reply: "Please provide your full name." });
    }

    if (session.step === 2) {
      session.data.name = message;
      session.step = 3;
      return res.json({ reply: "Please provide your email address." });
    }

    if (session.step === 3) {
      if (!message.includes("@")) {
        return res.json({ reply: "Please enter a valid email address." });
      }
      session.data.email = message;
      session.step = 4;
      return res.json({ reply: "Please provide your contact number." });
    }

    if (session.step === 4) {
      if (message.length < 8) {
        return res.json({ reply: "Please enter a valid contact number." });
      }
      session.data.phone = message;
      session.step = 5;
      return res.json({ reply: "Please upload a clear image of the bangle." });
    }

    if (session.step === 5 && imageUploaded) {
      const complaintId =
        "GB" + Math.floor(1000 + Math.random() * 9000);

      sessions.delete(userId);

      return res.json({
        reply:
          "Complaint Registered Successfully.\n\n" +
          `Complaint ID: ${complaintId}\n\n` +
          "Our support team will review the issue and contact you shortly.\n\n" +
          CLOSING
      });
    }
  }

  /* ==================================================
     THANKS HANDLING
  ================================================== */
  if (intent.thanks(msg)) {
    return res.json({ reply: CLOSING });
  }

  /* ==================================================
     SAFE FALLBACK
  ================================================== */
  return res.json({
    reply:
      "We can assist you with:\n" +
      "• Product pricing\n" +
      "• Delivery information\n" +
      "• Bangle care and polishing\n" +
      "• Complaint and repair requests\n\n" +
      "Please let us know how we can assist you."
  });
});

export default router;
