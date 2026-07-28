import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../api/userService';
import toast from 'react-hot-toast';
import { Shield, Users, Search, Loader2, Trash2, Pencil } from 'lucide-react';

function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await userService.getAll();
            setUsers(res.data || []);
        } catch (err) {
            toast.error('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, currentRole, newRole) => {
        if (currentRole === newRole) return;
        if (!window.confirm(`Ubah role menjadi "${newRole}"?`)) return;

        setUpdating(id);
        try {
            await userService.updateRole(id, newRole);
            toast.success('Role berhasil diperbarui');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah role');
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin hapus user ini? Data tidak bisa dikembalikan.')) return;
        try {
            await userService.delete(id);
            toast.success('User berhasil dihapus');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus user');
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
        <div className="py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Shield className="w-8 h-8 text-cyan-400" />
                        Manajemen User
                    </h2>
                    <p className="text-blue-200/60 text-sm mt-1">Kelola hak akses pengguna sistem gudang</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-200/70 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Users className="w-4 h-4" />
                    <span>Total User: <strong className="text-white">{users.length}</strong></span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <Search className="w-5 h-5 text-blue-200/50" />
                <input
                    type="text"
                    placeholder="Cari nama atau email user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-blue-200/40 focus:outline-none"
                />
            </div>

            {/* Table */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Nama</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Role Saat Ini</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Dibuat</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Ubah Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-blue-200/50">
                                        Tidak ada user yang ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-white">{u.name}</td>
                                        <td className="px-6 py-4 text-sm text-blue-200/70">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${u.role === 'admin'
                                                ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20'
                                                : 'bg-blue-400/10 text-blue-300 border-blue-400/20'
                                                }`}>
                                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-blue-200/60">
                                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRoleChange(u.id, u.role, 'admin')}
                                                    disabled={updating === u.id || user.id === u.id}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${u.role === 'admin'
                                                        ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30 cursor-default'
                                                        : 'bg-white/5 text-cyan-300 border-white/10 hover:bg-cyan-400/10'
                                                        } ${updating === u.id ? 'opacity-50 cursor-not-allowed' : ''} ${user.id === u.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(u.id, u.role, 'staff')}
                                                    disabled={updating === u.id || user.id === u.id}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${u.role === 'staff'
                                                        ? 'bg-blue-400/20 text-blue-200 border-blue-400/30 cursor-default'
                                                        : 'bg-white/5 text-blue-300 border-white/10 hover:bg-blue-400/10'
                                                        } ${updating === u.id ? 'opacity-50 cursor-not-allowed' : ''} ${user.id === u.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                >
                                                    Staff
                                                </button>
                                            </div>
                                            {user.id === u.id && (
                                                <p className="text-xs text-amber-300/70 mt-1">Akun Anda</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/users/${u.id}/edit`}
                                                    className="p-2 rounded-lg border border-white/10 bg-white/5 text-blue-300 hover:bg-blue-400/10 transition-all inline-flex items-center"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={user?.id === u.id}
                                                    className={`p-2 rounded-lg border transition-all ${user?.id === u.id ? 'bg-white/5 text-gray-500 border-white/5 cursor-not-allowed' : 'bg-white/5 text-red-300 border-white/10 hover:bg-red-400/10'}`}
                                                    title={user?.id === u.id ? "Tidak dapat menghapus akun sendiri" : "Hapus"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-blue-200/60 flex justify-between">
                    <span>Menampilkan {filteredUsers.length} user</span>
                    <span className="font-mono">Filter: {search || 'Semua'}</span>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;