import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import stockMutationService from '../api/stockMutationService';
import itemService from '../api/itemService';

function StockMutationList() {
    const [mutations, setMutations] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        item_id: '',
        type: '',
    });

    useEffect(() => {
        fetchItems();
        fetchMutations();
    }, [filters]);

    const fetchItems = async () => {
        try {
            const response = await itemService.getAll();
            setItems(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMutations = async () => {
        try {
            setLoading(true);
            const response = await stockMutationService.getAll(filters);
            setMutations(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin hapus record ini? Stok akan dikembalikan.')) {
            try {
                await stockMutationService.delete(id);
                toast.success('Record dihapus dan stok dikembalikan');
                fetchMutations();
            } catch (err) {
                toast.error('Gagal menghapus record');
            }
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const totalMasuk = mutations.filter(m => m.type === 'masuk').reduce((acc, m) => acc + m.quantity, 0);
    const totalKeluar = mutations.filter(m => m.type === 'keluar').reduce((acc, m) => acc + m.quantity, 0);

    return (
        <div className="py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Track Record Mutasi Stok</h2>
                    <p className="text-blue-200/60 text-sm mt-1">Riwayat barang masuk dan keluar</p>
                </div>
                <Link
                    to="/stock-mutations/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all font-medium"
                >
                    <span className="text-lg">+</span>
                    <span>Input Mutasi</span>
                </Link>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-blue-100/80 text-sm font-semibold mb-2">Filter Barang</label>
                    <select
                        name="item_id"
                        value={filters.item_id}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
                    >
                        <option value="" className="bg-slate-800">Semua Barang</option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id} className="bg-slate-800">{item.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-blue-100/80 text-sm font-semibold mb-2">Filter Tipe</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
                    >
                        <option value="" className="bg-slate-800">Semua Tipe</option>
                        <option value="masuk" className="bg-slate-800">Barang Masuk</option>
                        <option value="keluar" className="bg-slate-800">Barang Keluar</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-cyan-500">
                    <p className="text-blue-200/60 text-sm">Total Transaksi</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{mutations.length}</h3>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-green-500">
                    <p className="text-blue-200/60 text-sm">Total Barang Masuk</p>
                    <h3 className="text-3xl font-bold text-green-300 mt-1">+{totalMasuk}</h3>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-red-500">
                    <p className="text-blue-200/60 text-sm">Total Barang Keluar</p>
                    <h3 className="text-3xl font-bold text-red-300 mt-1">-{totalKeluar}</h3>
                </div>
            </div>

            {loading ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/20 border-t-cyan-400 animate-spin"></div>
                    <p className="mt-4 text-blue-200/70">Memuat riwayat...</p>
                </div>
            ) : mutations.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                        <svg className="w-8 h-8 text-blue-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Belum ada riwayat mutasi</h3>
                    <p className="text-blue-200/60 text-sm mt-1">Mulai catat barang masuk/keluar untuk melihat riwayat di sini.</p>
                </div>
            ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Barang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Tipe</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Jumlah</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Catatan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {mutations.map((m) => (
                                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200/70">
                                            {formatDate(m.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/items/${m.item_id}`}
                                                className="text-sm font-medium text-white hover:text-cyan-300 transition-colors"
                                            >
                                                {m.item?.name || 'Barang Dihapus'}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/20">
                                                {m.item?.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${m.type === 'masuk'
                                                ? 'bg-green-400/10 text-green-300 border-green-400/20'
                                                : 'bg-red-400/10 text-red-300 border-red-400/20'
                                                }`}>
                                                {m.type === 'masuk' ? 'Masuk' : ' Keluar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                            <span className={m.type === 'masuk' ? 'text-green-300' : 'text-red-300'}>
                                                {m.type === 'masuk' ? '+' : '-'}{m.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-blue-200/60 max-w-xs truncate">
                                            {m.note || <span className="italic opacity-50">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="px-2.5 py-1 text-xs font-medium text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
                                                title="Hapus record & kembalikan stok"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-blue-200/60 flex justify-between items-center">
                        <span>Menampilkan {mutations.length} record</span>
                        <span className="font-mono">Net: {totalMasuk - totalKeluar}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StockMutationList;