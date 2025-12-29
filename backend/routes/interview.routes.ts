import { Router } from "express";
import multer from "multer";
import Resume from "../models/Resume";
import Interview from "../models/Interview";
import { extractResumeText } from "../services/resume.service";
import { generateQuestion, evaluateAnswer } from "../services/groq.service";
import upload from "../middleware/upload";
import { getClientIp } from "../helpers/clientip.helper";

const router = Router();
// const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const resumeText = await extractResumeText(req.file.path);
        console.log(resumeText);

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ message: "Could not extract resume text" });
        }

        const ip = await getClientIp(req);
        const checkExisting = await Resume.findOne({ userId: ip });
        if (checkExisting) {
            return res.status(400).json({ message: "Resume already uploaded from this IP" });
        }

        const resume = new Resume({
            userId: getClientIp(req), // In real app, get from auth
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

router.get('/history', async (req, res) => {
    const ip = await getClientIp(req);
    const interviews = await Interview.find({ userId: ip }).sort({ _id: 1 });
    res.json({ interviews });
});

router.post("/question", async (req, res) => {
    const ip = await getClientIp(req);
    const resume = await Resume.findOne({ userId: ip });
    const question = await generateQuestion(resume!.text);
    Interview.create({
        userId: ip,
        question,
        answer: "",
        evaluation: "",
        score: 0
    });
    res.json({ question });
});

router.post("/answer", async (req, res) => {
    const ip = await getClientIp(req);
    const { question, answer, questionId } = req.body;
    const resume = await Resume.findOne({ userId: ip });

    const evaluation = await evaluateAnswer(
        resume!.text,
        question,
        answer
    );

    if (evaluation.nextAction != "NONE") {
        Interview.create({
            userId: ip,
            question: evaluation.nextAction,
            answer: "",
            evaluation: "",
            score: 0
        });
    } else if (evaluation.nextQuestion && evaluation.nextQuestion != "NONE") {
        Interview.create({
            userId: ip,
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
                userId: ip,
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
