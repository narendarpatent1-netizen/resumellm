import { Request } from "express";

export async function getClientIp(req: Request): Promise<string> {
    const fwd = req.headers["x-forwarded-for"];

    if (typeof fwd === "string") {
        return fwd.split(",")[0].trim();
    }

    if (Array.isArray(fwd) && fwd.length > 0) {
        return fwd[0].trim();
    }

    return req.socket.remoteAddress ?? "";
}


