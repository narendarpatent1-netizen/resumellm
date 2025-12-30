import User, { UserDocument } from "../models/User";
import { Request, Response } from "express";
import { signAccessToken, signRefreshToken } from "../helpers/jwt.helper";
import jwt from "jsonwebtoken";



class UserController {
    async getUserProfile(req: Request, res: Response) {
        const userId = req.params.id;
        const user = await this.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }

    async getUserById(id: string) {
        return await User.findById(id);
    }

    async login(req: Request, res: Response) {
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

    async refreshToken(req: Request, res: Response) {
        const token = req.cookies?.refresh_token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

            const accessToken = signAccessToken({ sub: decoded.sub });

            // Optionally rotate refresh token
            const newRefresh = signRefreshToken({ sub: decoded.sub });
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
}

export default new UserController();

