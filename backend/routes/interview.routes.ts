import { Router } from "express";
import multer from "multer";
import Resume from "../models/Resume";
import Interview from "../models/Interview";
import { extractResumeText } from "../services/resume.service";
import { generateQuestion, evaluateAnswer } from "../services/groq.service";
import upload from "../middleware/upload";
import * as nodeCrypto from "crypto";

const router = Router();

router.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const resumeText = await extractResumeText(req.file.path);

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ message: "Could not extract resume text" });
        }

        const checkExisting = await Resume.findOne({ userId: req.body.userId, hash: hashText(resumeText) });
        if (checkExisting) {
            return res.status(400).json({ message: "Resume already uploaded from this user" });
        }

        const resume = new Resume({
            userId: req.body.userId, // In real app, get from auth
            fileName: req.file.originalname,
            hash: hashText(resumeText),
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

function hashText(text: string) {
    return nodeCrypto.createHash("sha256").update(text).digest("hex");
}

router.get('/history', async (req, res) => {
    const interviews = await Interview.find({ userId: req.query.userId }).sort({ _id: 1 });
    res.json({ interviews });
});

router.post("/question", async (req, res) => {
    const { userId } = req.body;
    const resume = await Resume.findOne({ userId: userId });
    const question = await generateQuestion(resume!.text);
    const doc = await Interview.create({
        userId: userId,
        question,
        answer: "",
        evaluation: "",
        score: 0
    });

    const insertedId = doc._id;
    res.json({ question, id: insertedId });
});

router.post("/answer", async (req, res) => {
    const { question, answer, questionId, userId } = req.body;
    const resume = await Resume.findOne({ userId: userId });

    const evaluation = await evaluateAnswer(
        resume!.text,
        question,
        answer
    );

    if (evaluation.nextAction != "NONE") {
        Interview.create({
            userId: userId,
            question: evaluation.nextAction,
            answer: "",
            evaluation: "",
            score: 0
        });
    } else if (evaluation.nextQuestion && evaluation.nextQuestion != "NONE") {
        Interview.create({
            userId: userId,
            question: evaluation.nextQuestion,
            answer: "",
            evaluation: "",
            score: 0
        });
    }

    await Interview.updateOne(
        { _id: questionId },
        {
            $set: {
                userId: userId,
                question,
                answer,
                evaluation: evaluation.raw,
                score: evaluation.score ?? 0
            }
        }
    );


    res.json({ evaluation: evaluation.raw });
});

export default router;
