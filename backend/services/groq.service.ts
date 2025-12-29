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


export async function evaluateAnswer(
    resumeText: string,
    question: string,
    userAnswer: string
) {
    const prompt = `
You are an interview evaluator.

Resume:
${resumeText}

Question:
${question}

User Answer:
${userAnswer}

Evaluation Rules:
- Judge ONLY based on the question and answer (no assumptions)
- If the answer is mostly correct → mark ACCEPTED
- If the answer is wrong, incomplete, or irrelevant → mark INCORRECT
- Give a short explanation
- Give a score out of 10
- If INCORRECT → politely ask the candidate to improve the answer
  (Ask them to provide a clearer or more accurate response)
- If ACCEPTED → ask the next interview question from the resume

Output format (strict):

Result: ACCEPTED or INCORRECT
Reason: <short explanation>
Score: <x>/10
NextAction: <message asking user to correct the answer if INCORRECT, otherwise say NONE>
NextQuestion: <next interview question only if ACCEPTED, otherwise say NONE>
`;

    const res = await llm.invoke(prompt);
    const output =
        typeof res === "string" ? res : (res.content ?? "").toString();

    const resultMatch = output.match(/Result:\s*(ACCEPTED|INCORRECT)/i);
    const scoreMatch = output.match(/Score:\s*(\d+(?:\.\d+)?)\/10/i);
    const actionMatch = output.match(/NextAction:\s*(.*)/i);
    const nextQMatch = output.match(/NextQuestion:\s*(.*)/i);

    const result = resultMatch?.[1].toUpperCase() ?? "UNKNOWN";
    const score = scoreMatch ? Number(scoreMatch[1]) : null;
    const nextAction = actionMatch?.[1]?.trim() ?? null;
    const nextQuestion = nextQMatch?.[1]?.trim() ?? null;

    return {
        raw: output.trim(),
        result,
        isCorrect: result === "ACCEPTED",
        score,
        nextAction,
        nextQuestion,
    };
}


