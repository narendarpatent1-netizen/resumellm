import { getUserIdFromToken } from "../utils/auth.utils";
import api from "../utils/api.utils";

export async function uploadResume(file: File) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);
    const res = await api.post("interview/upload", formData);
    console.log(res);
    return res.data;
}

export async function getChatHistory(resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.get(`interview/history?userId=${userId}&resumeId=${resumeId}`);
    return res.data;
}

export async function getQuestion(resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.post("interview/question", { userId, resumeId });
    return res.data;
}

export async function submitAnswer(question: string, answer: string, questionId: string, resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.post("interview/answer", { question, answer, questionId, userId, resumeId });
    return res.data;
}

export async function fetchResult(resumeId: string) {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("User not logged in");
    const res = await api.post("interview/fetchResult", { id: userId, resumeId });
    return res.data;
}