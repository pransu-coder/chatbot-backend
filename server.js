import dotenv from "dotenv";
dotenv.config(); // 👈 ALWAYS FIRST

import express from "express";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// body parser
app.use(express.json());

// static files (frontend)
app.use(express.static("public"));

// routes
app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
