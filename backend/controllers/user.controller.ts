import User, { UserDocument } from "../models/User";
import { Request, Response } from "express";
import { signAccessToken, signRefreshToken } from "../helpers/jwt.helper";
import { loginDTO } from "../validation/user.validation";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


class UserController {
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
        const body = req.body as loginDTO;
        const { email, password } = body;
        const user = await User.findOne({ email }).select("+password") as UserDocument | null;

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
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
            httpOnly: true,    // prevents React from reading it
            secure: false,     // must be false in localhost (HTTPS would require true)
            sameSite: "lax",  // allows cross-origin sending
            path: "/"
        });

        res.json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    }

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email,
                password: hashedPassword
            });
            await user.save();
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server error", error });
        }
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
                httpOnly: true,    // prevents React from reading it
                secure: false,     // must be false in localhost (HTTPS would require true)
                sameSite: "lax",  // allows cross-origin sending
                path: "/"
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
}

export default new UserController();

