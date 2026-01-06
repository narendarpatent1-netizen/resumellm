import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import interviewRoutes from "./routes/interview.routes";
import AuthRoutes from "./routes/auth.routes";

dotenv.config();


const app = express();

// middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:8080"],
    credentials: true
}));
app.use(express.json());

app.use("/api/interview", interviewRoutes);

app.use('/api/auth', AuthRoutes);

connectDB();

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
