import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'https://shupavu-high.onrender.com/api';

// Ensure baseUrl is string and remove trailing slash from the base (not the /api part if it exists)
if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
}

const api = axios.create({
    baseURL: baseUrl,
});

export const FILE_BASE_URL = baseUrl.endsWith('/api')
    ? baseUrl.slice(0, -4)
    : baseUrl;

api.interceptors.request.use((config) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
    } catch (err) {
        // ignore parse errors
    }
    return config;
});

export default api;
