import { Router } from "express";
import multer from "multer";
import Resume from "../models/Resume";
import Interview from "../models/Interview";
import { extractResumeText } from "../services/resume.service";
import { generateQuestion, evaluateAnswer } from "../services/gemini.service";
import upload from "../middleware/upload";

const router = Router();
// const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log(req.file.path);
        const resumeText = await extractResumeText(req.file.path);
        console.log(resumeText);

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ message: "Could not extract resume text" });
        }

        const resume = new Resume({
            userId: "user1", // In real app, get from auth
            filename: req.file.originalname,
            text: resumeText, // ✅ REQUIRED FIELD
        });

        await resume.save();

        return res.status(201).json({
            message: "Resume uploaded successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/question", async (req, res) => {
    const resume = await Resume.findOne({ userId: "user1" });
    const question = await generateQuestion(resume!.text);
    res.json({ question });
});

router.post("/answer", async (req, res) => {
    const { question, answer } = req.body;
    const resume = await Resume.findOne({ userId: "user1" });

    const evaluation = await evaluateAnswer(
        resume!.text,
        question,
        answer
    );

    await Interview.create({
        userId: "user1",
        question,
        answer,
        evaluation,
        score: 5
    });

    res.json({ evaluation });
});

export default router;
