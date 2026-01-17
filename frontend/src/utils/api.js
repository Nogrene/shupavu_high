import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'https://shupavu-high.onrender.com/api';

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
