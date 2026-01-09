import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { extractText } from "../helpers/groq.helper";

const API_KEY = process.env.GROQ_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (!API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env");
}

const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY!,
    model: "llama-3.1-8b-instant",
    baseUrl: "https://api.groq.com",
});

export async function generateQuestion(text: string) {
    const prompt = `
Generate one interview question strictly from this resume or text:

${text}

Return only the question.
`;

    const res = await llm.invoke(prompt);

    return typeof res.content === "string"
        ? res.content
        : (res.content as any[]).map(p => p.text).join("");
}

export async function checkExitIntentLLM(text: string) {

    const prompt = `
You are an interview assistant. Determine if the user wants to end or exit the interview.
Answer ONLY "YES" if the user wants to exit, otherwise answer "NO".

User's response: "${text}"
    `;;

    const res = await llm.invoke(prompt);

    return typeof res.content === "string"
        ? res.content
        : (res.content as any[]).map(p => p.text).join("");
}


export async function evaluateAnswer(resumeText: string, question: string, userAnswer: string) {

    const prompt = `
        You are an interview evaluator.

        Resume:
        ${resumeText}

        Question:
        ${question}

        User Answer:
        ${userAnswer}

        Evaluation Rules:
        - Judge ONLY based on the given question and answer.
        - Do NOT use resume knowledge unless relevant to judging correctness.

        EXIT RULE:
        - If the user clearly wants to STOP / EXIT / END the interview:
        Result: EXIT_PENDING
        Reason: User requested to exit the interview
        Score: 0/10
        NextAction: CONFIRM_EXIT
        NextQuestion: NONE

        CORRECT ANSWER RULE:
        - If the answer correctly and sufficiently addresses the question:
        Result: ACCEPTED
        Reason: <short explanation>
        Score: <x>/10
        NextAction: ASK_NEXT
        NextQuestion: <generate a NEW interview question>

        INCORRECT ANSWER RULE:
        - If the answer is incomplete, vague, or incorrect:
        Result: INCORRECT
        Reason: <short explanation>
        Score: <x>/10
        NextAction: RETRY
        NextQuestion: <ask the user to improve or clarify the SAME question>

        IMPORTANT CONSTRAINTS:
        - When Result = ACCEPTED → MUST generate a new interview question
        - When Result = INCORRECT → MUST ask the user to retry the SAME question
        - When Result = EXIT_PENDING → confirmation flow ONLY
        - NEVER skip NextQuestion unless EXIT_PENDING
        - Follow the output format EXACTLY

        Output format (STRICT — no markdown, no extra text):

        Result: ACCEPTED or INCORRECT or EXIT_PENDING
        Reason: <short explanation>
        Score: <x>/10
        NextAction: ASK_NEXT or RETRY or CONFIRM_EXIT
        NextQuestion: <question or NONE>
        `;


    const res = await llm.invoke(prompt);
    const output = typeof res === "string" ? res : (res.content ?? "").toString();

    const resultMatch = output.match(/Result:\s*(ACCEPTED|INCORRECT|EXIT_PENDING)/i);
    const scoreMatch = output.match(/Score:\s*(\d+(?:\.\d+)?)\/10/i);
    const actionMatch = output.match(/NextAction:\s*(.*)/i);
    const nextQMatch = output.match(/NextQuestion:\s*(.*)/i);

    let result = resultMatch?.[1]?.toUpperCase() ?? "UNKNOWN";

    // 🔒 Hard fallback — detect exit intent manually
    const exitIntents = ["exit", "quit", "stop", "end", "leave"];
    const wantsExit = exitIntents.some(word =>
        new RegExp(`\\b${word}\\b`, "i").test(userAnswer)
    );

    if (wantsExit) {
        result = "EXIT_PENDING";
    }

    const nextAction =
        result === "ACCEPTED"
            ? "ASK_NEXT"
            : result === "EXIT_PENDING"
                ? "CONFIRM_EXIT"
                : "RETRY";

    const nextQuestion =
        result === "EXIT_PENDING"
            ? "NONE"
            : nextQMatch?.[1]?.trim() ?? "NONE";

    return {
        raw: output.trim(),
        result,
        isCorrect: result === "ACCEPTED",
        score: scoreMatch ? Number(scoreMatch[1]) : 0,
        nextAction,
        nextQuestion
    };
}


