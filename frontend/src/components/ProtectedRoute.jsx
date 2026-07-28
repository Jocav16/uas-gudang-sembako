import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const { user, loading } = useAuth();

    // Tampilkan loading spinner saat AuthContext mengecek token
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/20 border-t-cyan-400 animate-spin mx-auto"></div>
                    <p className="mt-4 text-blue-200/70">Memeriksa autentikasi...</p>
                </div>
            </div>
        );
    }

    // Jika belum login, paksa redirect ke /login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Jika role diperlukan tapi tidak cocok
    if (requiredRole && user.role !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2"> Akses Ditolak</h2>
                    <p className="text-blue-200/70 mb-6">
                        Anda tidak memiliki hak akses untuk halaman ini.
                        <br />Role diperlukan: <span className="text-cyan-300 font-mono">{requiredRole}</span>
                    </p>
                    <Link
                        to="/items"
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Jika semua kondisi terpenuhi, render halaman yang diminta
    return children;
}