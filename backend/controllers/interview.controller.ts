import User, { UserDocument } from "../models/User";
import Resume from "../models/Resume";
import Interview from "../models/Interview";
import InterviewState from "../models/InterviewState";
import { Request, Response } from "express";
import { signAccessToken, signRefreshToken } from "../helpers/jwt.helper";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";



class InterviewController {
    getUserProfile = async (req: Request, res: Response) => {
        const userId = req.params.id;
        const user = await this.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }

    getUserById = async (id: string) => {
        return await User.findById(id);
    }

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password") as UserDocument | null;

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // optional audit field
        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        const accessToken = signAccessToken({ sub: user._id.toString(), role: "user" });
        const refreshToken = signRefreshToken({ sub: user._id.toString() });

        await this.saveRefreshToken(user._id.toString(), refreshToken);

        // httpOnly cookie for refresh token (XSS-safe)
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth/refresh"
        });

        return res.json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    }

    refreshToken = async (req: Request, res: Response) => {
        const token = req.cookies?.refresh_token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

            // 🔐 Check refresh token matches DB (prevents reuse / theft)
            const user = await User.findById(decoded.sub).select("refreshToken");
            if (!user || user.refreshToken !== token) {
                return res.status(403).json({ message: "Token reuse detected" });
            }

            // Optionally rotate refresh token
            const newRefresh = signRefreshToken({ sub: decoded.sub });
            await this.saveRefreshToken(decoded.sub, newRefresh);

            const accessToken = signAccessToken({ sub: decoded.sub });

            res.cookie("refresh_token", newRefresh, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/api/auth/refresh"
            });

            res.json({ accessToken });
        } catch {
            res.status(401).json({ message: "Invalid or expired token" });
        }
    };

    saveRefreshToken = async (id: string, refreshToken: string) => {
        await User.updateOne(
            { _id: id },
            { $set: { refreshToken: refreshToken } }
        );
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
    };
}

export default new InterviewController();

