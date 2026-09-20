import axios from 'axios';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
});

declare module 'axios' {
    export interface AxiosRequestConfig {
        _skipAuthRefresh?: boolean;
        _retry?: boolean;
    }
}

// Prevent multiple refresh token requests
let refreshPromise: Promise<unknown> | null = null;

apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const req = error.config;

        if (error.response?.status !== 401 || req?._retry || req?._skipAuthRefresh) {
            return Promise.reject(error);
        }

        // is request ko sirf aur sirf 1 baar retry karna, agar dobara fail ho toh loop mat banana, seedha fail kar dena.
        req._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(
                        `${API_BASE_URL}/auth/refresh-access-token`,
                        {},
                        { withCredentials: true }
                    )
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

            return apiClient(req);
        } catch (refreshError) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }

            return Promise.reject(refreshError);
        }
    }
);