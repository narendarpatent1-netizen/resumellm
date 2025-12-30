import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        (req as any).user = decoded;
        return next();
    } catch {
        return res.status(401).json({ message: "Token expired or invalid" });
    }
};


export default requireAuth;
