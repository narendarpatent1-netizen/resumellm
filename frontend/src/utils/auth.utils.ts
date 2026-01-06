export function getUserIdFromToken(): string | null {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId || payload.sub || payload._id || null;
    } catch {
        return null; // token malformed
    }
}

export const setAccessToken = (token) => {
    localStorage.setItem("access_token", token);
}

export const getAccessToken = () => {
    return localStorage.getItem("access_token");
}

export const clearAuth = () => {
    localStorage.removeItem("access_token");
}
