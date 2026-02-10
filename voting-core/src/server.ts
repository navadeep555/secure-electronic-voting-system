// src/server.ts
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import adminRoutes from "./routes/admin";
import voteRoutes from "./routes/vote";
import { initDB } from "./db";

const app = express();

// 1. IMPROVED CORS: Explicitly allow the Authorization header
app.use(cors({
  origin: "http://localhost:8080", // Your Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// 2. LOGGING MIDDLEWARE: See exactly what hits your server
app.use((req, res, next) => {
  if (req.path.includes("cast-vote")) {
    console.log("--- INCOMING VOTE REQUEST ---");
    console.log("Method:", req.method);
    console.log("Auth Header:", req.headers.authorization); 
    console.log("Body Key:", req.body?.encryptionKey);
  }
  next();
});

app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5002;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Voting Core running at http://localhost:${PORT}`);
  });
});