import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import itemService from '../api/itemService';
import categoryService from '../api/categoryService';
import stockMutationService from '../api/stockMutationService';
import { useAuth } from '../context/AuthContext';

function ItemList() {
    const [searchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mutations, setMutations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category_id: '',
        search: '',
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'asc',
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchCategories();
        fetchItems();
        fetchMutations();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await itemService.getAll(filters);
            setItems(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMutations = async () => {
        try {
            const response = await stockMutationService.getAll();
            setMutations(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus barang "${name}"?`)) {
            try {
                await itemService.delete(id);
                toast.success(`Barang "${name}" berhasil dihapus`);
                fetchItems();
                fetchMutations();
            } catch (err) {
                toast.error('Gagal menghapus barang');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    const getSortedItems = () => {
        const sorted = [...items].sort((a, b) => {
            const { key, direction } = sortConfig;
            let valueA = a[key];
            let valueB = b[key];

            if (key === 'category') {
                valueA = a.category?.name || '';
                valueB = b.category?.name || '';
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

    const totalItems = items.length;
    const totalStock = items.reduce((acc, item) => acc + Number(item.stock), 0);
    const totalAssetValue = items.reduce((acc, item) => acc + (Number(item.stock) * Number(item.price)), 0);

    const updateStatus = async (item, newStatus) => {
        try {
            let newStock = item.stock;

            if (newStatus === 'habis') {
                newStock = 0;
            } else if (newStatus === 'tersedia') {
                newStock = (item.stock === 0 || item.stock === null) ? 1 : item.stock;
            }

            const updatedData = {
                category_id: item.category_id,
                name: item.name,
                description: item.description || '',
                stock: newStock,
                price: item.price,
                unit: item.unit,
                status: newStatus
            };

            await itemService.update(item.id, updatedData);
            toast.success(`Status diubah ke ${newStatus} | Stok: ${newStock}`);
            fetchItems();
            fetchMutations();
        } catch (err) {
            toast.error('Gagal mengubah status');
            console.error(err);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tersedia': return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20';
            case 'habis': return 'bg-red-400/10 text-red-300 border-red-400/20';
            case 'promo': return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
            default: return 'bg-gray-400/10 text-gray-300 border-gray-400/20';
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'tersedia': return 'bg-cyan-400';
            case 'habis': return 'bg-red-400';
            case 'promo': return 'bg-amber-400';
            default: return 'bg-gray-400';
        }
    };

    const sortedItems = getSortedItems();

    const displayedItemIds = items.map(item => item.id);
    const filteredMutations = mutations.filter(m => displayedItemIds.includes(m.item_id));

    const totalMasuk = filteredMutations.filter(m => m.type === 'masuk').reduce((acc, m) => acc + m.quantity, 0);
    const totalKeluar = filteredMutations.filter(m => m.type === 'keluar').reduce((acc, m) => acc + m.quantity, 0);

    const recentMutations = filteredMutations.slice(0, 5);

    const buildSeeAllUrl = () => {
        const params = new URLSearchParams();
        if (filters.category_id) params.set('category_id', filters.category_id);
        if (filters.search) params.set('search', filters.search);
        const qs = params.toString();
        return qs ? `/stock-mutations?${qs}` : '/stock-mutations';
    };

    return (
        <div className="py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Daftar Barang Sembako
                    </h2>
                    <p className="text-blue-200/60 text-sm mt-1">
                        Kelola stok, harga, dan status barang gudang Anda
                    </p>
                </div>
                <div className="flex gap-3">
                    {user && user.role === 'admin' && (
                        <Link
                            to="/items/create"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all shadow-lg"
                        >
                            <span className="text-lg">+</span>
                            <span className="font-medium">Tambah Barang</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-blue-100/80 text-sm font-semibold mb-2">Cari Barang</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Ketik nama barang..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-blue-100/80 text-sm font-semibold mb-2">Filter Kategori</label>
                    <select
                        name="category_id"
                        value={filters.category_id}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
                    >
                        <option value="" className="bg-slate-800">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-slate-800">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-blue-500">
                    <p className="text-blue-200/60 text-sm">Total Jenis Barang</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{totalItems}</h3>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-cyan-500">
                    <p className="text-blue-200/60 text-sm">Total Stok Fisik</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{totalStock} <span className="text-base font-normal text-blue-200/60">Unit</span></h3>
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 border-l-4 border-l-amber-500">
                    <p className="text-blue-200/60 text-sm">Estimasi Nilai Aset</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{formatRupiah(totalAssetValue)}</h3>
                </div>
            </div>

            {sortConfig.key !== 'id' && (
                <div className="mb-4 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-blue-100 flex items-center gap-2">
                    <span className="opacity-70">Diurutkan:</span>
                    <span className="font-semibold text-cyan-300">
                        {sortConfig.key === 'category' ? 'Kategori' :
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
            ) : sortedItems.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                        <svg className="w-8 h-8 text-blue-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Tidak ada barang yang ditemukan</h3>
                    <p className="text-blue-200/60 text-sm mt-1">Coba ubah filter atau tambah barang baru.</p>
                </div>
            ) : (
                <>
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <SortableHeader label="ID" sortKey="id" />
                                        <SortableHeader label="Nama Barang" sortKey="name" />
                                        <SortableHeader label="Kategori" sortKey="category" />
                                        <SortableHeader label="Stok" sortKey="stock" />
                                        <SortableHeader label="Harga" sortKey="price" />
                                        <SortableHeader label="Satuan" sortKey="unit" />
                                        <SortableHeader label="Status" sortKey="status" />
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sortedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300/80 font-mono">
                                                #{String(item.id).padStart(3, '0')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/items/${item.id}`}
                                                    className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors block"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="text-xs text-blue-200/50 mt-1 truncate max-w-xs">{item.description}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/20">
                                                    {item.category?.name || 'Tanpa Kategori'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                                                {item.stock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100/90">
                                                {formatRupiah(item.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200/70">
                                                {item.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(item.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`}></span>
                                                    {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Tersedia'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <button
                                                        onClick={() => updateStatus(item, 'tersedia')}
                                                        className="px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/20 transition-all"
                                                        title="Tandai Tersedia"
                                                    >
                                                        Tersedia
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(item, 'habis')}
                                                        className="px-2.5 py-1 text-xs font-medium text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all"
                                                        title="Tandai Habis"
                                                    >
                                                        Habis
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(item, 'promo')}
                                                        className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all"
                                                        title="Tandai Promo"
                                                    >
                                                        Promo
                                                    </button>

                                                    <span className="text-white/20 mx-1">|</span>

                                                    <Link
                                                        to={`/items/${item.id}/edit`}
                                                        className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {/* 🔒 Tombol Hapus: HANYA untuk Admin */}
                                                    {user?.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.name)}
                                                            className="px-2.5 py-1 text-xs font-medium text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-blue-200/60 flex justify-between items-center">
                            <span>Menampilkan {sortedItems.length} barang</span>
                            <span className="font-mono">Total: {items.length}</span>
                        </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    Track Record Barang Masuk & Keluar
                                </h3>
                                <p className="text-blue-200/60 text-sm mt-1">
                                    5 riwayat mutasi terbaru untuk barang yang ditampilkan
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-white/10">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 border-l-4 border-l-blue-500">
                                <p className="text-blue-200/60 text-sm">Total Transaksi</p>
                                <h4 className="text-2xl font-bold text-white mt-1">{filteredMutations.length}</h4>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 border-l-4 border-l-green-500">
                                <p className="text-blue-200/60 text-sm">Total Barang Masuk</p>
                                <h4 className="text-2xl font-bold text-green-300 mt-1">+{totalMasuk}</h4>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 border-l-4 border-l-red-500">
                                <p className="text-blue-200/60 text-sm">Total Barang Keluar</p>
                                <h4 className="text-2xl font-bold text-red-300 mt-1">-{totalKeluar}</h4>
                            </div>
                        </div>

                        {filteredMutations.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                                    <svg className="w-8 h-8 text-blue-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h4 className="text-white font-semibold text-lg">Belum ada riwayat mutasi</h4>
                                <p className="text-blue-200/60 text-sm mt-1">Mulai catat barang masuk/keluar untuk melihat riwayat di sini.</p>
                                <Link
                                    to="/stock-mutations/create"
                                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all font-medium"
                                >
                                    <span>📥</span>
                                    <span>Input Mutasi Stok</span>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                                    Tanggal & Waktu
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                                    Nama Barang
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                                    Kategori
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                                    Tipe
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                                    Jumlah
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200/80 uppercase tracking-wider">
                                                    Catatan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {recentMutations.map((mutation) => (
                                                <tr key={mutation.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200/70">
                                                        {formatDate(mutation.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/items/${mutation.item_id}`}
                                                            className="text-sm font-medium text-white hover:text-cyan-300 transition-colors"
                                                        >
                                                            {mutation.item?.name || 'Barang Dihapus'}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/20">
                                                            {mutation.item?.category?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${mutation.type === 'masuk'
                                                            ? 'bg-green-400/10 text-green-300 border-green-400/20'
                                                            : 'bg-red-400/10 text-red-300 border-red-400/20'
                                                            }`}>
                                                            {mutation.type === 'masuk' ? 'Masuk' : 'Keluar'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                        <span className={mutation.type === 'masuk' ? 'text-green-300' : 'text-red-300'}>
                                                            {mutation.type === 'masuk' ? '+' : '-'}{mutation.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-blue-200/60 max-w-xs truncate">
                                                        {mutation.note || <span className="italic opacity-50">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-xs text-blue-200/60 flex justify-between items-center">
                                    <span>
                                        Menampilkan {recentMutations.length} dari {filteredMutations.length} riwayat mutasi terbaru
                                    </span>
                                    {filteredMutations.length > 5 && (
                                        <Link
                                            to={buildSeeAllUrl()}
                                            className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-medium"
                                        >
                                            Lihat Semua Riwayat
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}

                        {filteredMutations.length > 5 && (
                            <div className="sm:hidden px-6 py-4 border-t border-white/10">
                                <Link
                                    to={buildSeeAllUrl()}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/20 transition-all"
                                >
                                    Lihat Semua Riwayat ({filteredMutations.length} record)
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ItemList;