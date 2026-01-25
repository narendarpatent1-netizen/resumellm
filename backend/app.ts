import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import interviewRoutes from "./routes/interview.routes";
import AuthRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from 'express-rate-limit';
import helmet from "helmet";

dotenv.config();

const app = express();

// middleware
app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:4000"],
    credentials: true
}));
app.use(helmet());
const perApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many requests for this API. Try again after 1 minute."
  },

  // 🔑 KEY PART (this makes it PER API)
  keyGenerator: (req) => {
    return `${req.ip}-${req.path}`;
  }
});
// ✅ Apply to ALL APIs
app.use('/api', perApiLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.use("/api/interview", interviewRoutes);
app.use('/api/auth', AuthRoutes);
connectDB();

app.listen(4000, () => {
    console.log("Server running on port 4000");
});
