import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import interviewRoutes from "./routes/interview.routes";
import AuthRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import compression from "compression";

dotenv.config();

const app = express();

// middleware
app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:4000"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.use("/api/interview", interviewRoutes);
app.use('/api/auth', AuthRoutes);

connectDB();

app.listen(4000, () => {
    console.log("Server running on port 3000");
});
