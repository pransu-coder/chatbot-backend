import express from "express";

const router = express.Router();
const sessions = new Map();

router.post("/", async (req, res) => {
  const { message, userId, imageUploaded } = req.body;

  if (!userId) {
    return res.json({ reply: "Session error. Please refresh." });
  }

  // IMAGE UPLOAD FINAL STEP
  if (imageUploaded) {
    sessions.delete(userId);
    const id = "GD" + Math.floor(1000 + Math.random() * 9000);
    return res.json({
      reply:
        `Thank you for uploading the product image.\n\n` +
        `Your complaint has been registered.\n\n` +
        `Complaint ID: ${id}`
    });
  }

  // FIRST MESSAGE
  if (!sessions.has(userId)) {
    sessions.set(userId, { step: 1 });
    return res.json({
      reply: "Hello, welcome to GoldenBangle support."
    });
  }

  const session = sessions.get(userId);

  // STEP 2
  if (session.step === 1) {
    session.step = 2;
    return res.json({
      reply: "What issue are you facing?"
    });
  }

  // STEP 3
  if (session.step === 2) {
    session.step = 3;
    return res.json({
      reply: "May I have your name?"
    });
  }

  // STEP 4
  if (session.step === 3) {
    session.step = 4;
    return res.json({
      reply: "Please share your email address."
    });
  }

  // STEP 5
  if (session.step === 4) {
    session.step = 5;
    return res.json({
      reply: "Please share your phone number."
    });
  }

  // STEP 6
  if (session.step === 5) {
    session.step = 6;
    return res.json({
      reply: "Please upload a clear image of the product."
    });
  }

  return res.json({
    reply: "Please upload the product image to proceed."
  });
});

export default router;
