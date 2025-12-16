import dotenv from "dotenv";
dotenv.config(); // local ke liye, Render ignore karta hai

import express from "express";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  console.log("GROQ KEY FOUND:", !!process.env.GROQ_API_KEY);
});

