const BASE_URL = "http://localhost:3000/api/interview";
import { getUserIdFromToken } from "../utils/auth.utils";

export async function uploadResume(file: File) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);

    const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData
    });

    return res.json();
}

export async function getChatHistory() {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await fetch(`${BASE_URL}/history?userId=${userId}`, {
        method: "GET"
    });

    return res.json();
}

export async function getQuestion() {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await fetch(`${BASE_URL}/question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
    });

    return res.json();
}

export async function submitAnswer(question: string, answer: string, questionId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await fetch(`${BASE_URL}/answer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question, answer, questionId, userId })
    });

    return res.json();
}