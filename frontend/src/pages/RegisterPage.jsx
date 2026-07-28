import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
        if (submitError) setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setSubmitError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-md">
                {/* Card Register */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/20 mb-4">
                            <Package className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Buat Akun Baru</h2>
                        <p className="text-blue-200/60 text-sm mt-1">Daftar untuk mulai mengelola gudang</p>
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                        <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {submitError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-400/50' : 'border-white/10'
                                        } text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all`}
                                    placeholder="Gunawan WN"
                                    required
                                />
                            </div>
                            {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name[0]}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${errors.email ? 'border-red-400/50' : 'border-white/10'
                                        } text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all`}
                                    placeholder="admin@gudang.com"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email[0]}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${errors.password ? 'border-red-400/50' : 'border-white/10'
                                        } text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all`}
                                    placeholder="••••••••"
                                    minLength={8}
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-blue-100/90 text-sm font-semibold mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50" />
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${errors.password_confirmation ? 'border-red-400/50' : 'border-white/10'
                                        } text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all`}
                                    placeholder="••••••••"
                                    minLength={8}
                                    required
                                />
                            </div>
                            {errors.password_confirmation && <p className="text-red-300 text-xs mt-1">{errors.password_confirmation[0]}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    <span>Mendaftar...</span>
                                </>
                            ) : (
                                <>
                                    <span>Buat Akun</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-blue-200/60 text-sm">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="text-cyan-300 hover:text-cyan-200 font-medium">
                                Masuk sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;