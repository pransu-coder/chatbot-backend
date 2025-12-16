import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ✅ ROOT ROUTE (VERY IMPORTANT) */
app.get("/", (req, res) => {
  res.send("GoldenBangle Chatbot Backend is running 🚀");
});

app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  console.log("GROQ KEY FOUND:", !!process.env.GROQ_API_KEY);
});
