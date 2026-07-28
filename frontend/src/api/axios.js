import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 1. INTERCEPTOR REQUEST
// Berjalan SETIAP KALI ada request ke backend
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Jika ada token, pasang di Header Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. INTERCEPTOR RESPONSE
// Berjalan saat menerima respon dari backend
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jika status 401 (Unauthorized), berarti token tidak valid atau expired
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token'); // Hapus token lama
            // Redirect ke halaman login (akan kita buat di Step 5 nanti)
            // Untuk sementara, ini akan error 404 jika belum ada halaman login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;