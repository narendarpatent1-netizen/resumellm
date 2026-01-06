import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;
    console.log("came to her", token);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!, {
            algorithms: ["HS256"],
            issuer: "my-api",
            audience: "my-client",
        }) as any; // or cast to your JWT payload type
        console.log(decoded);
        (req as any).user = decoded;
        next();
    } catch (err) {
        if (err instanceof TokenExpiredError) return res.status(401).json({ message: "Token expired" });
        if (err instanceof JsonWebTokenError) return res.status(401).json({ message: "Invalid token" });
        return res.status(500).json({ message: "Auth verification failed" });
    }
};

export default requireAuth;
