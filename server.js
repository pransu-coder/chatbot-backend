import express from "express";
dotenv.config();
import dotenv from "dotenv";
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
});
