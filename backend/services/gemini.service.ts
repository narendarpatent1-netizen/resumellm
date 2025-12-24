import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash"; // <-- change if your project exposes a different model

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
}

async function askGemini(prompt: string): Promise<string> {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        console.error("Gemini API error:", data);
        throw new Error(data.error?.message || "Gemini request failed");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function generateQuestion(resumeText: string) {
    return askGemini(`
Ask one interview question strictly from this resume:
${resumeText}
`);
}

export async function evaluateAnswer(
    resumeText: string,
    question: string,
    userAnswer: string
) {
    return askGemini(`
Resume:
${resumeText}

Question:
${question}

User Answer:
${userAnswer}

TASK:
- Say ACCEPTED or INCORRECT
- Explain mistakes
- Give correct answer
- Score out of 10
`);
}
