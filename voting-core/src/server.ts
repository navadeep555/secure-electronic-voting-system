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

// 1. IMPROVED CORS: Allow frontend URL from env (for production) or localhost (for dev)
const defaultOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];
const allowedOrigins = [...defaultOrigins, ...envOrigins];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
    }
  },
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

if (process.env.NODE_ENV !== "test") {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Voting Core running at http://localhost:${PORT}`);
    });
  });
}

export default app;
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