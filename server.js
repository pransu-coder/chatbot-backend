import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import chatRoutes from "./routes/chatRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ✅ PUBLIC FOLDER SERVE */
app.use(express.static(path.join(__dirname, "public")));

/* ✅ ROOT ROUTE → HTML PAGE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ✅ CHAT API */
app.use("/api/chat", chatRoutes);

/* ✅ HEALTH CHECK */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  console.log("GROQ KEY FOUND:", !!process.env.GROQ_API_KEY);
});
