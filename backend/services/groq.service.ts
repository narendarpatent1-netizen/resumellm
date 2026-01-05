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
    - Judge ONLY based on the question and answer

    - If the user wants to STOP / EXIT / END:
    Result: EXIT_PENDING
    Reason: User requested to exit the interview
    Score: 0/10
    NextAction: CONFIRM_EXIT
    NextQuestion: NONE

    - When EXIT_PENDING is returned:
    • Do NOT ask follow-up questions
    • Do NOT give feedback
    • Only trigger confirmation flow

    - Otherwise evaluate normally.

    Output format (strict):

    Result: ACCEPTED or INCORRECT or EXIT_PENDING
    Reason: <short explanation>
    Score: <x>/10
    NextAction: <text or NONE>
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
    const wantsExit = exitIntents.some(x =>
        userAnswer.toLowerCase().includes(x)
    );

    if (wantsExit && result !== "EXIT_PENDING") {
        result = "EXIT_PENDING";
    }

    return {
        raw: output.trim(),
        result,
        isCorrect: result === "ACCEPTED",
        score: scoreMatch ? Number(scoreMatch[1]) : 0,
        nextAction: actionMatch?.[1]?.trim() ?? "NONE",
        nextQuestion: nextQMatch?.[1]?.trim() ?? "NONE"
    };
}


