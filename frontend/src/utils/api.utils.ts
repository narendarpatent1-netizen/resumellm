import axios from "axios";

axios.defaults.withCredentials = true;

let accessToken = localStorage.getItem("access_token");

export const setAccessToken = (token: string) => {
    accessToken = token;
    localStorage.setItem("access_token", token);
};

export const getAccessToken = () => {
    return localStorage.getItem("access_token");
}

export const clearAuth = () => {
    accessToken = null;
    localStorage.removeItem("access_token");
};

const api = axios.create({
    baseURL: "http://localhost:4000/api/",
    withCredentials: true
});

// Add Authorization header to all requests
api.interceptors.request.use((config) => {
    if (accessToken) {
        console.log(accessToken);
        config.headers!["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
});


let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) =>
        error ? prom.reject(error) : prom.resolve(token)
    );
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry // prevent infinite loop
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers["Authorization"] = "Bearer " + token;
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    "http://localhost:4000/api/auth/refresh",
                    {}
                );


                const newAccessToken = data.accessToken;
                setAccessToken(newAccessToken);

                api.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;
                originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                clearAuth();
                window.location.href = "/"; // logout user
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
