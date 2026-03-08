// src/server.ts
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import adminRoutes from "./routes/admin";
import voteRoutes from "./routes/vote";
import { initDB } from "./db";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Apply security headers
app.use(helmet());

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Apply the rate limiting middleware to API calls
app.use("/api/", apiLimiter);

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
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.status(200).json({
    service: "Secure Electronic Voting System - Voting Core API",
    status: "Healthy 🟢",
    timestamp: new Date().toISOString()
  });
});