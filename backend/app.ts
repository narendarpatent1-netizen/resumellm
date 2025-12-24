import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import interviewRoutes from "./routes/interview.routes";

dotenv.config();


const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.use("/api/interview", interviewRoutes);

connectDB();

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
