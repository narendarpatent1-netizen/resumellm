
import api from "../utils/api.utils";

export async function login(email: string, password: string) {
    const res = await api.post("auth/login", { email, password });
    return res.data;
}