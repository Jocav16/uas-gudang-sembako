import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import itemService from '../api/itemService';

function ItemDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await itemService.getById(id);
                setItem(response.data);
            } catch (err) {
                setError(true);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/20 border-t-cyan-400 animate-spin"></div>
                    <p className="mt-4 text-blue-200/70">Memuat detail barang...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 rounded-2xl p-12 text-center">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Data Barang Tidak Ditemukan</h3>
                    <p className="text-blue-200/60 mb-6">Barang yang Anda cari mungkin telah dihapus atau tidak ada.</p>
                    <Link
                        to="/items"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
                    >
                        &larr; Kembali ke Daftar Barang
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Detail Barang</h2>
                    <p className="text-blue-200/60 text-sm mt-1">Informasi lengkap mengenai barang sembako</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/items"
                        className="px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium"
                    >
                        &larr; Kembali
                    </Link>
                    <Link
                        to={`/items/${item.id}/edit`}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all font-medium"
                    >
                        Edit Barang
                    </Link>
                </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10 px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                        <p className="text-blue-200/70 text-sm mt-1">
                            Kategori: <span className="text-cyan-300 font-medium">{item.category?.name || 'Tanpa Kategori'}</span>
                        </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusBadge(item.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`}></span>
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Tersedia'}
                    </span>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 border-l-4 border-l-cyan-500">
                            <p className="text-blue-200/60 text-xs uppercase tracking-wide mb-1">Stok Tersedia</p>
                            <p className="text-3xl font-bold text-white">
                                {item.stock} <span className="text-base font-normal text-blue-200/70">{item.unit}</span>
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 border-l-4 border-l-blue-500">
                            <p className="text-blue-200/60 text-xs uppercase tracking-wide mb-1">Harga Satuan</p>
                            <p className="text-3xl font-bold text-white">{formatRupiah(item.price)}</p>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-5 border-l-4 border-l-amber-500">
                            <p className="text-amber-200/80 text-xs uppercase tracking-wide mb-1">Total Nilai Aset</p>
                            <p className="text-3xl font-bold text-amber-300">
                                {formatRupiah(item.stock * item.price)}
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 border-l-4 border-l-gray-500">
                            <p className="text-blue-200/60 text-xs uppercase tracking-wide mb-1">Terakhir Diperbarui</p>
                            <p className="text-lg font-medium text-white">
                                {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-blue-200/60 text-xs uppercase tracking-wide mb-2">Deskripsi</p>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-blue-100/90 min-h-[100px] leading-relaxed">
                                {item.description || <span className="italic text-blue-200/40">Tidak ada deskripsi untuk barang ini.</span>}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemDetail;