import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../api/categoryService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'asc',
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAll();
            setCategories(response.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data kategori');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            try {
                await categoryService.delete(id);
                toast.success(`Kategori "${name}" berhasil dihapus`);
                fetchCategories();
            } catch (err) {
                toast.error('Gagal menghapus kategori');
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            setSortConfig({ key: 'id', direction: 'asc' });
            return;
        }
        setSortConfig({ key, direction });
    };

    const getSortedCategories = () => {
        const sorted = [...categories].sort((a, b) => {
            const { key, direction } = sortConfig;
            let valueA = a[key];
            let valueB = b[key];

            if (key === 'items') {
                valueA = a.items?.length || 0;
                valueB = b.items?.length || 0;
            }

            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            } else {
                valueA = Number(valueA) || 0;
                valueB = Number(valueB) || 0;
            }

            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <span className="ml-1 opacity-40">⇅</span>;
        }
        return sortConfig.direction === 'asc'
            ? <span className="ml-1 text-cyan-300">↑</span>
            : <span className="ml-1 text-cyan-300">↓</span>;
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th
            className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 select-none transition-colors"
            onClick={() => handleSort(sortKey)}
            title="Klik untuk mengurutkan"
        >
            <div className="flex items-center">
                {label}
                {getSortIcon(sortKey)}
            </div>
        </th>
    );

    const sortedCategories = getSortedCategories();

    return (
        <div className="py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Daftar Kategori
                    </h2>
                    <p className="text-blue-200/60 text-sm mt-1">
                        Kelola kategori barang sembako Anda
                    </p>
                </div>
                {user && user.role === 'admin' && (
                    <Link
                        to="/categories/create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all shadow-lg"
                    >
                        <span className="text-lg">+</span>
                        <span className="font-medium">Tambah Kategori</span>
                    </Link>
                )}
            </div>

            {sortConfig.key !== 'id' && (
                <div className="mb-4 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-blue-100 flex items-center gap-2">
                    <span className="opacity-70">Diurutkan:</span>
                    <span className="font-semibold text-cyan-300">
                        {sortConfig.key === 'items' ? 'Jumlah Item' :
                            sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)}
                    </span>
                    <span className="opacity-50">
                        ({sortConfig.direction === 'asc' ? 'Naik ↑' : 'Turun ↓'})
                    </span>
                    <button
                        onClick={() => setSortConfig({ key: 'id', direction: 'asc' })}
                        className="ml-auto text-cyan-300 hover:text-cyan-200 font-medium"
                    >
                        Reset
                    </button>
                </div>
            )}

            {loading ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/20 border-t-cyan-400 animate-spin"></div>
                    <p className="mt-4 text-blue-200/70">Memuat data...</p>
                </div>
            ) : error ? (
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 text-red-200 px-6 py-4 rounded-2xl">
                    {error}
                </div>
            ) : categories.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                        <svg className="w-8 h-8 text-blue-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Belum ada kategori</h3>
                    <p className="text-blue-200/60 text-sm mt-1">Silakan tambah kategori baru untuk memulai.</p>
                </div>
            ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <SortableHeader label="ID" sortKey="id" />
                                    <SortableHeader label="Nama Kategori" sortKey="name" />
                                    <SortableHeader label="Deskripsi" sortKey="description" />
                                    <SortableHeader label="Jumlah Item" sortKey="items" />
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300/80 font-mono">
                                            #{String(category.id).padStart(3, '0')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white hover:text-cyan-300 transition-colors">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-blue-200/60 max-w-xs truncate">
                                            {category.description || <span className="italic opacity-50">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                                {category.items?.length || 0} item
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link
                                                to={`/categories/${category.id}/edit`}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all"
                                            >
                                                Edit
                                            </Link>
                                            {/* 🔒 Tombol Hapus: HANYA untuk Admin */}
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-blue-200/60 flex justify-between items-center">
                        <span>Menampilkan {sortedCategories.length} kategori</span>
                        <span className="font-mono">Total: {categories.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryList;