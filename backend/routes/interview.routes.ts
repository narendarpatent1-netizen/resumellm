import { Router } from "express";
import Resume from "../models/Resume";
import Interview from "../models/Interview";
import InterviewState from "../models/InterviewState";
import { extractResumeText } from "../services/resume.service";
import { generateQuestion, evaluateAnswer } from "../services/groq.service";
import requireAuth from '../middleware/jwt.middleware';
import upload from "../middleware/upload";
import * as nodeCrypto from "crypto";

const router = Router();

router.post("/upload", [upload.single("resume"), requireAuth], async (req, res) => {
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
            return res.status(400).json({ message: "Resume already uploaded from this user", lastResumeId: checkExisting._id.toString() });
        }
        const resume = new Resume({
            userId: req.body.userId, // In real app, get from auth
            fileName: req.file.originalname,
            hash: hashText(resumeText),
            text: resumeText, // ✅ REQUIRED FIELD
        });
        const savedResume = await resume.save();
        const resumeId = savedResume._id.toString();
        return res.status(201).json({
            message: "Resume uploaded successfully",
            lastResumeId: resumeId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

function hashText(text: string) {
    return nodeCrypto.createHash("sha256").update(text).digest("hex");
}

router.get('/history', requireAuth, async (req, res) => {
    const interviews = await Interview.find({ userId: req.query.userId, resumeId: req.query.resumeId }).sort({ _id: 1 });
    res.json({ interviews });
});

router.post("/question", requireAuth, async (req, res) => {
    const { userId, resumeId } = req.body;
    const resume = await Resume.findOne({ userId: userId, _id: resumeId });
    const question = await generateQuestion(resume!.text);
    const doc = await Interview.create({
        userId: userId,
        question,
        answer: "",
        evaluation: "",
        resumeId: resumeId,
        score: 0
    });

    const insertedId = doc._id;
    res.json({ question, id: insertedId });
});

router.post("/answer", requireAuth, async (req, res) => {
    const { question, answer, questionId, userId, resumeId } = req.body;
    const resume = await Resume.findOne({ userId: userId, _id: resumeId });
    const state = await InterviewState.findOne({ userId: userId, resumeId: resumeId });

    if (state?.expectingExitConfirmation) {
        const ans = answer.trim().toUpperCase();

        if (ans === "YES") {
            await InterviewState.updateOne(
                { userId },
                { $set: { exitConfirmed: true, expectingExitConfirmation: false, submissionStatus: true } }
            );

            await Interview.updateOne(
                { _id: questionId },
                {
                    $set: {
                        userId: userId,
                        question,
                        answer: ans,
                        score: 0,
                        resumeId: resumeId,
                    }
                }
            );

            res.json({ evaluation: "" });
        }

        if (ans === "NO") {
            await InterviewState.updateOne(
                { userId },
                { $set: { exitConfirmed: false, expectingExitConfirmation: false } }
            );

            await Interview.updateOne(
                { _id: questionId },
                {
                    $set: {
                        userId: userId,
                        answer: ans,
                        score: 0,
                        resumeId: resumeId,
                    }
                }
            );

            const question = await generateQuestion(resume!.text);
            await Interview.create({
                userId: userId,
                question,
                answer: "",
                evaluation: "",
                resumeId: resumeId,
                score: 0
            });

            res.json({ evaluation: question });
        }

    } else {
        const evaluation = await evaluateAnswer(
            resume!.text,
            question,
            answer
        );

        if (evaluation.result === "EXIT_PENDING") {
            await Interview.updateOne(
                { _id: questionId },
                {
                    $set: {
                        answer,
                        evaluation: "User requested exit — awaiting confirmation",
                        score: evaluation.score ?? 0,
                        resumeId: resumeId,
                    }
                }
            );

            Interview.create({
                userId: userId,
                question: "Are you sure you want to exit the interview? Please reply YES or NO.",
                answer: "",
                evaluation: "",
                resumeId: resumeId,
                score: 0
            });

            await InterviewState.create({
                userId,
                expectingExitConfirmation: true,
                exitConfirmed: true,
                resumeId: resumeId,
                lastPrompt: "exit_confirmation"
            });
        } else {
            if (evaluation.nextQuestion && evaluation.nextQuestion != "NONE") {
                Interview.create({
                    userId: userId,
                    question: evaluation.nextQuestion,
                    answer: "",
                    evaluation: "",
                    resumeId: resumeId,
                    score: 0
                });
            } else if (evaluation.nextAction != "NONE") {
                Interview.create({
                    userId: userId,
                    question: evaluation.nextAction,
                    answer: "",
                    evaluation: "",
                    resumeId: resumeId,
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
                        score: evaluation.score ?? 0,
                        resumeId: resumeId,
                    }
                }
            );
        }
        res.json({ evaluation: evaluation.raw });
    }

});

export default router;
