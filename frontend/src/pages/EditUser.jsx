import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import userService from '../api/userService';
import toast from 'react-hot-toast';
import { User, Mail, Shield, ArrowLeft, Loader2 } from 'lucide-react';

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', role: 'staff' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await userService.getAll();
            const user = res.data.find(u => u.id == id);
            if (!user) throw new Error('User tidak ditemukan');
            setFormData({ name: user.name, email: user.email, role: user.role });
        } catch (err) {
            toast.error(err.message || 'Gagal memuat data user');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        try {
            await userService.update(id, formData);
            toast.success('Data user berhasil diperbarui');
            navigate('/admin/users');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                toast.error(err.response?.data?.message || 'Gagal menyimpan data');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                    <p className="mt-3 text-blue-200/70">Memuat data user...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="flex items-center gap-3 mb-8">
                <Link to="/admin/users" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-5 h-5 text-blue-200" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-white">Edit User</h2>
                    <p className="text-blue-200/60 text-sm">Perbarui informasi akun pengguna</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                {/* Nama */}
                <div>
                    <label className="block text-blue-100/90 text-sm font-semibold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" /> Nama Lengkap
                    </label>
                    <input
                        type="text" name="name" value={formData.name} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-400/50' : 'border-white/10 focus:border-cyan-400/50'} text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all`}
                        placeholder="Nama lengkap user"
                    />
                    {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name[0]}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-blue-100/90 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" /> Email
                    </label>
                    <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.email ? 'border-red-400/50' : 'border-white/10 focus:border-cyan-400/50'} text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all`}
                        placeholder="email@contoh.com"
                    />
                    {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email[0]}</p>}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-blue-100/90 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" /> Role
                    </label>
                    <select
                        name="role" value={formData.role} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
                    >
                        <option value="admin" className="bg-slate-800">Administrator</option>
                        <option value="staff" className="bg-slate-800">Staff</option>
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => navigate('/admin/users')} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-blue-100 hover:bg-white/10 transition-all">Batal</button>
                    <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 transition-all flex items-center gap-2">
                        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUser;