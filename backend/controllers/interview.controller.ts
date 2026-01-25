// import User, { UserDocument } from "../models/User";
import Resume from "../models/Resume";
import Interview from "../models/Interview";
import InterviewState from "../models/InterviewState";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { extractResumeText } from "../services/resume.service";
import * as nodeCrypto from "crypto";
import { historyDTO, QuestionDTO, answerDTO } from "../validation/interview.validation";
import { generateQuestion, evaluateAnswer } from "../services/groq.service";


class InterviewController {
    uploadFile = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const resumeText = await extractResumeText(req.file.path);
            if (!resumeText || resumeText.trim().length === 0) {
                return res.status(400).json({ message: "Could not extract resume text" });
            }
            const checkExisting = await Resume.findOne({ userId: req.body.userId, hash: this.hashText(resumeText) });
            if (checkExisting) {
                return res.status(200).json({ message: "Resume already uploaded from this user", lastResumeId: checkExisting._id.toString() });
            }
            const resume = new Resume({
                userId: req.body.userId, // In real app, get from auth
                fileName: req.file.originalname,
                hash: this.hashText(resumeText),
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
    }

    hashText(text: string) {
        return nodeCrypto.createHash("sha256").update(text).digest("hex");
    }

    history = async (req, res) => {
        const params = req.query as historyDTO;
        const interviews = await Interview.find({ userId: params.userId, resumeId: params.resumeId }).sort({ _id: 1 });
        res.json({ interviews });
    }

    question = async (req, res) => {
        const body = req.body as QuestionDTO;
        const { userId, resumeId } = body;
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
    }

    fetchResult = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({
                    message: "userId is required"
                });
            }

            const data = await Resume.aggregate([
                // 1️⃣ Get all resumes for the user
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(id)
                    }
                },

                // 2️⃣ Lookup scores PER resume
                {
                    $lookup: {
                        from: "interviewconversations",
                        let: {
                            resumeId: "$_id",
                            userId: "$userId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$resumeId", "$$resumeId"] },
                                            { $eq: ["$userId", "$$userId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalScore: { $sum: "$score" }
                                }
                            }
                        ],
                        as: "scoreSummary"
                    }
                },

                // 3️⃣ Lookup interview state (exitConfirmed)
                {
                    $lookup: {
                        from: "interviewstates",
                        let: {
                            resumeId: "$_id",
                            userId: "$userId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$resumeId", "$$resumeId"] },
                                            { $eq: ["$userId", "$$userId"] },
                                            { $eq: ["$exitConfirmed", true] } // ✅ only true
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    exitConfirmed: 1
                                }
                            }
                        ],
                        as: "exitState"
                    }
                },

                // 4️⃣ Extract per-resume score and exitState safely
                {
                    $addFields: {
                        totalScore: {
                            $ifNull: [
                                { $arrayElemAt: ["$scoreSummary.totalScore", 0] },
                                0
                            ]
                        },
                        resumeId: "$_id",
                        exitConfirmed: {
                            $cond: [
                                { $gt: [{ $size: "$exitState" }, 0] },
                                true,
                                false
                            ]
                        }
                    }
                },

                // 5️⃣ Cleanup
                {
                    $project: {
                        scoreSummary: 0,
                        exitState: 0
                    }
                }
            ]);
            return res.status(200).json({
                success: true,
                data
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch result"
            });
        }
    }

    answer = async (req, res) => {
        const body = req.body as answerDTO;
        const { question, answer, questionId, userId, resumeId } = body;
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
            console.log(evaluation);
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
                    exitConfirmed: false,
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
    
    }
}

export default new InterviewController();

