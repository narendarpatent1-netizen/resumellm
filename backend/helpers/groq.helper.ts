import { Request } from "express";

export async function extractText(res: any): Promise<string> {
    const c = res?.content;

    if (typeof c === "string") {
        return c;
    }

    if (Array.isArray(c)) {
        return c
            .map(p => (typeof p === "string" ? p : p?.text ?? ""))
            .join("");
    }

    return String(c ?? "");
}