import { Router } from "express";
import User from "../models/User";
import requireAuth from "../middleware/jwt.middleware";
import { getClientIp } from "../helpers/clientip.helper";
import Interview from "../models/Interview";
import userController from "../controllers/user.controller";
import bcrypt from "bcrypt";

const router = Router();
// const upload = multer({ dest: "uploads/" });

router.post("/login", userController.login);

router.post("/register", async (req, res) => {
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
        res.status(500).json({ message: "Server error", error });
    }
});

export default router;
