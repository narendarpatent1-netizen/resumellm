import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "v1/gemini-2.5-flash" });

    try {
        const result = await model.generateContent("hello");
        console.log(result.response.text());
    } catch (e) {
        console.error("ERROR:", e.message);
        console.error("CAUSE >>>", e?.cause);
    }
}

run();


