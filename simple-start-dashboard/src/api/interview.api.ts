const BASE_URL = "http://localhost:3000/api/interview";

export async function uploadResume(file: File) {
    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData
    });

    return res.json();
}

export async function getQuestion() {
    const res = await fetch(`${BASE_URL}/question`, {
        method: "POST"
    });

    return res.json();
}

export async function submitAnswer(question: string, answer: string) {
    const res = await fetch(`${BASE_URL}/answer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question, answer })
    });

    return res.json();
}