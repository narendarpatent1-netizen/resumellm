import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!, {
            algorithms: ["HS256"],
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
        });

        (req as any).user = decoded;
        return next();

    } catch (err: any) {
        console.error("JWT verify failed:", err?.name, err?.message);

        // IMPORTANT: Always return 401 on verify failure
        return res.status(401).json({
            message:
                err?.name === "TokenExpiredError"
                    ? "Token expired"
                    : "Invalid or malformed token",
        });
    }
};

export default requireAuth;
