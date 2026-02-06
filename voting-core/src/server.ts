// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import voteRoutes from "./routes/vote";
import { initDB } from "./db";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/votes", voteRoutes);

const PORT = process.env.PORT || 5002;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Voting Core running at http://localhost:${PORT}`);
  });
});
