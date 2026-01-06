import { getUserIdFromToken } from "../utils/auth.utils";
import api from "../utils/api.utils";

export async function uploadResume(file: File) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);
    const res = await api.post("/upload", formData);
    console.log(res);
    return false;
    return res.data;
}

export async function getChatHistory(resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.get(`/history?userId=${userId}&resumeId=${resumeId}`);
    return res.data;
}

export async function getQuestion(resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.post("/question", { userId, resumeId });
    return res.data;
}

export async function submitAnswer(question: string, answer: string, questionId: string, resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.post("/answer", { question, answer, questionId, resumeId });
    return res.data;
}