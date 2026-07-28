import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Saat aplikasi dimuat, cek apakah user sudah login
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Panggil endpoint /me untuk memvalidasi token dan mengambil data user
                    const response = await api.get('/me');
                    setUser(response.data);
                } catch (err) {
                    // Jika token tidak valid (misal user dihapus), hapus token
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // Fungsi Login
    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const token = response.data.access_token;
        const userData = response.data.user;

        localStorage.setItem('token', token);
        setUser(userData);
        return userData;
    };

    // Fungsi Logout
    const logout = async () => {
        try {
            // Panggil endpoint logout di Laravel untuk mencabut token
            await api.post('/logout');
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    // Tambahkan method ini di dalam AuthContext
    const register = async (payload) => {
        const res = await api.post('/register', payload);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    // Jangan lupa return register di value provider:
    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook agar mudah dipakai di komponen lain
export const useAuth = () => useContext(AuthContext);